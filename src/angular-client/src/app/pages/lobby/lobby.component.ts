import {Component, inject, signal} from '@angular/core';
import {WebsocketService} from '../../core/services/websocket.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-lobby',
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <!-- Sliding container -->
      <div
        class="flex h-full w-[200vw] transition-transform duration-500 ease-in-out"
        [style.transform]="page() === 'register' ? 'translateX(-50%)' : 'translateX(0)'"
      >

        <!-- Bloc 1 : lobby page de Login -->
        <section class="h-screen w-screen shrink-0 bg-zinc-950 flex items-center justify-center p-6">
          <div class="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl"></div>
            <div class="flex flex-col items-center gap-3 justify-center mb-4">
              <img src="/roulette1.png" alt="roulette" class="w-20 h-20" />
              <h1 class="text-white text-3xl font-black tracking-tighter italic">
                Projet 4 : <span class="text-green-500 ">Roulette</span>
              </h1>
              <p class="text-zinc-500 text-sm font-bold uppercase">
                Player Login
              </p>
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
                    @else if (userNameForm.errors?.['pattern']) { Only letters and numbers }
                  </p>
                }
              </div>

              <div class="flex flex-col gap-1">
                <input
                  [formControl]="passwordForm"
                  type="password"
                  placeholder="Enter your password..."
                  class="bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none border border-zinc-700
                         focus:ring-2 focus:ring-green-500/50 placeholder-zinc-500 transition-all"
                />
                @if (passwordForm.invalid && passwordForm.touched) {
                  <p class="text-red-400 text-[10px] uppercase font-bold mt-1 ml-1">
                    @if (passwordForm.errors?.['required']) { Required field }
                    @else if (passwordForm.errors?.['minlength']) { Min 6 chars }
                  </p>
                }
              </div>

            </div>
            @if (errorMessage()) {
              <p class="text-red-400 text-xs font-bold text-center">
                {{ errorMessage() }}
              </p>
            }
            <button
              (click)="login()"
              [disabled]="userNameForm.invalid || passwordForm.invalid"
              class="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600
                     disabled:cursor-not-allowed text-white font-bold
                     py-3 rounded-xl transition-all shadow-lg shadow-green-900/20">
              LOGIN
            </button>
            <button
              type="button"
              (click)="page.set('register')"
              class="text-zinc-500 hover:text-green-500 text-xs font-bold  transition-all">
              Don't have an account yet? Create an account
            </button>

          </div>
        </section>

        <!-- Bloc 2 : creation de compte -->
        <section class="h-screen w-screen shrink-0 bg-zinc-950 flex items-center justify-center p-6">
          <div class="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden">

            <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl"></div>

            <div class="flex flex-col items-center gap-3 justify-center mb-4">
              <img src="/roulette1.png" alt="roulette" class="w-20 h-20" />
              <h1 class="text-white text-3xl font-black tracking-tighter italic">
                Projet 4 : <span class="text-green-500 ">Roulette</span>
              </h1>
              <p class="text-zinc-500 text-sm font-bold uppercase">
                Create an account
              </p>
            </div>

            <div class="flex flex-col gap-4">

              <div class="flex flex-col gap-1">
                <input
                  [formControl]="userNameForm"
                  type="text"
                  placeholder="Choose your name..."
                  class="bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none border border-zinc-700
                         focus:ring-2 focus:ring-green-500/50 placeholder-zinc-500 transition-all"
                />
                @if (userNameForm.invalid && userNameForm.touched) {
                  <p class="text-red-400 text-[10px] uppercase font-bold mt-1 ml-1">
                    @if (userNameForm.errors?.['required']) { Required field }
                    @else if (userNameForm.errors?.['minlength']) { Min 3 chars }
                    @else if (userNameForm.errors?.['pattern']) { Only letters and numbers }
                  </p>
                }
              </div>

              <div class="flex flex-col gap-1">
                <input
                  [formControl]="passwordForm"
                  type="password"
                  placeholder="Choose your password..."
                  class="bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none border border-zinc-700
                         focus:ring-2 focus:ring-green-500/50 placeholder-zinc-500 transition-all"
                />
                @if (passwordForm.invalid && passwordForm.touched) {
                  <p class="text-red-400 text-[10px] uppercase font-bold mt-1 ml-1">
                    @if (passwordForm.errors?.['required']) { Required field }
                    @else if (passwordForm.errors?.['minlength']) { Min 6 chars }
                  </p>
                }
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-zinc-500 uppercase font-bold ml-1">
                  Starting Chips (CHF)
                </label>
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
                    @else if (amountForm.errors?.['min']) { Minimum CHF 1000 required }
                  </p>
                }
              </div>

            </div>
            @if (errorMessage()) {
              <p class="text-red-400 text-xs font-bold text-center">
                {{ errorMessage() }}
              </p>
            }
            <button
              (click)="register()"
              [disabled]="userNameForm.invalid || passwordForm.invalid || amountForm.invalid"
              class="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600
                     disabled:cursor-not-allowed text-white font-bold
                     py-3 rounded-xl transition-all shadow-lg shadow-green-900/20">
              CREATE ACCOUNT
            </button>
            <button
              type="button"
              (click)="page.set('login')"
              class="text-zinc-500 hover:text-green-500 text-xs font-bold transition-all">
              Already have an account? Log in
            </button>

          </div>
        </section>
      </div>
    </div>
  `,
  styles: ``,
})
export class LobbyComponent {

  private websocketService = inject(WebsocketService);

  // Current lobby page: login or register
  page = signal<'login' | 'register'>('login');
  errorMessage = signal<string | null>(null);

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

  /** * Form for the player password
   * Minimum 6 characters for a simple authentication system
   */
  passwordForm = new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(6)
    ]
  });

  /** * Form for the starting budget
   * Minimum is 1000 CHF according to Business Rules
   */
  amountForm = new FormControl<number>(1000, {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.min(1000)
    ]
  });

  /** * Action when the user logs in
   */
  login(): void {
    // 1. Stop if forms are not valid
    if (this.userNameForm.invalid || this.passwordForm.invalid) {
      return;
    }
    const name: string = this.userNameForm.value.trim();
    const password: string = this.passwordForm.value;
    // 2. Clean old connection before starting a new one
    this.websocketService.disconnect();
    // 3. Connect to the WebSocket server with login data
    this.websocketService.login(name, password, (message) => {
      this.errorMessage.set(message);
    });
  }

  /** * Action when the user creates a new account
   */
  register(): void {
    // 1. Stop if forms are not valid
    if (this.userNameForm.invalid || this.passwordForm.invalid || this.amountForm.invalid) {
      return;
    }
    const name: string = this.userNameForm.value.trim();
    const password: string = this.passwordForm.value;
    const amount: number = Number(this.amountForm.value);
    // 2. Clean old connection before starting a new one
    this.websocketService.disconnect();
    // 3. Connect to the WebSocket server with register data
    this.websocketService.register(name, password, amount, (message) => {
      this.errorMessage.set(message);
    });
  }
}
