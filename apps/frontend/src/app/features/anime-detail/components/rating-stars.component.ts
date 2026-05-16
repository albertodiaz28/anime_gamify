import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

const STARS = Array.from({ length: 10 }, (_, i) => i + 1);

@Component({
  selector: 'ag-rating-stars',
  standalone: true,
  template: `
    <div class="ag-stars" role="radiogroup" aria-label="Rate this anime">
      @for (n of stars; track n) {
        <button
          type="button"
          class="ag-star"
          [class.ag-star--filled]="n <= displayValue()"
          [attr.aria-checked]="n === value"
          (mouseenter)="hover.set(n)"
          (mouseleave)="hover.set(null)"
          (click)="select(n)"
          [disabled]="disabled"
          [title]="n + '/10'"
        >★</button>
      }
      @if (value > 0) {
        <span class="ag-stars__label">{{ value }}/10</span>
      }
    </div>
  `,
  styles: [
    `
      .ag-stars {
        display: inline-flex;
        align-items: center;
        gap: 0.1rem;
      }
      .ag-star {
        background: transparent;
        border: 0;
        color: #555;
        font-size: 1.4rem;
        cursor: pointer;
        padding: 0 0.05rem;
        transition: color 100ms;
      }
      .ag-star:disabled {
        cursor: not-allowed;
      }
      .ag-star--filled {
        color: #ffb300;
      }
      .ag-stars__label {
        margin-left: 0.5rem;
        font-weight: 700;
      }
    `,
  ],
})
export class RatingStarsComponent {
  @Input() value = 0;
  @Input() disabled = false;
  @Output() rate = new EventEmitter<number>();

  readonly stars = STARS;
  readonly hover = signal<number | null>(null);

  displayValue(): number {
    return this.hover() ?? this.value;
  }

  select(n: number): void {
    if (this.disabled) return;
    this.rate.emit(n);
  }
}
