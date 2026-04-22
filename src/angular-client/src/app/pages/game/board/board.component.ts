import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WebsocketService } from '../../../core/services/websocket.service';
import { GameStore } from '../../../core/store/game.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 items-center">
      <div class="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner">

        <button
          (click)="onCellClick(0)"
          [disabled]="!canInteract(0)"
          class="col-span-full md:col-span-1 h-16 rounded-lg font-black text-xl transition-all
             bg-green-600 hover:bg-green-500 border-b-4 border-green-800
             disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
             flex flex-col items-center justify-center relative">
          0

          @if (getBetAmount(0) > 0) {
            <div class="absolute -top-2 -right-2 w-7 h-7 bg-yellow-500 text-black text-[10px]
                        rounded-full border-2 border-white flex items-center justify-center font-black animate-bounce shadow-lg">
              {{ getBetAmount(0) }}
            </div>
          }
        </button>

        @for (n of numbers; track n) {
          <button
            (click)="onCellClick(n)"
            [disabled]="!canInteract(n)"
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
            <span class="text-green-500 animate-pulse font-black">● Place your bets</span>
            <span class="text-zinc-400 text-[10px]">Time remaining: {{ store.timeLeft() }}s</span>
          </div>
        } @else {
          <span class="text-red-500 font-black">✖ Bets Closed - Spinning...</span>
        }
      </div>
    </div>
    <!-- Edit / Delete pop-up-->
    @if (editingNumber() !== null) {

      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
           >
           <!-- (click)="forceResetEditor()"> -->

        <div class="w-[340px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
             (click)="$event.stopPropagation()">

          <div class="text-center">
            <h2 class="text-white font-bold text-lg">Edit bet</h2>
            <p class="text-zinc-400 text-xs">Number {{ editingNumber() }}</p>
          </div>

          <div>
            <label class="text-zinc-400 text-xs">Amount</label>
            <input
              type="number"
              min="1"
              class="w-full px-3 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
              [value]="editAmount()"
              (input)="onAmountInput($event)"
            />
            @if (isInvalidAmount()) {
              <div class="text-red-400 text-xs mt-1">
                Invalid amount
              </div>
            }
          </div>

          <div class="text-center text-xs">
            @if (isModified()) {
              <span class="text-blue-400 font-bold">Modify bet</span>
            } @else {
              <span class="text-red-400 font-bold">Delete bet</span>
            }
          </div>

          <div class="flex gap-2">
            <button
              (click)="confirmEdit(editingNumber()!)"
              [disabled]="isInvalidAmount()"
              class="flex-1 py-2 rounded-lg font-bold transition-all"
              [class.bg-blue-600]="isModified()"
              [class.bg-red-600]="!isModified()"
              [class.opacity-40]="isInvalidAmount()"
            >
              {{ isModified() ? 'MODIFY' : 'DELETE' }}
            </button>
            <button
              (click)="forceResetEditor()"
              class="px-4 py-2 rounded-lg bg-zinc-700 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``,
})

export class BoardComponent {
  readonly store = inject(GameStore);
  private ws = inject(WebsocketService);
  private router = inject(Router);


  constructor() {
    // Reset the edit/delete screen when the game end/start
    effect(() => {
      const isOpen = this.store.isBettingOpen();
      const table = this.store.tableState();
      // End of the game
      if (!isOpen) {
        this.forceResetEditor();
        return;
      }
      // New game
      if (table.length === 0) {
        this.forceResetEditor();
      }
    });
    // Redirect the user to the lobby when he has lost
    effect(() => {
      const isBankrupt = this.store.isBankrupt();
      const isBettingOpen = this.store.isBettingOpen();
      const table = this.store.tableState();

      const isNewRound = isBettingOpen && table.length === 0;

      if (isBankrupt && isNewRound) {
        this.router.navigate(['/lobby']);
      }
    });
  }

  // Roulette logic
  readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  readonly numbers = Array.from({ length: 36 }, (_, i) => i + 1);

  // Signals for modify / delete bets
  editingNumber = signal<number | null>(null);
  editAmount = signal<number>(0);
  initialAmount = signal<number>(0);
  
  getNumberClass(n: number): string {
    const isRed = this.redNumbers.includes(n);
    return isRed
      ? 'bg-red-600 hover:bg-red-500 border-red-800 text-white'
      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-950 text-white';
  }

  // Verify if case is available
  canInteract(n: number): boolean {
    return this.store.isBettingOpen() && !this.isNumberOccupied(n);
  }

  // Handler for the cell click
  onCellClick(n: number) {
    if (!this.canInteract(n)) return;

    if (this.hasMyBet(n)) {
      const amount = this.getBetAmount(n);

      this.editingNumber.set(n);
      this.editAmount.set(amount);
      this.initialAmount.set(amount);

      return;
    }
    this.ws.placeBet(n, 10);
  }  

  // UI Helpers to show bets on the board
  hasBet(n: number): boolean {
    const userId = this.store.userId();
    return this.store.tableState().some(bet => bet.number === n && bet.userId === userId);
  } 

  getBetOnNumber(n: number): string {
    // Similar to getBetAmount but returns a small badge text
    return this.hasBet(n) ? '✓' : '';
  }

  // Edit / Delete

  // Get the input amount (by HTML)
  onAmountInput(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.editAmount.set(Number.isFinite(value) ? value : 0);
  }

  // Force reset of editor
  forceResetEditor() {
    this.editingNumber.set(null);
    this.editAmount.set(0);
    this.initialAmount.set(0);
  }

  isInvalidAmount(): boolean {
    const amount = this.editAmount();
    const userId = this.store.userId();
    if (!userId) return true;
    // Get user to check balance
    const users = this.store.users?.();
    const user = users?.[userId] ?? null;
    // Negative check
    if (amount <= 0) return true;
    // Validate if the new bet is available
    if (user && amount > user.balance) return true;

    return false;
  }

  // Confirm editing
  confirmEdit(n: number) {
    if (this.isInvalidAmount()) return;

    if (this.isModified()) {
      this.ws.updateBet(n, this.editAmount());
    } else {
      this.ws.deleteBet(n);
    }

    this.forceResetEditor();
  }

  // Utils //

  getBetAmount(n: number): number {
    return this.store.tableState().find(b => b.number === n)?.amount ?? 0;
  }

  hasMyBet(n: number): boolean {
    const userId = this.store.userId();
    return this.store.tableState().some(b => b.number === n && b.userId === userId);
  }

  // Check if someone else (not me) has money on this number
  isNumberOccupied(n: number): boolean {
    const myId = this.store.userId();
    return this.store.tableState().some(b => b.number === n && b.userId !== myId);
  }

  isModified(): boolean {
    return this.editAmount() !== this.initialAmount();
  }
}