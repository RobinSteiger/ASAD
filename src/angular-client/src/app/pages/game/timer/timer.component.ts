import {Component, inject} from '@angular/core';
import {GameStore} from '../../../core/store/game.store';

@Component({
  selector: 'app-timer',
  imports: [],
  template: `
    <div class="flex items-center gap-3 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-zinc-700">

      <div [class]="timerClass()"
           class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300">
        {{ store.timeLeft() }}
      </div>

      <span class="text-[10px] uppercase tracking-wider font-bold w-20">
        {{ store.isBettingOpen() ? 'Place Bets' : 'Spinning' }}
      </span>
    </div>
  `,
  styles: ``,
})
export class TimerComponent {

  // Access the central data (Blackboard)
  readonly store = inject(GameStore);

  /** * Change colors based on the time remaining
   * This is visual feedback for the player
   */
  timerClass(): string {
    // Get the time from the server via the Store
    const t = this.store.timeLeft();

    // If bets are closed, show gray color
    if (!this.store.isBettingOpen()) {
      return 'border-zinc-500 text-zinc-500 opacity-50';
    }

    // Critical time: less than 3 seconds (Red + Animation)
    if (t <= 3) {
      return 'border-red-500 text-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]';
    }

    // Warning time: less than 6 seconds (Orange)
    if (t <= 6) {
      return 'border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]';
    }

    // Normal time: Safe to bet (Green)
    return 'border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  }

}
