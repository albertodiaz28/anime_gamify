import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'ag-level-badge',
  standalone: true,
  template: `<span class="ag-level-badge" [attr.aria-label]="'Level ' + level()">Lv {{ level() }}</span>`,
  styles: [
    `
      .ag-level-badge {
        background: #ffb300;
        color: #111;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }
    `,
  ],
})
export class LevelBadgeComponent {
  private readonly authService = inject(AuthService);
  readonly level = computed(() => this.authService.currentUser()?.level ?? 1);
}
