import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@anime-gamify/shared-types';
import { API_URL } from './api.config';

const ACCESS_TOKEN_KEY = 'ag.accessToken';
const USER_KEY = 'ag.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<User | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (token) {
      this.tokenSignal.set(token);
    }
    if (rawUser) {
      try {
        this.userSignal.set(JSON.parse(rawUser) as User);
      } catch {
        this.userSignal.set(null);
      }
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload),
    );
    this.persistSession(response);
    return response;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload),
    );
    this.persistSession(response);
    return response;
  }

  logout(redirect = true): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    if (redirect) {
      void this.router.navigate(['/auth/login']);
    }
  }

  setCurrentUser(user: User): void {
    this.userSignal.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private persistSession(response: AuthResponse): void {
    this.tokenSignal.set(response.tokens.accessToken);
    this.userSignal.set(response.user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.tokens.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  }
}
