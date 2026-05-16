import { Component, computed, inject } from '@angular/core';
import { xpInCurrentLevel, xpToNext } from '@anime-gamify/shared-constants';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'ag-xp-bar',
  standalone: true,
  template: `
    <div class="ag-xp-bar" [attr.aria-label]="'XP ' + xp()">
      <div class="ag-xp-bar__fill" [style.width.%]="xpPercent()"></div>
    </div>
  `,
  styles: [
    `
      .ag-xp-bar {
        width: 120px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
      }
      .ag-xp-bar__fill {
        height: 100%;
        background: linear-gradient(90deg, #00bcd4, #4caf50);
        transition: width 300ms ease-out;
      }
    `,
  ],
})
export class XpBarComponent {
  private readonly authService = inject(AuthService);
  readonly xp = computed(() => this.authService.currentUser()?.xp ?? 0);
  readonly level = computed(() => this.authService.currentUser()?.level ?? 1);
  readonly xpPercent = computed(() => {
    const inCurrent = xpInCurrentLevel(this.xp());
    const toNext = xpToNext(this.level());
    return toNext > 0 ? Math.min(100, (inCurrent / toNext) * 100) : 100;
  });
}
