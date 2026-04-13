import {Component, computed, inject} from '@angular/core';
import {GameStore} from '../../../core/store/game.store';
import {User} from '../../../core/models/game-state.model';

@Component({
  selector: 'app-result',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-6">

      <div class="relative mb-8">
        <div class="w-48 h-48 rounded-full border-8 border-yellow-500/30 flex items-center justify-center animate-pulse">
          <div [class]="resultColor"
               class="w-40 h-40 rounded-full flex items-center justify-center text-7xl font-black shadow-2xl border-4 border-white/20">
            {{ store.rngResult() }}
          </div>
        </div>
        <div class="absolute -top-4 -left-4 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
        <div class="absolute -bottom-4 -right-4 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
      </div>

      @if (isWinner()) {
        <h2 class="text-5xl font-black text-yellow-500 mb-2 drop-shadow-lg italic">
          BIG WIN!
        </h2>
        <p class="text-xl text-white font-bold uppercase tracking-widest">
          You won <span class="text-green-400">+{{ winAmount() }} CHF</span>
        </p>
      } @else {
        <h2 class="text-5xl font-black text-zinc-500 mb-2 italic">
          NO LUCK...
        </h2>
        <p class="text-lg text-zinc-400 uppercase tracking-widest">
          Better luck next time
        </p>
      }

      <div class="mt-10 w-full max-w-md bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
        <h3 class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Round Winners</h3>
        <div class="flex flex-col gap-2">
          @for (winner of winners(); track winner.id) {
            <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded-xl border border-white/5">
              <span class="font-bold text-sm">{{ winner.name }}</span>
              <span class="text-green-400 font-black text-sm">+{{ winner.lastWin }} CHF</span>
            </div>
          } @empty {
            <p class="text-zinc-600 text-xs italic">No winners this round</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ResultComponent {

  readonly store = inject(GameStore); // Global data source

  /** * Get CSS class for the winning number color
   */
  get resultColor(): string {
    const res = this.store.rngResult();
    if (res === 0) return 'bg-green-600';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(res!) ? 'bg-red-600' : 'bg-zinc-900';
  }

  /** * Logic: Check if the local player won the round
   */
  isWinner = computed(() => {
    const userId = this.store.userId();
    const result = this.store.rngResult();
    // Check if my bet matches the winning number
    return this.store.tableState().some(bet => bet.userId === userId && bet.number === result);
  });

  /** * Logic: Calculate the money won (36x for single number)
   */
  winAmount = computed(() => {
    const userId = this.store.userId();
    const result = this.store.rngResult();
    const winningBet = this.store.tableState().find(bet => bet.userId === userId && bet.number === result);
    // Multiply bet amount by 36
    return winningBet ? winningBet.amount * 36 : 0;
  });

  /** * Logic: Filter all users to find winners
   */
  winners = computed<User[]>(() => {
    return Object.values(this.store.users())
      .filter((user: User) => (user.lastWin ?? 0) > 0)
      .sort((a: User, b: User) => (b.lastWin ?? 0) - (a.lastWin ?? 0));
  });
}
