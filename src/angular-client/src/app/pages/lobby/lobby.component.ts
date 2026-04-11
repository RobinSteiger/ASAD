import {Component, inject} from '@angular/core';
import {WebsocketService} from '../../core/services/websocket.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-lobby',
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-screen w-screen bg-zinc-950 flex items-center justify-center p-6">
      <div class="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden">

        <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl"></div>

        <div class="flex flex-col items-center gap-3 justify-center mb-4">
          <img src="/roulette1.png" alt="roulette" class="w-12 h-12" />
          <h1 class="text-white text-3xl font-black tracking-tighter italic">
            ASAD<span class="text-green-500 text-sm">CASINO</span>
          </h1>
        </div>

        <div class="flex flex-col gap-4">

          <div class="flex flex-col gap-1">
            <input
              [formControl]="userNameForm"
              type="text"
              placeholder="Enter your name..."
              class="bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none border border-zinc-700
                     focus:ring-2 focus:ring-green-500/50 placeholder-zinc-500 transition-all"
            />
            @if (userNameForm.invalid && userNameForm.touched) {
              <p class="text-red-400 text-[10px] uppercase font-bold mt-1 ml-1">
                @if (userNameForm.errors?.['required']) { Required field }
                @else if (userNameForm.errors?.['minlength']) { Min 3 chars }
              </p>
            }
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-[10px] text-zinc-500 uppercase font-bold ml-1">Starting Chips ($)</label>
            <input
              [formControl]="amountForm"
              type="number"
              placeholder="Initial budget..."
              class="bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none border border-zinc-700
                     focus:ring-2 focus:ring-green-500/50 placeholder-zinc-500 transition-all"
            />
            @if (amountForm.invalid && amountForm.touched) {
              <p class="text-red-400 text-[10px] uppercase font-bold mt-1 ml-1">
                @if (amountForm.errors?.['required']) { Required field }
                @else if (amountForm.errors?.['min']) { Minimum 1000$ required }
              </p>
            }
          </div>

        </div>

        <button
          (click)="joinGame()"
          [disabled]="userNameForm.invalid || amountForm.invalid"
          class="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600
                 disabled:cursor-not-allowed text-white font-bold
                 py-3 rounded-xl transition-all shadow-lg shadow-green-900/20">
          START PLAYING
        </button>

        <p class="text-[9px] text-zinc-600 text-center uppercase tracking-widest">
          // Ready to connect to the server
        </p>
      </div>
    </div>
  `,
  styles: ``,
})
export class LobbyComponent {


  private websocketService = inject(WebsocketService);

  userNameForm = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/^[a-zA-Z0-9]+$/)
  ]);

  // Initial budget field, minimum 10$
  amountForm = new FormControl(1000, [
    Validators.required,
    Validators.min(1000)
  ]);

  // lobby.component.ts
  joinGame() {
    // 1. Check form validity
    if (this.userNameForm.invalid || this.amountForm.invalid) return;

    const name = this.userNameForm.value!.trim();
    const amount = Number(this.amountForm.value);

    // 2. Custom Business Rule: Minimum 1000
    if (amount < 1000) {
      // Tu peux aussi gérer ça avec un Validator.min(1000) dans ton FormControl
      console.error(' Minimum bet to join is 1000');
      return;
    }

    // 3. Cleanup old connection
    this.websocketService.disconnect();

    // 4. Connect
    this.websocketService.connect(name, amount);
  }

}
