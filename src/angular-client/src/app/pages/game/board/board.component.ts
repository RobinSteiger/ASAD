import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WebsocketService } from '../../../core/services/websocket.service';
import { GameStore } from '../../../core/store/game.store';
import { Router } from '@angular/router';

type BoardType = 'european' | 'mini';

@Component({
  selector: 'app-board',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 items-center">
      <!-- ========================================= -->
      <!-- Board selector component -->
      <!-- ========================================= -->
      <div class="flex gap-3">
        <!-- European board button -->
        <button
          (click)="selectBoard('european')"
          class="px-5 py-3 rounded-xl text-white font-bold border transition-all duration-200"
          [class.bg-zinc-700]="isSelectedBoard('european')"
          [class.border-zinc-500]="isSelectedBoard('european')"
          [class.shadow-lg]="isSelectedBoard('european')"
          [class.bg-zinc-900]="!isSelectedBoard('european')"
          [class.border-zinc-700]="!isSelectedBoard('european')">
          European Board
        </button>
        <!-- Mini board button -->
        <button
          (click)="selectBoard('mini')"
          class="px-5 py-3 rounded-xl text-white font-bold border transition-all duration-200"
          [class.bg-zinc-700]="isSelectedBoard('mini')"
          [class.border-zinc-500]="isSelectedBoard('mini')"
          [class.shadow-lg]="isSelectedBoard('mini')"
          [class.bg-zinc-900]="!isSelectedBoard('mini')"
          [class.border-zinc-700]="!isSelectedBoard('mini')">
          Mini Board
        </button>
      </div>

      <!-- ========================================= -->
      <!-- Roulette boards preview -->
      <!-- ========================================= -->
      <div class="flex flex-wrap justify-center gap-6 items-start">
        <!-- ========================================= -->
        <!-- European board -->
        <!-- ========================================= -->
        <div
          class="relative overflow-visible grid grid-cols-6 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner transition-all duration-300"
          [class.opacity-30]="isLockedOut('european')"
          [class.grayscale]="isLockedOut('european')">
          @for (n of getBoardNumbers('european'); track n) {
            <button
              (click)="onCellClick(n, 'european')"
              [disabled]="!canUseBoard('european')"
              [class]="n === 0
              ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white'
              : getNumberClass(n)"
              class="h-16 w-12 rounded-lg font-bold text-lg transition-all border-b-4
                   hover:scale-105 active:translate-y-1
                   disabled:cursor-not-allowed
                   disabled:opacity-60
                   flex flex-col items-center justify-center relative">
              {{ n }}
              <!-- Bet total badge with hover details -->
              @if (getBetAmount(n, 'european') > 0) {
                <div class="absolute -top-2 -right-2 z-[9999] group">
                  <!-- Total amount badge -->
                  <div class="w-6 h-6 bg-yellow-500 text-black text-[9px]
                            rounded-full border-2 border-white flex items-center justify-center
                            font-black shadow-lg cursor-pointer">
                    {{ getBetAmount(n, 'european') }}
                  </div>
                  <!-- Hover dropdown -->
                  <div
                    class="hidden group-hover:flex flex-col
                         absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                         min-w-[140px]
                         bg-zinc-900 border border-zinc-700
                         rounded-lg shadow-2xl
                         p-2 z-[99999]">
                    <!-- Tooltip title -->
                    <div class="text-[9px] text-zinc-400 uppercase font-bold mb-1 tracking-wide">
                      Bets on {{ n }}
                    </div>
                    <!-- Players list -->
                    @for (bet of getBetsOnNumber(n, 'european'); track bet.playerName + bet.amount) {
                      <div class="flex items-center justify-between gap-3
                                text-[10px] text-white py-1
                                border-b border-zinc-800 last:border-b-0">
                        <!-- Player name -->
                        <span class="truncate max-w-[70px]">
                        {{ bet.playerName }}
                      </span>
                        <!-- Bet amount -->
                        <span class="font-black text-yellow-400">
                        {{ bet.amount }}
                      </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </button>
          }
        </div>

        <!-- ========================================= -->
        <!-- Mini board -->
        <!-- ========================================= -->
        <div
          class="relative overflow-visible grid grid-cols-4 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner transition-all duration-300"
          [class.opacity-30]="isLockedOut('mini')"
          [class.grayscale]="isLockedOut('mini')">
          @for (n of getBoardNumbers('mini'); track n) {
            <button
              (click)="onCellClick(n, 'mini')"
              [disabled]="!canUseBoard('mini')"
              [class]="n === 0
              ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white'
              : getNumberClass(n)"
              class="h-16 w-12 rounded-lg font-bold text-lg transition-all border-b-4
                   hover:scale-105 active:translate-y-1
                   disabled:cursor-not-allowed
                   disabled:opacity-60
                   flex flex-col items-center justify-center relative">
              {{ n }}
              <!-- Bet total badge with hover details -->
              @if (getBetAmount(n, 'mini') > 0) {
                <div class="absolute -top-2 -right-2 z-[9999] group">
                  <!-- Total amount badge -->
                  <div class="w-6 h-6 bg-yellow-500 text-black text-[9px]
                            rounded-full border-2 border-white flex items-center justify-center
                            font-black shadow-lg cursor-pointer">
                    {{ getBetAmount(n, 'mini') }}
                  </div>
                  <!-- Hover dropdown -->
                  <div
                    class="hidden group-hover:flex flex-col
                         absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                         min-w-[140px]
                         bg-zinc-900 border border-zinc-700
                         rounded-lg shadow-2xl
                         p-2 z-[99999]">
                    <!-- Tooltip title -->
                    <div class="text-[9px] text-zinc-400 uppercase font-bold mb-1 tracking-wide">
                      Bets on {{ n }}
                    </div>
                    <!-- Players list -->
                    @for (bet of getBetsOnNumber(n, 'mini'); track bet.playerName + bet.amount) {
                      <div class="flex items-center justify-between gap-3
                                text-[10px] text-white py-1
                                border-b border-zinc-800 last:border-b-0">
                        <!-- Player name -->
                        <span class="truncate max-w-[70px]">
                        {{ bet.playerName }}
                      </span>
                        <!-- Bet amount -->
                        <span class="font-black text-yellow-400">
                        {{ bet.amount }}
                      </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </button>
          }
        </div>
      </div>
      <!-- ========================================= -->
      <!-- Game status -->
      <!-- ========================================= -->
      <div class="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">
        @if (store.isBettingOpen()) {
          <div class="flex flex-col items-center gap-2">
          <span class="text-green-500 animate-pulse font-black">
            ● Place your bets
          </span>
            <span class="text-zinc-400 text-[10px]">
            Time remaining: {{ store.timeLeft() }}s
          </span>
          </div>
        } @else {
          <span class="text-red-500 font-black">
          ✖ Bets Closed - Spinning...
        </span>
        }
      </div>
    </div>

    <!-- ========================================= -->
    <!-- Edit / Delete pop-up -->
    <!-- ========================================= -->
    @if (editingNumber() !== null) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
        <!-- Modal container -->
        <div
          class="w-[340px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
          (click)="$event.stopPropagation()">
          <!-- Modal header -->
          <div class="text-center">
            <h2 class="text-white font-bold text-lg">
              Edit bet
            </h2>
            <p class="text-zinc-400 text-xs">
              Number {{ editingNumber() }}
            </p>
          </div>
          <!-- Bet amount input -->
          <div>
            <label class="text-zinc-400 text-xs">
              Amount
            </label>
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
          <!-- Edit / delete mode -->
          <div class="text-center text-xs">
            @if (isModified()) {
              <span class="text-blue-400 font-bold">
              Modify bet
            </span>
            } @else {
              <span class="text-red-400 font-bold">
              Delete bet
            </span>
            }
          </div>
          <!-- Action buttons -->
          <div class="flex gap-2">
            <button
              (click)="confirmEdit(editingNumber()!)"
              [disabled]="isInvalidAmount()"
              class="flex-1 py-2 rounded-lg font-bold transition-all"
              [class.bg-blue-600]="isModified()"
              [class.bg-red-600]="!isModified()"
              [class.opacity-40]="isInvalidAmount()">
              {{ isModified() ? 'MODIFY' : 'DELETE' }}
            </button>
            <button
              (click)="forceResetEditor()"
              class="px-4 py-2 rounded-lg bg-zinc-700 text-white">
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
  readonly ws = inject(WebsocketService);
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
  // Local board selection for UI preview only
  selectedBoard = signal<BoardType>('european');
  // Signals for modify / delete bets
  editingNumber = signal<number | null>(null);
  editingBoardType = signal<BoardType | null>(null);
  editAmount = signal<number>(0);
  initialAmount = signal<number>(0);
  // Returns the numbers of the current board, except zero
  numbers() {
    return this.store.board().numbers.filter(n => n !== 0);
  }

  getNumberClass(n: number): string {
    const isRed = this.redNumbers.includes(n);
    return isRed
      ? 'bg-red-600 hover:bg-red-500 border-red-800 text-white'
      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-950 text-white';
  }

  // Returns the numbers for a specific board
  getBoardNumbers(type: BoardType): number[] {
    return type === 'mini'
      ? Array.from({ length: 13 }, (_, i) => i)
      : Array.from({ length: 37 }, (_, i) => i);
  }

  // Select board only for local UI highlight
  selectBoard(type: BoardType): void {
    if (this.myBoardType()) {
      return;
    }
    this.selectedBoard.set(type);
  }

  // Get the current player's locked board
  myBoardType(): BoardType | null {
    const userId = this.store.userId();
    if (!userId) {
      return null;
    }
    return this.store.users()[userId]?.boardType ?? null;
  }

  // Checks if the board is currently selected
  isSelectedBoard(type: BoardType): boolean {
    const myBoard = this.myBoardType();
    if (myBoard) {
      return myBoard === type;
    }
    return this.selectedBoard() === type;
  }

  // Check if the player is locked out from this board
  isLockedOut(boardType: BoardType): boolean {
    const myBoard = this.myBoardType();
    if (!myBoard) {
      return false;
    }
    return myBoard !== boardType;
  }

  // Returns the current player's bet amount on a specific number
  getMyBetAmount(n: number, boardType: BoardType): number {
    const userId = this.store.userId();
    return this.store.tableState()
      .find(
        bet =>
          bet.number === n &&
          bet.userId === userId &&
          bet.boardType === boardType,
      )?.amount ?? 0;
  }

  // Handler for the cell click
  onCellClick(n: number, boardType: BoardType) {
    // Stop if the board is inactive
    if (!this.canUseBoard(boardType)) {
      return;
    }
    if (this.hasMyBet(n, boardType)) {
      const amount = this.getMyBetAmount(n, boardType);
      this.editingNumber.set(n);
      this.editingBoardType.set(boardType);
      this.editAmount.set(amount);
      this.initialAmount.set(amount);
      return;
    }
    this.ws.placeBet(n, 10, boardType);
  }

  // Returns all bets only for the selected board
  // Returns all bets only for the selected board
  getBetsOnNumber(n: number, boardType: BoardType) {
    if (!this.isActiveBoard(boardType)) {
      return [];
    }
    const users = this.store.users();
    return this.store.tableState()
      .filter(bet =>
        bet.number === n &&
        bet.boardType === boardType,
      )
      .map(bet => ({
        playerName: users[bet.userId]?.name ?? 'Unknown player',
        amount: bet.amount,
      }));
  }
  // Check if this board is active
  isActiveBoard(boardType: BoardType): boolean {
    const myBoard = this.myBoardType();
    // No board selected yet
    if (!myBoard) {
      return true;
    }
    return myBoard === boardType;
  }

  // Allow action only on available board
  canUseBoard(boardType: BoardType): boolean {
    if (!this.store.isBettingOpen()) {
      return false;
    }
    const myBoard = this.myBoardType();
    // No selected board yet
    if (!myBoard) {
      return true;
    }
    // Player locked to this board
    return myBoard === boardType;
  }

  // Returns the total amount only for the selected board
  // Returns the total amount only for the selected board
  getBetAmount(n: number, boardType: BoardType): number {
    if (!this.isActiveBoard(boardType)) {
      return 0;
    }
    return this.store.tableState()
      .filter(bet =>
        bet.number === n &&
        bet.boardType === boardType,
      )
      .reduce((sum, bet) => sum + bet.amount, 0);
  }
  // Get the input amount (by HTML)
  onAmountInput(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.editAmount.set(Number.isFinite(value) ? value : 0);
  }

  // Force reset of editor
  forceResetEditor() {
    this.editingNumber.set(null);
    this.editingBoardType.set(null);
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
    const difference = amount - this.initialAmount();
    if (user && difference > 0 && difference > user.balance) {
      return true;
    }
    return false;
  }

  // Confirm editing
  confirmEdit(n: number) {
    if (this.isInvalidAmount()) return;
    const boardType = this.editingBoardType();
    if (!boardType) {
      return;
    }
    if (this.isModified()) {
      this.ws.updateBet(n, this.editAmount(), boardType);
    } else {
      this.ws.deleteBet(n, boardType);
    }
    this.forceResetEditor();
  }

  // Check if I have a bet on this number
  hasMyBet(n: number, boardType: BoardType): boolean {
    const userId = this.store.userId();
    return this.store.tableState()
      .some(bet =>
        bet.number === n &&
        bet.userId === userId &&
        bet.boardType === boardType,
      );
  }

  isModified(): boolean {
    return this.editAmount() !== this.initialAmount();
  }
}
