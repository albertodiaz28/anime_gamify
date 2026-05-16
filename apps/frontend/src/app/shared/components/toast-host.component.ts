import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'ag-toast-host',
  standalone: true,
  template: `
    <div class="ag-toast-host" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="ag-toast" [class]="'ag-toast--' + toast.kind" (click)="dismiss(toast.id)">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ag-toast-host {
        position: fixed;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
      }
      .ag-toast {
        background: #333;
        color: #fff;
        padding: 0.6rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: ag-toast-in 200ms ease-out;
      }
      .ag-toast--success {
        background: #2e7d32;
      }
      .ag-toast--error {
        background: #c62828;
      }
      .ag-toast--xp {
        background: linear-gradient(90deg, #00bcd4, #4caf50);
        font-weight: 700;
      }
      @keyframes ag-toast-in {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
