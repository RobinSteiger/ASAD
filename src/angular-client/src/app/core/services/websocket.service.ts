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
  private readonly store = inject(GameStore);
  private router = inject(Router);
  private socket!: Socket;
  private timerRef: any = null;

  connect(name: string | null, amount: number | null): void {
    if (!name || amount === null || amount < 1000) {
      console.error('❌ [WebsocketService] Connection rejected: Name missing or amount < 1000');
      return;
    }

    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000');

    // --- HANDLERS ---

    this.socket.on('connect_error', (error) => {
      console.error('❌ [WebsocketService] Connection Error:', error.message);
      this.stopTimer();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('🔌 [WebsocketService] Disconnected:', reason);
      this.stopTimer();
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.router.navigate(['/']);
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ [WebsocketService] Connected to NestJS');

      const payload = { name: name.trim(), amount };

      this.socket.emit(GAME_EVENTS.REGISTER, payload, (response: RegistrationResponse) => {
        if (response.status === 'success' && response.user) {
          this.store.setUserId(response.user.id);
          this.router.navigate(['/game']);
        } else {
          this.socket.disconnect();
        }
      });
    });

    // Listen for state updates from NestJS loop
    this.socket.on(GAME_EVENTS.STATE_UPDATE, (data: GameState) => {
      this.store.updateGameState(data);
    });

    // Listen for final result (Spin)
    this.socket.on(GAME_EVENTS.RESULT, (data: any) => {
      this.store.setResult(data);
    });

    this.startLocalTimer();
  }

  /**
   * PLACE BET
   * Just send the "click" to the server.
   * The server will handle the increment (+=) and balance check.
   */
  placeBet(number: number, amount: number): void {
    const userId = this.store.userId();

    if (!userId || !this.store.isBettingOpen()) {
      console.warn('🚫 Cannot place bet: Missing ID or betting closed');
      return;
    }

    // Send to NestJS
    this.socket.emit(GAME_EVENTS.PLACE_BET, {
      userId: userId,
      number: number,
      amount: amount
    });

    console.log(`📤 [WebsocketService] Bet request sent: ${amount} on ${number}`);
  }

  private startLocalTimer(): void {
    this.stopTimer();
    this.timerRef = setInterval(() => {
      const currentTimer = this.store.timer();
      if (this.store.isBettingOpen() && currentTimer > 0) {
        this.store.updateTimer(currentTimer - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  disconnect(): void {
    this.stopTimer();
    this.socket?.disconnect();
  }

}


