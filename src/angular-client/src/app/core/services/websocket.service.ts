import {inject, Injectable} from '@angular/core';
import {BoardType, GameState, SpinResponse} from '../models/game-state.model';
import {Router} from '@angular/router';
import {GameStore} from '../store/game.store';
import {io, Socket} from 'socket.io-client';
import {GAME_EVENTS} from '../../shared/game.events';
import {RegistrationResponse} from '../models/game-response.model';
import {encryptPayload, decryptPayload} from '../utils/encryption.util';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  // Data storage injection
  private readonly store = inject(GameStore);
  private readonly router = inject(Router);

  // The socket instance with strict typing
  private socket!: Socket;

  /**
   * Create socket connection and register common listeners
   */
  private createConnection(): void {
    // Connect to NestJS server on port 3000
    this.socket = io('http://localhost:3000');
    /**
     * LISTEN: State update from server
     * Server sends this every second
     */
    this.socket.on(GAME_EVENTS.STATE_UPDATE, (encryptedData: string) => {
      const data = decryptPayload(encryptedData) as GameState;
      // Push the new server data into the Store
      this.store.updateGameState(data);
    });
    /**
     * LISTEN: Final spin result
     * Server sends this when the wheel stops
     */
    this.socket.on(GAME_EVENTS.RESULT, (encryptedData: string) => {
      const data = decryptPayload(encryptedData) as SpinResponse;
      // We send the winners to the Store to show the Popup
      this.store.setResult(data);
    });
    // Handle server errors
    this.socket.on(GAME_EVENTS.ERROR, (error) => {
      console.error('Server error:', error);
    });
    // Handle disconnection
    this.socket.on('disconnect', () => {
      this.router.navigate(['/']);
    });
  }

  /**
   * Register a new player with name, password and starting money
   */
  register(name: string | null, password: string | null, amount: number | null,  onError?: (message: string) => void,): void {
    if (!name || !password || amount === null) {
      console.error('Missing data for registration');
      return;
    }
    this.createConnection();
    // When connection is ready
    this.socket.on('connect', () => {
      const payload = {
        name: name.trim(),
        password,
        amount,
      };
      // Send registration event to server
      this.socket.emit(
        GAME_EVENTS.REGISTER,
        encryptPayload(payload),
        (encryptedResponse: string) => {
          const response = decryptPayload(encryptedResponse) as RegistrationResponse;

          if (response.status === 'success' && response.user) {
            this.store.setUserId(response.user.id); // Save my ID
            this.router.navigate(['/game']); // Go to game page
            return;
          }
          onError?.(response.message ?? 'Unknown error');
        },
      );
    });
  }

  /**
   * Login an existing player with name and password
   */
  login(name: string | null, password: string | null, onError?: (message: string) => void,): void {
    if (!name || !password) {
      console.error('Missing data for login');
      return;
    }
    this.createConnection();
    // When connection is ready
    this.socket.on('connect', () => {
      const payload = {
        name: name.trim(),
        password,
      };
      // Send login event to server
      this.socket.emit(
        GAME_EVENTS.LOGIN,
        encryptPayload(payload),
        (encryptedResponse: string) => {
          const response = decryptPayload(encryptedResponse) as RegistrationResponse;

          if (response.status === 'success' && response.user) {
            this.store.setUserId(response.user.id); // Save my ID
            this.router.navigate(['/game']); // Go to game page
            return;
          }
          onError?.(response.message ?? 'Unknown error');
        },
      );
    });
  }

  // Send a board change request to the server
  // Legacy feature kept temporarily for compatibility
  changeBoard(type: BoardType): void {
    this.socket.emit(GAME_EVENTS.CHANGE_BOARD, encryptPayload({ type }));
  }

  // ADD bet
  placeBet(number: number, amount: number, boardType: BoardType): void {
    const userId = this.store.userId();
    if (!userId || !this.store.isBettingOpen()) {
      return;
    }
    this.socket.emit(GAME_EVENTS.BET_ACTION, encryptPayload({
      userId,
      number,
      amount,
      boardType,
      action: 'place',
    }));
  }

  // PUT bet
  updateBet(number: number, amount: number, boardType: BoardType): void {
    const userId = this.store.userId();
    if (!userId || !this.store.isBettingOpen()) {
      return;
    }
    this.socket.emit(GAME_EVENTS.BET_ACTION, encryptPayload({
      userId,
      number,
      amount,
      boardType,
      action: 'update',
    }));
  }

  // DELETE bet
  deleteBet(number: number, boardType: BoardType): void {
    const userId = this.store.userId();
    if (!userId || !this.store.isBettingOpen()) {
      return;
    }
    this.socket.emit(GAME_EVENTS.BET_ACTION, encryptPayload({
      userId,
      number,
      boardType,
      action: 'delete',
    }));
  }

  // Disconnection
  disconnect(): void {
    this.socket?.disconnect();
  }
}


