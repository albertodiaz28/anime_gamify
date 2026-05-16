import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

function runGuard(): boolean | UrlTree {
  const injector = TestBed.inject(EnvironmentInjector);
  return runInInjectionContext(
    injector,
    () =>
      authGuard(
        { path: '' } as never,
        [] as never,
      ) as boolean | UrlTree,
  );
}

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  it('redirects to /auth/login when unauthenticated', () => {
    const authService = TestBed.inject(AuthService);
    expect(authService.isAuthenticated()).toBe(false);

    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('allows match when authenticated', () => {
    localStorage.setItem('ag.accessToken', 'tok');
    TestBed.inject(AuthService).loadFromStorage();

    const result = runGuard();
    expect(result).toBe(true);
  });
});
