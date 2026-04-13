import {Component, DestroyRef, effect, inject, OnDestroy} from '@angular/core';
import {TimerComponent} from './timer/timer.component';
import {BoardComponent} from './board/board.component';
import {ResultComponent} from './result/result.component';
import {GameStore} from '../../core/store/game.store';
import {WebsocketService} from '../../core/services/websocket.service';
import {Router} from '@angular/router';
import {NgIcon} from '@ng-icons/core';

@Component({
  selector: 'app-game',
  imports: [
    TimerComponent,
    BoardComponent,
    ResultComponent,
    NgIcon
  ],
  template: `
    <div class="h-screen w-screen bg-zinc-950 text-white flex flex-col overflow-hidden relative">

      <header class="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 z-20">
        <div class="flex flex-col">
          <span class="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Player</span>
          <span class="text-white text-sm font-bold italic uppercase">{{ store.userName() }}</span>
        </div>
        <app-timer/>
        <div class="flex flex-col items-end">
          <span class="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Balance</span>
          <div class="text-green-400 font-black text-lg">{{ store.userBalance() }} CHF</div>
        </div>
      </header>

      <main class="flex-1 relative flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">

        <div class="z-10 w-full max-w-5xl animate-in fade-in zoom-in duration-500">
          <app-board/>
        </div>

        @if (store.showResultPopup()) {
          <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div class="max-w-md w-full mx-4 relative bg-zinc-900/50 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">

              <app-result />

              <p class="text-center pb-8 text-[9px] text-zinc-500 uppercase tracking-widest animate-pulse">
                Next round starts in a few seconds...
              </p>
            </div>
          </div>
        }

        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
          <img src="/roulette1.png" alt="" class="w-96 h-96 blur-xl animate-pulse"/>
        </div>
      </main>
      <footer class="h-16 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 z-20">

        <button
          (click)="leaveTable()"
          [disabled]="store.hasPlacedBet()"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95
           disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed
           bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest">

          <ng-icon name="heroXCircle" class="text-2xl" />
          {{ store.hasPlacedBet() ? 'Bets Active' : 'Leave Table' }}
        </button>

        @if (store.hasPlacedBet()) {
          <span class="text-[9px] text-zinc-200 uppercase font-bold animate-pulse">
      Cannot leave while bets are on the table
    </span>
        }
      </footer>

    </div>
  `,
  styles: ``,
})
export class GameComponent  {

  readonly store = inject(GameStore);
  private readonly router = inject(Router);
  private readonly websocketService = inject(WebsocketService);

  /** *  If there is no User ID, go back to Lobby
   */
  private authGuard = effect(() => {
    if (!this.store.userId()) {
      this.router.navigate(['/']);
    }
  });

  /** * Leave the game and return to lobby
   */
  leaveTable(): void {
    this.router.navigate(['/']);
  }

  /** *  Stop connection and clear store when leaving the component
   */
  private cleanup = inject(DestroyRef).onDestroy(() => {
    this.websocketService.disconnect();
    this.store.clearStore();
  });
}
