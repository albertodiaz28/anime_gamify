import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { Comment, CursorPage, RatingAggregate } from '@anime-gamify/shared-types';
import { API_URL } from './api.config';

export interface CreateCommentPayload {
  body: string;
  parentId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SocialApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  rateAnime(animeId: string, score: number): Observable<RatingAggregate> {
    return this.http.post<RatingAggregate>(`${this.apiUrl}/animes/${animeId}/rating`, {
      score,
    });
  }

  getMyRating(animeId: string): Observable<{ score: number } | null> {
    return this.http.get<{ score: number } | null>(
      `${this.apiUrl}/animes/${animeId}/rating/me`,
    );
  }

  listComments(animeId: string, cursor?: string): Observable<CursorPage<Comment>> {
    let params = new HttpParams();
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<CursorPage<Comment>>(
      `${this.apiUrl}/animes/${animeId}/comments`,
      { params },
    );
  }

  createComment(animeId: string, payload: CreateCommentPayload): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/animes/${animeId}/comments`, payload);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}
