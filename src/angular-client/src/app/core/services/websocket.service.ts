import {computed, inject, Injectable, signal} from '@angular/core';
import {GameState, WsMessageIn, WsMessageOut} from '../models/game-state.model';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  // ---------| State |---------
  readonly userId = signal<string>('');
  readonly timer= signal<number>(10);
  readonly gameState = signal<GameState>({
    tableState: [],
    rngResult: null,
    users: {},
    connections: []
  });


  // ---------|  Computed from gameState |---------
 readonly tableState = computed(() => this.gameState().tableState);
 readonly rngResult = computed(() => this.gameState().rngResult);
 readonly balance = computed(() => this.gameState().users[this.userId()] ?? 100);
 readonly myBet = computed(() =>
   this.tableState().find(b => b.userId === this.userId()) ?? null);
 readonly betsOpen = computed(() => this.rngResult() === null);

  private ws!: WebSocket;
  private timerRef!: ReturnType<typeof setInterval>;

  private router = inject(Router)

// ---------|  Connexion |---------
  connect(userId: string): void {
    this.userId.set(userId);
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => {
      this.send({ type: 'GET_GAME_STATE' });
      this.startLocalTimer();
    };

    this.ws.onmessage = (event) => {
      const msg: WsMessageIn = JSON.parse(event.data);
      if (msg.type === 'GAME_STATE') {
        this.gameState.set(msg.data);
        // Reset timer local à chaque nouveau spin détecté
        if (msg.data.rngResult !== null) this.timer.set(10);
      }
    };

    this.ws.onclose = () => clearInterval(this.timerRef);

    this.router.navigate(['/game']);
  }




  // ---------|  Submitting a bet |---------
  submitBet(number: number, amount: number): void {
    if (!this.betsOpen()) return;
    this.send({
      type: 'POST_BET',
      data: { userId: this.userId(), number, amount },
    });
  }

  // ---------|  Timer |---------
  private startLocalTimer(): void {
    clearInterval(this.timerRef);
    this.timer.set(10);
    this.timerRef = setInterval(() => {
      this.timer.update(t => (t > 0 ? t - 1 : 10));
    }, 1000);
  }


  private send(msg: WsMessageOut): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }



}
