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

  /** * Form for the player name
   * Only letters and numbers allowed
   */
  userNameForm = new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9]+$/)
    ]
  });

  /** * Form for the starting budget
   * Minimum is 1000 according to Business Rules
   */
  amountForm = new FormControl<number>(1000, {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.min(1000)
    ]
  });

  /** * Action when the user clicks the button
   */
  joinGame(): void {
    // 1. Stop if forms are not valid
    if (this.userNameForm.invalid || this.amountForm.invalid) {
      return;
    }
    const name: string = this.userNameForm.value.trim();
    const amount: number = Number(this.amountForm.value);
    // 2. Clean old connection before starting a new one
    this.websocketService.disconnect();
    // 3. Connect to the WebSocket server with the data
    this.websocketService.connect(name, amount);
  }
}
