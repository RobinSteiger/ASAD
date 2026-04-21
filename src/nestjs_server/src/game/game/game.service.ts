import { Injectable, Logger } from '@nestjs/common';
import { Bet, GameState, User } from './game.interface';
import { CreatePlayerDto } from '../dto/create-player.dto';
import {
  BetResponse,
  RegistrationResponse,
  SpinResponse,
} from '../models/game-response.model';
import { Server } from 'socket.io';
import { GAME_EVENTS } from './game.events';
import { BetActionDto } from '../dto/bet-action.dto';

@Injectable()
export class GameService {
  // Main data storage for the game (The Blackboard)
  private state: GameState = {
    rngResult: null,
    tableState: [],
    users: {},
    isBettingOpen: true,
    timeLeft: 30,
  };

  public socketServer!: Server;
  private readonly logger = new Logger('GameService');

  // Start the game
  startGameLoop() {
    setInterval(() => {
      if (this.state.timeLeft > 0 && this.state.isBettingOpen) {
        // Decrease time every second
        this.state.timeLeft--;
        // Update all players with the new time
        this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, this.getState());
      } else if (this.state.timeLeft === 0 && this.state.isBettingOpen) {
        // Time is up! Close bets and spin
        this.handleSpinAction();
      }
    }, 1000);
  }

  // Get the current game state
  getState(): GameState {
    return this.state;
  }

  // Handle player registration
  handleRegister(dto: CreatePlayerDto): RegistrationResponse {
    if (dto.amount < 1000) {
      return { status: 'error', message: 'Minimum 1000 required' };
    }

    const newUser = this.registerUser(dto);
    if (!newUser) return { status: 'error', message: 'Invalid data' };

    return { status: 'success', user: newUser };
  }

  // Handle when a player clicks on the board
  handleBetAction(dto: BetActionDto): BetResponse {
    let isOk = false;

    switch (dto.action) {
      case 'place':
        if (dto.amount === undefined) break;
        isOk = this.placeBet(dto.userId, dto.number, dto.amount);
        break;

      case 'update':
        if (dto.amount === undefined) break;
        isOk = this.updateBet(dto.userId, dto.number, dto.amount);
        break;

      case 'delete':
        isOk = this.removeBet(dto.userId, dto.number);
        break;

      default:
        return {
          status: 'error',
          message: 'Invalid action',
        };
    }

    if (isOk) {
      this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, this.getState());
      return { status: 'success' };
    }

    return {
      status: 'error',
      message: 'Bet action failed',
    };
  }

  // Process the spin result
  handleSpinAction(): SpinResponse {
    this.state.isBettingOpen = false; // Stop all betting
    this.handleSpin();

    const state = this.getState();
    const roundWinners = state.tableState
      .filter((bet) => bet.number === state.rngResult)
      .map((bet) => state.users[bet.userId]);

    const response: SpinResponse = {
      status: 'success',
      winningNumber: state.rngResult,
      winners: roundWinners,
      newState: state,
    };

    // Send the result to everyone
    this.socketServer.emit(GAME_EVENTS.RESULT, response);

    // Wait 5 seconds to show result, then restart
    setTimeout(() => this.reset(), 5000);

    return response;
  }

  // Create a new user in the system
  registerUser(dto: CreatePlayerDto): User | null {
    if (!dto || !dto.name) return null;

    const BASIC_AMOUNT = 1000;

    const uniqueId = `${dto.name}_${Date.now()}`;
    const newUser: User = {
      id: uniqueId,
      name: dto.name,
      balance: BASIC_AMOUNT,
    };

    this.state.users[uniqueId] = newUser;
    return newUser;
  }

  // ADD bet
  placeBet(userId: string, num: number, amount: number): boolean {
    const user = this.state.users[userId];
    if (!user || !this.state.isBettingOpen || user.balance < amount) {
      return false;
    }
    
    const isTakenByOther = this.state.tableState.find(
      (b: Bet) => b.number === num && b.userId !== userId,
    );
    if (isTakenByOther) return false;

    const existingBetIndex = this.state.tableState.findIndex(
      (b: Bet) => b.userId === userId && b.number === num,
    );

    if (existingBetIndex > -1) {
      // ADD +10 (or amount) to the existing bet
      this.state.tableState[existingBetIndex].amount += amount;
    } else {
      // CREATE new bet on the table
      this.state.tableState.push({ userId, number: num, amount });
    }
    user.balance -= amount;
    // Log
    this.logger.log(
      `PLACE_BET | user=${userId} num=${num} amount=${amount}`,
    );
    return true;
  }

  // PUT bet
  updateBet(userId: string, num: number, newAmount: number): boolean {
    const user = this.state.users[userId];
    if (!user || !this.state.isBettingOpen || newAmount <= 0) {
      return false;
    }
    // Find old bet
    const betIndex = this.state.tableState.findIndex(
      (b: Bet) => b.userId === userId && b.number === num,
    );
    if (betIndex === -1) return false;
    const existingBet = this.state.tableState[betIndex];
    // Modify amount
    const difference = newAmount - existingBet.amount;

    if (difference > 0 && user.balance < difference) {
      return false;
    }
    user.balance -= difference;
    existingBet.amount = newAmount;
    // Log
    this.logger.log(
      `UPDATE_BET | user=${userId} num=${num} new=${newAmount} diff=${difference}`,
    );
    return true;
  }

  // DELETE bet
  removeBet(userId: string, num: number): boolean {
    const user = this.state.users[userId];
    if (!user || !this.state.isBettingOpen) {
      return false;
    }
    // Find bet
    const betIndex = this.state.tableState.findIndex(
      (b: Bet) => b.userId === userId && b.number === num,
    );
    if (betIndex === -1) return false;
    const bet = this.state.tableState[betIndex];
    // Delete it
    user.balance += bet.amount;
    this.state.tableState.splice(betIndex, 1);
    // Log
    this.logger.log(
      `REMOVE_BET success | user=${userId} num=${num} refunded=${bet.amount}`,
    );
    return true;
  }


  // Select random winner and update balances
  handleSpin() {
    this.state.rngResult = Math.floor(Math.random() * 37);
    // Win TEST
    this.state.tableState.forEach((bet) => {
      if (bet.number === this.state.rngResult) {
        const winner = this.state.users[bet.userId];
        if (winner) {
          // Rule: Winner gets 36x the bet
          winner.balance += bet.amount * 36;
        }
      }
    });
    return this.state;
  }

  // Reset the game for a new round
  reset() {
    this.state.rngResult = null;
    this.state.tableState = [];
    this.state.isBettingOpen = true;
    this.state.timeLeft = 15;

    this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, this.getState());
    return this.state;
  }
}
