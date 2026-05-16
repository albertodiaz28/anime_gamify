import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

function matchPassword(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!password || !confirm) {
    return null;
  }
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'ag-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="ag-auth">
      <h1>Create account</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" autocomplete="email" />
        </label>
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p class="ag-error">Valid email required.</p>
        }

        <label>
          <span>Username</span>
          <input type="text" formControlName="username" autocomplete="username" />
        </label>
        @if (form.controls.username.touched && form.controls.username.invalid) {
          <p class="ag-error">Username must be at least 3 characters.</p>
        }

        <label>
          <span>Password</span>
          <input type="password" formControlName="password" autocomplete="new-password" />
        </label>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <p class="ag-error">Password must be at least 8 characters.</p>
        }

        <label>
          <span>Confirm password</span>
          <input type="password" formControlName="confirmPassword" autocomplete="new-password" />
        </label>
        @if (
          form.controls.confirmPassword.touched &&
          form.hasError('passwordMismatch')
        ) {
          <p class="ag-error">Passwords do not match.</p>
        }

        @if (serverError()) {
          <p class="ag-error">{{ serverError() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Creating...' : 'Register' }}
        </button>
      </form>
      <p>
        Already have an account? <a routerLink="/auth/login">Login</a>
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPassword },
  );

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.serverError.set(null);
    const { email, username, password } = this.form.getRawValue();
    try {
      await this.authService.register({ email, username, password });
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
