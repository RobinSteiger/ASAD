import {Component, inject} from '@angular/core';
import {WebsocketService} from '../../../core/services/websocket.service';
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
@Component({
  selector: 'app-result',
  imports: [],
  template: `
   <!-- <div class="bg-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-3
            border border-yellow-500/30">

      <p class="text-zinc-400 text-sm">Winning result</p>

      <div [class]="resultClass()"
           class="w-20 h-20 rounded-full flex items-center justify-center
              text-3xl font-bold border-4 animate-pulse">
        {{ ws.rngResult() }}
      </div>

      <p class="text-zinc-300 text-sm">{{ colorLabel() }}</p>

      @if (ws.myBet(); as bet) {
        @if (bet.number === ws.rngResult()) {
          <p class="text-green-400 font-bold text-lg">
            🎉 You won! + {{ bet.amount * 35 }} CHF
          </p>
        } @else {
          <p class="text-red-400 font-semibold">
            😔 You lost − {{ bet.amount }} CHF
          </p>
        }
      } @else {
        <p class="text-zinc-500 text-sm">You did not place a bet this round.</p>
      }

      <p class="text-zinc-400 text-sm">
        New balance:
        <span class="text-white font-bold">{{ ws.balance() }} CHF</span>
      </p>

    </div>-->
   <div class="bg-zinc-800 rounded-xl px-4 py-2 flex items-center
                gap-4 border border-yellow-500/30 flex-wrap justify-center">

     <div class="flex items-center gap-2">
       <span class="text-zinc-400 text-xs">Résultat :</span>
       <div [class]="resultClass()"
            class="w-9 h-9 rounded-full flex items-center justify-center
                    text-sm font-bold border-2">
         {{ ws.rngResult() }}
       </div>
       <span class="text-zinc-300 text-xs">{{ colorLabel() }}</span>
     </div>

     @if (ws.myBet(); as bet) {
       @if (bet.number === ws.rngResult()) {
         <p class="text-green-400 font-bold text-sm">
           🎉 +{{ bet.amount * 35 }} CHF
         </p>
       } @else {
         <p class="text-red-400 font-semibold text-sm">
           😔 −{{ bet.amount }} CHF
         </p>
       }
     } @else {
       <p class="text-zinc-500 text-xs">Pas de mise ce tour.</p>
     }

     <span class="text-zinc-400 text-xs">
        Solde : <strong class="text-white">{{ ws.balance() }} CHF</strong>
      </span>

   </div>
  `,
  styles: ``,
})
export class ResultComponent {
  ws = inject(WebsocketService);

  resultClass(): string {
    const n = this.ws.rngResult();
    if (n === null) return '';
    if (n === 0)   return 'border-green-500 text-green-300';
    if (RED_NUMBERS.includes(n)) return 'border-red-500 text-red-300';
    return 'border-zinc-400 text-zinc-100';
  }

  colorLabel(): string {
    const n = this.ws.rngResult();
    if (n === null) return '';
    if (n === 0)   return 'Vert';
    if (RED_NUMBERS.includes(n)) return 'Rouge';
    return 'Noir';
  }

}
