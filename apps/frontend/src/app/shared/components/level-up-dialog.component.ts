import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ag-level-up-dialog',
  standalone: true,
  template: `
    <div class="ag-modal-backdrop" (click)="close.emit()">
      <div class="ag-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <div class="ag-confetti" aria-hidden="true">
          @for (i of confettiPieces; track i) {
            <span class="ag-confetti__piece" [style.--i]="i"></span>
          }
        </div>
        <h2>Level Up!</h2>
        <p class="ag-modal__level">You reached level <strong>{{ newLevel }}</strong></p>
        @if (unlockedSkillIds.length > 0) {
          <p class="ag-modal__unlocked">Skills unlocked: {{ unlockedSkillIds.length }}</p>
          <ul>
            @for (id of unlockedSkillIds; track id) {
              <li>{{ id }}</li>
            }
          </ul>
        }
        <button type="button" (click)="close.emit()">Continue</button>
      </div>
    </div>
  `,
  styles: [
    `
      .ag-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }
      .ag-modal {
        position: relative;
        background: #222;
        color: #fff;
        padding: 2rem;
        border-radius: 12px;
        min-width: 320px;
        max-width: 90vw;
        text-align: center;
        overflow: hidden;
      }
      h2 {
        margin: 0 0 0.5rem;
        color: #ffb300;
      }
      .ag-modal__level {
        font-size: 1.1rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 1rem;
      }
      button {
        background: #1976d2;
        color: #fff;
        border: 0;
        padding: 0.5rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
      }
      .ag-confetti {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .ag-confetti__piece {
        position: absolute;
        top: -10%;
        left: calc(var(--i) * 7%);
        width: 8px;
        height: 14px;
        background: hsl(calc(var(--i) * 30), 80%, 60%);
        animation: ag-confetti-fall 1.6s linear infinite;
        animation-delay: calc(var(--i) * -150ms);
      }
      @keyframes ag-confetti-fall {
        0% {
          transform: translateY(0) rotate(0);
          opacity: 1;
        }
        100% {
          transform: translateY(120vh) rotate(720deg);
          opacity: 0;
        }
      }
    `,
  ],
})
export class LevelUpDialogComponent {
  @Input({ required: true }) newLevel!: number;
  @Input() unlockedSkillIds: string[] = [];
  @Output() close = new EventEmitter<void>();

  readonly confettiPieces = Array.from({ length: 14 }, (_, i) => i);
}
