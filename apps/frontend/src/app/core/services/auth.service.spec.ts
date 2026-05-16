import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import type { AuthResponse } from '@anime-gamify/shared-types';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';

const API = 'http://test.local/api';

const mockResponse: AuthResponse = {
  user: {
    id: 'user-1',
    email: 'a@b.com',
    username: 'alice',
    level: 1,
    xp: 0,
    avatarConfig: { baseSkin: 'default' },
    createdAt: new Date().toISOString(),
  },
  tokens: { accessToken: 'jwt-token', expiresIn: 3600 },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('stores token and user on login', async () => {
    const promise = service.login({ email: 'a@b.com', password: 'secret123' });
    const req = httpMock.expectOne(`${API}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    await promise;

    expect(service.token()).toBe('jwt-token');
    expect(service.currentUser()?.email).toBe('a@b.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('ag.accessToken')).toBe('jwt-token');
  });

  it('clears signals and storage on logout', async () => {
    const promise = service.login({ email: 'a@b.com', password: 'secret123' });
    httpMock.expectOne(`${API}/auth/login`).flush(mockResponse);
    await promise;

    service.logout(false);

    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ag.accessToken')).toBeNull();
  });

  it('loads token from localStorage', () => {
    localStorage.setItem('ag.accessToken', 'persisted-token');
    localStorage.setItem('ag.user', JSON.stringify(mockResponse.user));

    service.loadFromStorage();

    expect(service.token()).toBe('persisted-token');
    expect(service.currentUser()?.username).toBe('alice');
  });
});
