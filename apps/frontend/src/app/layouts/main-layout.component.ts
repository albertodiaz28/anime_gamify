import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'ag-main-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <header class="ag-navbar">
      <a class="ag-navbar__brand" routerLink="/catalog">Anime Gamify</a>
      <nav class="ag-navbar__nav">
        @if (isAuthenticated()) {
          <span class="ag-level-badge">Lv {{ level() }}</span>
          <div class="ag-xp-bar" [attr.aria-label]="'XP ' + xp()">
            <div class="ag-xp-bar__fill" [style.width.%]="xpPercent()"></div>
          </div>
          <a routerLink="/profile">{{ username() }}</a>
          <button type="button" (click)="logout()">Logout</button>
        } @else {
          <a routerLink="/auth/login">Login</a>
          <a routerLink="/auth/register">Register</a>
        }
      </nav>
    </header>
    <main class="ag-main">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .ag-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        background: #111;
        color: #fff;
      }
      .ag-navbar__brand {
        font-weight: 700;
        color: #fff;
        text-decoration: none;
      }
      .ag-navbar__nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .ag-navbar__nav a {
        color: #fff;
        text-decoration: none;
      }
      .ag-level-badge {
        background: #ffb300;
        color: #111;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }
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
      }
      .ag-main {
        flex: 1;
        padding: 1rem;
      }
      button {
        background: transparent;
        border: 1px solid #fff;
        color: #fff;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly username = computed(() => this.authService.currentUser()?.username ?? '');
  readonly level = computed(() => this.authService.currentUser()?.level ?? 1);
  readonly xp = computed(() => this.authService.currentUser()?.xp ?? 0);
  readonly xpPercent = computed(() => {
    const xp = this.xp();
    return Math.min(100, xp % 100);
  });

  logout(): void {
    this.authService.logout();
  }
}
