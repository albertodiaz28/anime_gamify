import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { AvatarConfig, User } from '@anime-gamify/shared-types';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  updateAvatar(config: AvatarConfig): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/me/avatar`, { avatarConfig: config });
  }
}
