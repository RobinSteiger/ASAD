import {inject, Injectable} from '@angular/core';
import {Bet, GameState, SpinResponse} from '../models/game-state.model';
import {Router} from '@angular/router';
import {GameStore} from '../store/game.store';
import {io, Socket} from 'socket.io-client';
import {GAME_EVENTS} from '../../shared/game.events';
import {RegistrationResponse} from '../models/game-response.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  //  Data storage injection
  private readonly store = inject(GameStore);
  private readonly router = inject(Router);

  // The socket instance with strict typing
  private socket!: Socket;

  /**
   * Connect to the server with name and money
   */
  connect(name: string | null, amount: number | null): void {
    if (!name || amount === null) {
      console.error('Missing data for connection');
      return;
    }

    // Connect to NestJS server on port 3000
    this.socket = io('http://localhost:3000');

    // When connection is ready
    this.socket.on('connect', () => {
      const payload = { name: name.trim(), amount };

      // Send registration event to server
      this.socket.emit(GAME_EVENTS.REGISTER, payload, (response: RegistrationResponse) => {
        if (response.status === 'success' && response.user) {
          this.store.setUserId(response.user.id); // Save my ID
          this.router.navigate(['/game']);        // Go to game page
        }
      });
    });

    /**
     * LISTEN: State update from server
     * Server sends this every second
     */
    this.socket.on(GAME_EVENTS.STATE_UPDATE, (data: GameState) => {
      // Push the new server data into the Store
      this.store.updateGameState(data);
    });

    /**
     * LISTEN: Final spin result
     * Server sends this when the wheel stops
     */
    this.socket.on(GAME_EVENTS.RESULT, (data: SpinResponse) => {
      //  We send the winners to the Store to show the Popup
      this.store.setResult(data);
    });

    // Handle disconnection
    this.socket.on('disconnect', () => {
      this.router.navigate(['/']);
    });
  }

  // ADD bet
  placeBet(number: number, amount: number): void {
    const userId = this.store.userId();
    if (!userId || !this.store.isBettingOpen()) {
      return;
    }
    this.socket.emit(GAME_EVENTS.BET_ACTION, {
      userId,
      number,
      amount,
      action: 'place',
    });
  }

  // PUT bet
  updateBet(number: number, amount: number): void {
    const userId = this.store.userId();

    if (!userId || !this.store.isBettingOpen()) {
      return;
    }

    this.socket.emit(GAME_EVENTS.BET_ACTION, {
      userId,
      number,
      amount,
      action: 'update',
    });
  }

  // DELETE bet
  deleteBet(number: number): void {
    const userId = this.store.userId();

    if (!userId || !this.store.isBettingOpen()) {
      return;
    }

    this.socket.emit(GAME_EVENTS.BET_ACTION, {
      userId,
      number,
      action: 'delete',
    });
  }

  // Disconnection
  disconnect(): void {
    this.socket?.disconnect();
  }
}


