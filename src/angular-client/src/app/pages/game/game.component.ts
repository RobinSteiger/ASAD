import {Component, DestroyRef, effect, inject, OnDestroy} from '@angular/core';
import {TimerComponent} from './timer/timer.component';
import {BoardComponent} from './board/board.component';
import {ResultComponent} from './result/result.component';
import {GameStore} from '../../core/store/game.store';
import {WebsocketService} from '../../core/services/websocket.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game',
  imports: [
    TimerComponent,
    BoardComponent,
    ResultComponent
  ],
  template: `
    <div class="h-screen w-screen bg-zinc-950 text-white flex flex-col overflow-hidden relative">

      <div
        class="absolute top-0 left-0 w-full bg-red-600/90 text-[10px] py-1 px-4 z-[100] font-mono flex justify-between">
        <span>WS_STATUS: {{ store.isBettingOpen() ? 'WAITING_FOR_BETS' : 'ROUND_LOCKED' }}</span>
        <span>RNG_VAL: {{ store.rngResult() ?? 'NULL' }}</span>
      </div>

      <header class="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 z-20">
        <div class="flex flex-col">
          <span class="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Player</span>
          <span class="text-white text-sm font-bold italic uppercase">
             {{ store.userName() }}
          </span>
        </div>

        <app-timer/>

        <div class="flex flex-col items-end">
          <span class="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Balance</span>
          <div class="text-green-400 font-black text-lg">{{ store.userBalance() }} CHF</div>
        </div>
      </header>

      <main
        class="flex-1 relative flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">

        @if (store.rngResult() === null) {
          <div class="z-10 w-full max-w-5xl animate-in fade-in zoom-in duration-500">
            <app-board/>
          </div>
        } @else {
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in zoom-in duration-300">
            <app-result/>
          </div>
        }

        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
          <img src="/roulette1.png" alt="" class="w-96 h-96 blur-xl animate-pulse"/>
        </div>
      </main>
    </div>
  `,
  styles: ``,
})
export class GameComponent  {
// --- INJECTIONS ---
  readonly store = inject(GameStore);        // Central data
  private readonly router = inject(Router);   // For navigation
  private readonly ws = inject(WebsocketService); // Connection logic

  /** * SECURITY: If there is no User ID, go back to Lobby
   */
  private authGuard = effect(() => {
    if (!this.store.userId()) {
      this.router.navigate(['/']);
    }
  });

  /** * CLEANUP: Disconnect from server when leaving this page
   */
  private cleanup = inject(DestroyRef).onDestroy(() => {
    this.ws.disconnect();
    this.store.clearStore(); // Optional: Reset the local data
  });
}
