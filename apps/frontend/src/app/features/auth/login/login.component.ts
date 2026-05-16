import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ag-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="ag-auth">
      <h1>Login</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" autocomplete="email" />
        </label>
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p class="ag-error">Valid email required.</p>
        }

        <label>
          <span>Password</span>
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <p class="ag-error">Password is required.</p>
        }

        @if (serverError()) {
          <p class="ag-error">{{ serverError() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Signing in...' : 'Login' }}
        </button>
      </form>
      <p>
        No account? <a routerLink="/auth/register">Register</a>
      </p>
    </section>
  `,
  styles: [
    `
      .ag-auth {
        max-width: 360px;
        margin: 3rem auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .ag-error {
        color: #c62828;
        margin: 0;
        font-size: 0.85rem;
      }
      button {
        padding: 0.5rem 1rem;
        background: #1976d2;
        color: #fff;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.serverError.set(null);
    try {
      await this.authService.login(this.form.getRawValue());
      await this.router.navigate(['/catalog']);
    } catch (error) {
      this.serverError.set(this.extractMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string | string[] } | null;
      if (body?.message) {
        return Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
      return error.message;
    }
    return 'Unexpected error.';
  }
}
