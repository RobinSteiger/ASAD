import {Component, inject} from '@angular/core';
import {WebsocketService} from '../../core/services/websocket.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-lobby',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-zinc-100 flex items-center justify-center">
      <div class="bg-zinc-600 p-10 rounded-2xl shadow-xl w-80 flex flex-col gap-6">

        <!--<h1 class="text-white text-3xl font-bold text-center tracking-wide">
          🎰 Roulette
        </h1>-->
        <div class="flex flex items-center gap-3 justify-center">
         <!-- <img src="/roulette2.svg" class="w-10 h-10 " />-->
          <img src="/roulette1.png" alt="roulette" class="w-10 h-10" />


          <h1 class="text-white text-3xl font-bold text-center tracking-wide">
            Roulette
          </h1>
        </div>

        <input
          [formControl]="userNameForm"
          type="text"
          placeholder="Your Name..."
          class="bg-zinc-700 text-white rounded-lg px-4 py-3 outline-none
                 focus:ring-2 focus:ring-green-500 placeholder-zinc-400"
        />

        @if (userNameForm.invalid && userNameForm.touched) {

          @if (userNameForm.errors?.['required']) {
            <p class="text-red-400 text-sm -mt-3">
              Username is required.
            </p>
          }

          @if (userNameForm.errors?.['minlength']) {
            <p class="text-red-400 text-sm -mt-3">
              Minimum 3 characters.
            </p>
          }

          @if (userNameForm.errors?.['pattern']) {
            <p class="text-red-400 text-sm -mt-3">
              No special characters allowed.
            </p>
          }

        }

        <button
          (click)="joinGame()"
          [disabled]="userNameForm.invalid"
          class="bg-green-500 hover:bg-green-400 disabled:bg-zinc-400
                 disabled:cursor-not-allowed text-white font-semibold
                 py-3 rounded-lg transition-colors">
          Join the game
        </button>

      </div>
    </div>
  `,
  styles: ``,
})
export class LobbyComponent {


  private ws = inject(WebsocketService);
  userNameForm = new FormControl  ('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/^[a-zA-Z0-9]+$/)
  ]);

  joinGame(){
    if(this.userNameForm.invalid){
      return;
    }
    this.ws.connect(this.userNameForm.value!.trim());
  }

}
