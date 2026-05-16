import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { WatchResult } from '@anime-gamify/shared-types';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class GamificationApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  markWatched(episodeId: string): Observable<WatchResult> {
    return this.http.post<WatchResult>(
      `${this.apiUrl}/episodes/${episodeId}/watch`,
      {},
    );
  }
}
