import { Injectable } from '@nestjs/common';
import { Bet, GameState, User } from './game.interface';
import { CreatePlayerDto } from '../dto/create-player.dto';
import {
  BetResponse,
  RegistrationResponse,
  SpinResponse,
} from '../models/game-response.model';
import { PlaceBetDto } from '../dto/place-bet.dto';
import { Server } from 'socket.io';
import { GAME_EVENTS } from './game.events';

@Injectable()
export class GameService {
  // Main data storage for the game (The Blackboard)
  private state: GameState = {
    rngResult: null,
    tableState: [],
    users: {},
    isBettingOpen: true,
    timeLeft: 15,
  };

  public socketServer: Server;

  /**
   * Start the game loop when the server is ready
   * This is the "Heart" of the server
   */
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
  handleBetAction(dto: PlaceBetDto): BetResponse {
    const isOk = this.placeBet(dto.userId, dto.number, dto.amount);

    if (isOk) {
      // Notify everyone about the new bet on the table
      this.socketServer.emit(GAME_EVENTS.STATE_UPDATE, this.getState());
      return { status: 'success' };
    }

    return {
      status: 'error',
      message: 'Bet rejected (Case taken or no money)',
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

    const uniqueId = `${dto.name}_${Date.now()}`;
    const newUser: User = {
      id: uniqueId,
      name: dto.name,
      balance: dto.amount,
    };

    this.state.users[uniqueId] = newUser;
    return newUser;
  }

  // --- Inside GameService class ---

  /**
   * Handle a bet from a player
   *  This function updates the money and the table
   */
  placeBet(userId: string, num: number, amount: number): boolean {
    // 1. Get the user from our global state
    const user = this.state.users[userId];

    // check money and if bets are open
    if (!user || !this.state.isBettingOpen || user.balance < amount) {
      return false;
    }

    // 2. Requirement R1.2: Check if another player took this number
    // Is another person on this number?
    const isTakenByOther = this.state.tableState.find(
      (b: Bet) => b.number === num && b.userId !== userId,
    );
    if (isTakenByOther) return false;

    // 3. Increment logic: Add more money to an existing bet
    //  Search if the player already has a bet here
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

    // 4. Update balance: Take money from the player's wallet
    user.balance -= amount;

    return true;
  }

  // Select random winner and update balances
  handleSpin() {
    this.state.rngResult = Math.floor(Math.random() * 37);
    // Win TEST
    //  this.state.rngResult = 10;
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
