import {Component, inject} from '@angular/core';
import {WebsocketService} from '../../../core/services/websocket.service';

@Component({
  selector: 'app-timer',
  imports: [],
  template: `
   <!-- <div class="flex items-center justify-center gap-3">
      <div
        [class]="timerClass()"
        class="w-16 h-16 rounded-full flex items-center justify-center
               text-2xl font-bold border-4 transition-colors">
        {{ ws.timer() }}
      </div>
      <span class="text-zinc-400 text-sm">
        {{ ws.betsOpen() ? 'seconds to place a bet' : 'Spinning......' }}
      </span>
    </div>-->
   <div class="flex items-center gap-1.5">
     <div [class]="timerClass()"
          class="w-9 h-9 rounded-full flex items-center justify-center
                  text-sm font-bold border-2 transition-colors shrink-0">
       {{ ws.timer() }}
     </div>
     <span class="text-zinc-400 text-xs hidden sm:block">
        {{ ws.betsOpen() ? 'sec restantes' : 'Tirage...' }}
      </span>
   </div>
  `,
  styles: ``,
})
export class TimerComponent {

  ws = inject(WebsocketService);

  timerClass(): string {
    const t = this.ws.timer();
    if (t <= 3)  return 'border-red-500 text-red-400';
    if (t <= 6)  return 'border-yellow-500 text-yellow-400';
    return 'border-green-500 text-green-400';
  }

}
