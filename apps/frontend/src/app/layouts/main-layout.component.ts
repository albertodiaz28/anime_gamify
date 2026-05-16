import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LevelBadgeComponent } from '../shared/components/level-badge.component';
import { XpBarComponent } from '../shared/components/xp-bar.component';
import { ToastHostComponent } from '../shared/components/toast-host.component';

@Component({
  selector: 'ag-main-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    LevelBadgeComponent,
    XpBarComponent,
    ToastHostComponent,
  ],
  template: `
    <header class="ag-navbar">
      <a class="ag-navbar__brand" routerLink="/catalog">Anime Gamify</a>
      <nav class="ag-navbar__nav">
        @if (isAuthenticated()) {
          <ag-level-badge />
          <ag-xp-bar />
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
    <ag-toast-host />
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

  logout(): void {
    this.authService.logout();
  }
}
