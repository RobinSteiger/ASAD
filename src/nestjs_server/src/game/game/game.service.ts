import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {Bet, BoardType, GameState, RoundWinner, User} from './game.interface';
import { CreatePlayerDto } from '../dto/create-player.dto';
import {
  BetResponse,
  RegistrationResponse,
  SpinResponse,
} from '../models/game-response.model';
import { Server } from 'socket.io';
import { GAME_EVENTS } from './game.events';
import { BetActionDto } from '../dto/bet-action.dto';
import { RoundSnapshot } from './game.interface';
import { JsonUserRepository } from '../repository/json_user.repository';
import * as bcrypt from 'bcrypt';
import {LoginPlayerDto} from "../dto/login-player.dto";
import {encryptPayload, decryptPayload} from '../utils/encryption.util';

@Injectable()
export class GameService implements OnModuleInit {


  // Main data storage for the game (The Blackboard)
  private state: GameState = {
    timeLeft: 30,
    users: {},
    boards: {
      european: {
        rngResult: null,
        tableState: [],
        isBettingOpen: true,
        board: {
          type: 'european',
          numbers: Array.from({ length: 37 }, (_, i) => i),
        },
      },
      mini: {
        rngResult: null,
        tableState: [],
        isBettingOpen: true,
        board: {
          type: 'mini',
          numbers: Array.from({ length: 13 }, (_, i) => i),
        },
      },
    }
    // Legacy board kept for compatibility.
    // The real business logic now uses Bet.boardType and User.boardType.
  };

  public socketServer!: Server;
  private readonly logger = new Logger('GameService');
  private readonly ROUND_DURATION = 30;
  // Test Dev
  // private readonly ROUND_DURATION = 1000;


  constructor(private readonly userRepo: JsonUserRepository) {}

  // Restart the server after a crash
  async onModuleInit() {
    // Reload saved users from the JSON file
    const savedUsers = await this.userRepo.findAllUsers();
    for (const user of savedUsers) {
      this.state.users[user.id] = user;
    }
    this.logger.log(`${savedUsers.length} users restored from storage`);
    // Replay unresolved round after a crash
    const unresolved = await this.userRepo.getUnresolvedRound();
    if (unresolved) {
      this.logger.warn(
          `Unresolved round detected (${unresolved.roundId}), replaying payouts...`,
      );
      await this.applyPayouts(unresolved);
      await this.userRepo.markRoundResolved(unresolved.roundId);
      if (unresolved.boardType) {
        setTimeout(() => this.reset(unresolved.boardType), 0);
      }
    }
  }
  // Start the game
  startGameLoop() {
    setInterval(() => {
      const anyOpen = Object.values(this.state.boards).some(b => b.isBettingOpen);

      if (this.state.timeLeft > 0 && anyOpen) {
        // Decrease time every second
        this.state.timeLeft--;
        // Update all players with the new time
        this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, encryptPayload(this.getState()));
      } else if (this.state.timeLeft === 0 && anyOpen) {

        const spinPromises = (['european', 'mini'] as BoardType[])
          .filter(boardType => this.state.boards[boardType].isBettingOpen)
          .map(boardType => this._spinBoard(boardType));

        void Promise.all(spinPromises).then(results => {
          // Émettre un seul événement RESULT groupé avec tous les résultats
          this.socketServer.emit(GAME_EVENTS.RESULT, encryptPayload({
            status: 'success',
            results: results.map(r => ({
              boardType: r.boardType,
              winningNumber: r.winningNumber,
              winners: r.winners,
            })),
            newState: this.getState(),
          }));
        });
      }
    }, 1000);
  }

  // Get the current game state
  getState(): GameState {
    return this.state;
  }

// Handle player registration and create the user
  async handleRegister(encryptedData: string): Promise<string> {
    const dto = decryptPayload(encryptedData) as CreatePlayerDto;
    // Refuse invalid data
    if (!dto || !dto.name || !dto.amount || !dto.password) {
      return encryptPayload({
        status: 'error',
        message: 'Invalid data',
      });
    }
    // Minimum starting balance
    if (dto.amount < 1000) {
      return encryptPayload({
        status: 'error',
        message: 'Minimum 1000 required',
      });
    }
    // Prevent duplicate usernames
    const existingUser = Object.values(this.state.users).find(
        (user) => user.name === dto.name,
    );
    if (existingUser) {
      return encryptPayload({
        status: 'error',
        message: 'That username already exists. Please choose a different one.',
      });
    }
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const uniqueId = `${dto.name}_${Date.now()}`;
    const newUser: User = {
      id: uniqueId,
      name: dto.name,
      // Store hashed password only
      password: hashedPassword,
      balance: dto.amount, // amount entered in the lobby
      // Board is not selected at registration anymore.
      // It will be locked when the player places the first bet.
      boardType: undefined,
    };
    this.state.users[uniqueId] = newUser;
    void this.userRepo.saveUser(newUser);
    return encryptPayload({
      status: 'success',
      user: newUser,
    });
  }

  // Handle player login
  async handleLogin(encryptedData: string) {
    const dto = decryptPayload(encryptedData) as LoginPlayerDto;
    const user = Object.values(this.state.users).find(
        (u) => u.name === dto.name,
    );
    if (!user) {
      return encryptPayload({
        status: 'error',
        message: 'User not found',
      });
    }
    const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.password,
    );
    if (!isPasswordValid) {
      return encryptPayload({
        status: 'error',
        message: 'Incorrect password',
      });
    }
    return encryptPayload({
      status: 'success',
      user,
    });
  }

  // Handle when a player clicks on the board
  handleBetAction(encryptedData: string): BetResponse {
    const dto = decryptPayload(encryptedData) as BetActionDto;
    let isOk = false;

    const user = this.state.users[dto.userId];

    // Check if the number is valid for the selected board
    const isValidNumber = this.isValidNumberForBoard(dto.number, dto.boardType);

    // If the number is not valid, stop here
    if (!isValidNumber) {
      return {
        status: 'error',
        message: 'Invalid number for the selected board',
      };
    }

    // Choose what to do with the bet
    switch (dto.action) {
      case 'place':
        // Amount is required to place a bet
        if (dto.amount === undefined) break;
        isOk = this.placeBet(dto.userId, dto.number, dto.amount, dto.boardType);
        break;

      case 'update':
        // Amount is required to update a bet
        if (dto.amount === undefined) break;
        isOk = this.updateBet(dto.userId, dto.number, dto.amount, dto.boardType);
        break;

      case 'delete':
        // No amount is needed to delete a bet
        isOk = this.removeBet(dto.userId, dto.number, dto.boardType);
        break;

      default:
        // Unknown action
        return {
          status: 'error',
          message: 'Invalid action',
        };
    }

    if (user) {
      this.logger.log(
        `BET ACTION | type=${dto.action} user=${user.name} balance=${user.balance}`,
      );
    }

    // If the action worked, send the new game state
    if (isOk) {
      this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, encryptPayload(this.getState()));
      return { status: 'success' };
    }

    // If something failed, return an error
    return {
      status: 'error',
      message: 'Bet action failed',
    };
  }

  // Process the spin result
  async handleSpinAction(encryptedData?: string): Promise<void | SpinResponse> {

    if (!encryptedData) return;
    const data = decryptPayload(encryptedData) as { boardType: BoardType };
    if (data?.boardType) {
      return this._spinBoard(data.boardType);
    }
  }

  private async _spinBoard(boardType: BoardType): Promise<SpinResponse>{
    // State based on the boardType
    const boardState = this.state.boards[boardType];
    this.logger.log(`SPIN | board=${boardType} bets=${boardState.tableState.length} numbers=${boardState.board.numbers.length}`);
    // Stop all betting before the spin
    boardState.isBettingOpen = false;

    // Get all available numbers from the current board
    const availableNumbers = boardState.board.numbers;

    // Pick a random number from the active board
    boardState.rngResult =
        availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // Save the current round state
    const snapshot: RoundSnapshot = {
      roundId: `round_${boardType}_${Date.now()}`,
      boardType,
      rngResult: boardState.rngResult,
      bets: [...boardState.tableState],
      resolvedAt: null,
    };

    // Save round before payouts
    await this.userRepo.saveRoundSnapshot(snapshot);

    // Apply winnings to players
    const winners = await this.applyPayouts(snapshot);

    // Mark round as resolved
    await this.userRepo.markRoundResolved(snapshot.roundId);

    // Build response for frontend
    this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, encryptPayload(this.getState()));

    setTimeout(() => this.reset(boardType), 5000);

    return {
      status: 'success',
      boardType,
      winningNumber: boardState.rngResult,
      winners,
      newState: this.getState(),
    };
  }


/*  // Create a new user in the system
  async registerUser(dto: CreatePlayerDto): Promise<User | null> {
    if (!dto || !dto.name || !dto.amount || !dto.password) {
      return null;
    }
    // Prevent duplicate usernames
    const existingUser = Object.values(this.state.users).find(
        (user) => user.name === dto.name,
    );
    if (existingUser) {
      return null;
    }
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const uniqueId = `${dto.name}_${Date.now()}`;
    const newUser: User = {
      id: uniqueId,
      name: dto.name,
      // Store hashed password only
      password: hashedPassword,
      balance: dto.amount, // amount entered in the lobby
      // Board is not selected at registration anymore.
      // It will be locked when the player places the first bet.
      boardType: undefined,
    };

    this.state.users[uniqueId] = newUser;

    void this.userRepo.saveUser(newUser);

    return newUser;
  }*/

  // ADD bet
  placeBet(
      userId: string,
      num: number,
      amount: number,
      boardType: BoardType,
  ): boolean {
    const user = this.state.users[userId];
    const boardState = this.state.boards[boardType];
    this.logger.log(`PLACE BET | boardType=${boardType} boardState.isBettingOpen=${boardState.isBettingOpen}`);

    // Refuse invalid amounts
    if (
        !user ||
        !boardState.isBettingOpen ||
        user.balance < amount ||
        amount <= 0
    ) {
      return false;
    }

    // Lock the player on the first selected board
    if (!user.boardType) {
      user.boardType = boardType;
    }

    // Refuse if the player tries to bet on another board
    if (user.boardType !== boardType) {
      return false;
    }

    const existingBetIndex = boardState.tableState.findIndex(
        (b: Bet) =>
            b.userId === userId && b.number === num && b.boardType === boardType,
    );

    if (existingBetIndex > -1) {
      // ADD +10 (or amount) to the existing bet
      boardState.tableState[existingBetIndex].amount += amount;
    } else {
      // CREATE new bet on the table
      boardState.tableState.push({
        userId,
        password: user.password,
        number: num,
        amount,
        boardType,
      });
    }

    user.balance -= amount;
    return true;
  }

  // PUT bet
  updateBet(
      userId: string,
      num: number,
      newAmount: number,
      boardType: BoardType,
  ): boolean {
    const user = this.state.users[userId];
    const boardState = this.state.boards[boardType];

    if (!user || !boardState.isBettingOpen || newAmount <= 0) {
      return false;
    }

    // Refuse if the player tries to update a bet from another board
    if (user.boardType !== boardType) {
      return false;
    }

    // Find old bet
    const betIndex = boardState.tableState.findIndex(
        (b: Bet) =>
            b.userId === userId && b.number === num && b.boardType === boardType,
    );

    if (betIndex === -1) return false;

    const existingBet = boardState.tableState[betIndex];

    // Modify amount
    const difference = newAmount - existingBet.amount;

    if (difference > 0 && user.balance < difference) {
      return false;
    }

    user.balance -= difference;
    existingBet.amount = newAmount;

    return true;
  }

  // DELETE bet
  removeBet(userId: string, num: number, boardType: BoardType): boolean {
    const user = this.state.users[userId];
        const boardState = this.state.boards[boardType];


    if (!user || !boardState.isBettingOpen) {
      return false;
    }

    // Refuse if the player tries to delete a bet from another board
    if (user.boardType !== boardType) {
      return false;
    }

    // Find bet
    const betIndex = boardState.tableState.findIndex(
        (b: Bet) =>
            b.userId === userId && b.number === num && b.boardType === boardType,
    );

    if (betIndex === -1) return false;

    const bet = boardState.tableState[betIndex];

    // Delete it
    user.balance += bet.amount;
    boardState.tableState.splice(betIndex, 1);

    return true;
  }

  
  // Change the current roulette board
  changeBoard(encryptedData: string): GameState {
    const data = decryptPayload(encryptedData) as {
      boardType: BoardType;
       type: 'european' | 'mini' 
    };
    const boardState = this.state.boards[data.boardType];

    // Prevent board changes during an active round
    if (!boardState.isBettingOpen || boardState.tableState.length > 0) {
      return this.state;
    }

    boardState.board =
        data.type === 'mini'
            ? {
              type: 'mini',
              numbers: Array.from({ length: 13 }, (_, i) => i),
            }
            : {
              type: 'european',
              numbers: Array.from({ length: 37 }, (_, i) => i),
            };

    // Broadcast the updated state to all clients
    this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, encryptPayload(this.getState()));

    return this.state;
  }
    

  // Apply the payout of a round based on the round snapshot
  private async applyPayouts(snapshot: RoundSnapshot): Promise<RoundWinner[]> {
    const winners: RoundWinner[] = [];

    // Check all bets from the round
    for (const bet of snapshot.bets) {
      // Player wins if the bet number matches the result
      if (bet.number === snapshot.rngResult) {
        const user = this.state.users[bet.userId];

        // Multiplier depends on the board used for this bet
        // Mini board = x12
        // European board = x36
        const multiplier = bet.boardType === 'mini' ? 12 : 36;

        // Calculate player gain
        const gain = bet.amount * multiplier;

         this.logger.log(
          `WIN | user=${bet.userId} gain=${gain} case=${bet.number}`,
        );

        // Player still connected
        if (user) {
          // Add money to the player balance
          user.balance += gain;

          // Save new balance
          await this.userRepo.saveBalance(bet.userId, user.balance);

          winners.push({
            userId: user.id,
            playerName: user.name,
            gain,
            winningNumber: snapshot.rngResult,
            boardType: bet.boardType,
          });
        } else {
          // Player disconnected
          // Save gain in repository
          const persisted = await this.userRepo.findUserById(bet.userId);

          if (persisted) {
            // Update disconnected player balance
            const newBalance = persisted.balance + gain;
            await this.userRepo.saveBalance(bet.userId, newBalance);

            winners.push({
              userId: persisted.id,
              playerName: persisted.name,
              gain,
              winningNumber: snapshot.rngResult,
              boardType: bet.boardType,
            });

            // Log offline payout
            this.logger.log(`PAYOUT (offline) | user=${bet.userId} gain=${gain}`);
          }
        }
      }
    }

    for (const user of Object.values(this.state.users)) {
      this.logger.log(`FINAL STATE | user=${user.name} balance=${user.balance}`);
    }

    return winners;
  }

  // Reset the game for a new round
  reset(boardType: BoardType) {
    const boardState = this.state.boards[boardType];
    boardState.rngResult = null;
    boardState.tableState = [];
    boardState.isBettingOpen = true;

    // Unlock players for the next round
    Object.values(this.state.users).forEach((user) => {
      if (user.boardType === boardType) {
        user.boardType = undefined;
      }
    });

    // Reset timer when both board are reseted
    const allReset = Object.values(this.state.boards).every(b => b.isBettingOpen);
    if (allReset) {
      this.state.timeLeft = this.ROUND_DURATION;
    }
    this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, encryptPayload(this.getState()));

    return this.state;
  }

  // Check if a number belongs to the selected board
  private isValidNumberForBoard(number: number, boardType: BoardType): boolean {
    const validNumbers =
        boardType === 'mini'
            ? Array.from({ length: 13 }, (_, i) => i)
            : Array.from({ length: 37 }, (_, i) => i);

    return validNumbers.includes(number);
  }
}
