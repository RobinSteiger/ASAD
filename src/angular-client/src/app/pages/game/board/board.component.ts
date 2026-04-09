import {Component, inject, signal} from '@angular/core';
import {WebsocketService} from '../../../core/services/websocket.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

const NUMBERS = Array.from({ length: 37 }, (_, i) => i);

@Component({
  selector: 'app-board',
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div
        class="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-4 border-zinc-700 shadow-2xl bg-zinc-800 flex items-center justify-center">

        @for (n of numbers; track n; let i = $index) {
          <button
            (click)="selectNumber(n)"
            [style.transform]="'rotate(' + (i * (360 / 37)) + 'deg)'"
            class="absolute top-0 h-1/2 w-8 origin-bottom flex justify-center pt-2 transition-transform hover:scale-110"
          >
            <div
              [class]="getNumberClass(n)"
              class="w-6 h-10 rounded-sm flex items-center justify-center text-[10px] font-bold border border-white/10 shadow-sm"
              [class.ring-4]="selected() === n"
              [class.ring-yellow-400]="selected() === n"
            >
              <span [style.transform]="'rotate(' + -(i * (360 / 37)) + 'deg)'">
                {{ n }}
              </span>
            </div>
          </button>
        }

        <div
          class="z-10 w-32 h-32 rounded-full bg-zinc-900 border-2 border-zinc-700 flex flex-col items-center justify-center shadow-inner text-center">
          @if (selected() !== null) {
            <span class="text-zinc-500 text-xs uppercase">Number</span>
            <span class="text-3xl font-black text-green-400">{{ selected() }}</span>
          } @else {
            <span class="text-zinc-500 text-xs px-2">Place your bet</span>
          }
        </div>
      </div>
    </div>

  `,
  styles: ``,
})

export class BoardComponent {
  ws       = inject(WebsocketService);
  selected = signal<number | null>(null);
  numbers  = NUMBERS;

  amountCtrl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);

  /*// ── Calculs SVG ──────────────────────────────────────────────

  private angleStart(i: number): number {
    return (i / TOTAL) * 360 - 90 + GAP_DEG / 2;
  }

  private angleEnd(i: number): number {
    return ((i + 1) / TOTAL) * 360 - 90 - GAP_DEG / 2;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  // Génère le path SVG d'un secteur (anneau entre r=55 et r=97)
  getSector(i: number): string {
    const cx = 100, cy = 100;
    const r1 = 55;  // rayon intérieur
    const r2 = 97;  // rayon extérieur

    const a1 = this.toRad(this.angleStart(i));
    const a2 = this.toRad(this.angleEnd(i));

    const x1 = cx + r2 * Math.cos(a1);
    const y1 = cy + r2 * Math.sin(a1);
    const x2 = cx + r2 * Math.cos(a2);
    const y2 = cy + r2 * Math.sin(a2);
    const x3 = cx + r1 * Math.cos(a2);
    const y3 = cy + r1 * Math.sin(a2);
    const x4 = cx + r1 * Math.cos(a1);
    const y4 = cy + r1 * Math.sin(a1);

    const largeArc = 0; // secteur < 180°

    return [
      `M ${x1} ${y1}`,
      `A ${r2} ${r2} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${r1} ${r1} 0 ${largeArc} 0 ${x4} ${y4}`,
      `Z`
    ].join(' ');
  }

  // Position du label au milieu du secteur
  getLabelX(i: number): number {
    const mid = this.toRad((this.angleStart(i) + this.angleEnd(i)) / 2);
    return 100 + 74 * Math.cos(mid); // r moyen = (55+97)/2 = 76
  }

  getLabelY(i: number): number {
    const mid = this.toRad((this.angleStart(i) + this.angleEnd(i)) / 2);
    return 100 + 74 * Math.sin(mid);
  }

  // ── Couleurs ─────────────────────────────────────────────────

  getFill(n: number): string {
    const isWinner   = this.ws.rngResult() === n;
    const hasBet     = this.ws.tableState().some(b => b.number === n);
    const isSelected = this.selected() === n;

    if (isWinner)   return '#facc15'; // jaune
    if (hasBet)     return '#2563eb'; // bleu
    if (isSelected) return '#16a34a'; // vert sélection
    if (n === 0)    return '#15803d'; // vert 0
    if (RED_NUMBERS.includes(n)) return '#b91c1c'; // rouge
    return '#3f3f46'; // zinc (noir)
  }

  getStroke(n: number): string {
    const isWinner   = this.ws.rngResult() === n;
    const isSelected = this.selected() === n;
    if (isWinner)   return '#fde047';
    if (isSelected) return '#4ade80';
    return '#52525b';
  }

  getCenterColor(): string {
    const n = this.selected();
    if (n === null) return 'white';
    if (n === 0)    return '#4ade80';
    if (RED_NUMBERS.includes(n)) return '#f87171';
    return '#d4d4d8';
  }*/

  // ── Actions ──────────────────────────────────────────────────


  redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];


  getNumberClass(n: number): string {
    if (n === 0) return 'bg-green-600';
    return this.redNumbers.includes(n) ? 'bg-red-600' : 'bg-zinc-700';
  }

  selectNumber(n: number): void {
    if (!this.ws.betsOpen()) return;
    this.selected.set(n);
  }

  placeBet(): void {
    if (this.amountCtrl.invalid || this.selected() === null) return;
    this.ws.submitBet(this.selected()!, this.amountCtrl.value!);
    this.amountCtrl.reset();
    this.selected.set(null);
  }
}
