import {Component, inject} from '@angular/core';
import {TimerComponent} from './timer/timer.component';
import {BoardComponent} from './board/board.component';
import {ResultComponent} from './result/result.component';
import {WebsocketService} from '../../core/services/websocket.service';

@Component({
  selector: 'app-game',
  imports: [
    TimerComponent,
    BoardComponent,
    ResultComponent
  ],
  template: `
   <!-- <div class="min-h-screen bg-zinc-900 text-white flex flex-col gap-4 p-6">

      &lt;!&ndash; Header &ndash;&gt;
      <div class="flex justify-between items-center">
        <span class="text-zinc-400 text-sm">
          Gamer : <span class="text-white font-semibold">{{ ws.userId() }}</span>
        </span>
        <span class="text-zinc-400 text-sm">
          Balance: : <span class="text-green-400 font-bold">{{ ws.balance() }} CHF</span>
        </span>
      </div>

      &lt;!&ndash; Timer &ndash;&gt;
      <app-timer />

      &lt;!&ndash; Board &ndash;&gt;
      <app-board />

      &lt;!&ndash; Résultat &ndash;&gt;
      @if (ws.rngResult() !== null) {
        <app-result />
      }

    </div>-->
   <div class="h-screen w-screen bg-zinc-900 text-white flex flex-col
                overflow-hidden p-3 gap-2">

     <!-- Header compact -->
     <div class="flex justify-between items-center px-1 shrink-0">
        <span class="text-zinc-400 text-xs">
          Joueur : <span class="text-white font-semibold">{{ ws.userId() }}</span>
        </span>
       <app-timer />
       <span class="text-zinc-400 text-xs">
          Solde : <span class="text-green-400 font-bold">{{ ws.balance() }} CHF</span>
        </span>
     </div>

     <!-- Board — prend tout l'espace disponible -->
     <div class="bg-zinc-800 rounded-xl p-3 flex-1 min-h-0 overflow-auto">
       <app-board />
     </div>

     <!-- Résultat compact en bas -->
     @if (ws.rngResult() !== null) {
       <div class="shrink-0">
         <app-result />
       </div>
     }

   </div>
  `,
  styles: ``,
})
export class GameComponent {

  ws = inject(WebsocketService);
}
