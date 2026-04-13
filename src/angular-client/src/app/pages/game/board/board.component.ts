import {Component, inject, signal} from '@angular/core';
import {WebsocketService} from '../../../core/services/websocket.service';
import { ReactiveFormsModule} from '@angular/forms';
import {GameStore} from '../../../core/store/game.store';

@Component({
  selector: 'app-board',
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 items-center">
      <div class="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner">

        <button
          (click)="placeBet(0)"
          [disabled]="!store.isBettingOpen() || isNumberOccupied(0)"
          class="col-span-full md:col-span-1 h-16 rounded-lg font-black text-xl transition-all
             bg-green-600 hover:bg-green-500 border-b-4 border-green-800
             disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
             flex flex-col items-center justify-center relative">
          0
          <span class="text-[10px]">{{ getBetOnNumber(0) }}</span>
        </button>

        @for (n of numbers; track n) {
          <button
            (click)="placeBet(n)"
            [disabled]="!store.isBettingOpen() || isNumberOccupied(n)"
            [class]="getNumberClass(n)"
            class="h-16 rounded-lg font-bold text-lg transition-all border-b-4
               hover:scale-105 active:translate-y-1
               disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
               flex flex-col items-center justify-center relative">
            {{ n }}

            @if (getBetAmount(n) > 0) {
              <div class="absolute -top-2 -right-2 w-7 h-7 bg-yellow-500 text-black text-[10px]
                      rounded-full border-2 border-white flex items-center justify-center font-black animate-bounce shadow-lg">
                {{ getBetAmount(n) }}
              </div>
            }
          </button>
        }
      </div>

      <div class="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">
        @if (store.isBettingOpen()) {
          <div class="flex flex-col items-center gap-2">
            <span class="text-green-500 animate-pulse font-black">● Place your bets (10 CHF)</span>
            <span class="text-zinc-400 text-[10px]">Time remaining: {{ store.timeLeft() }}s</span>
          </div>
        } @else {
          <span class="text-red-500 font-black">✖ Bets Closed - Spinning...</span>
        }
      </div>
    </div>
  `,
  styles: ``,
})

export class BoardComponent {
  readonly store = inject(GameStore);
  private ws = inject(WebsocketService);

  // Roulette logic
  readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  readonly numbers = Array.from({ length: 36 }, (_, i) => i + 1);

  getNumberClass(n: number): string {
    const isRed = this.redNumbers.includes(n);
    return isRed
      ? 'bg-red-600 hover:bg-red-500 border-red-800 text-white'
      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-950 text-white';
  }

  placeBet(n: number) {
    // We use a fixed amount of 10 for now, as defined in our logic
    this.ws.placeBet(n, 10);
  }

  // UI Helpers to show bets on the board
  hasBet(n: number): boolean {
    const userId = this.store.userId();
    return this.store.tableState().some(bet => bet.number === n && bet.userId === userId);
  }

  getBetAmount(n: number): number {
    // We look for any bet on this number in the tableState
    const bet = this.store.tableState().find(b => b.number === n);

    // If we find a bet, return the amount, otherwise return 0
    return bet ? bet.amount : 0;
  }

  getBetOnNumber(n: number): string {
    // Similar to getBetAmount but returns a small badge text
    return this.hasBet(n) ? '✓' : '';
  }

  // Check if someone else (not me) has money on this number
  isNumberOccupied(n: number): boolean {
    const myId = this.store.userId();
    return this.store.tableState().some(bet => bet.number === n && bet.userId !== myId);
  }
}
