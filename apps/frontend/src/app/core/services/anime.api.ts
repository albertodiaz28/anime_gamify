import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  AnimeCard,
  AnimeDetail,
  CatalogQuery,
  Category,
  Episode,
  Server,
} from '@anime-gamify/shared-types';
import { API_URL } from './api.config';

export interface CatalogPage {
  items: AnimeCard[];
  nextCursor: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnimeApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getCatalog(query: CatalogQuery): Observable<CatalogPage> {
    return this.http.get<CatalogPage>(`${this.apiUrl}/animes`, {
      params: this.buildParams(query),
    });
  }

  getAnime(id: string): Observable<AnimeDetail> {
    return this.http.get<AnimeDetail>(`${this.apiUrl}/animes/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getEpisode(episodeId: string): Observable<Episode> {
    return this.http.get<Episode>(`${this.apiUrl}/episodes/${episodeId}`);
  }

  getEpisodeServers(episodeId: string): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.apiUrl}/episodes/${episodeId}/servers`);
  }

  private buildParams(query: CatalogQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      if (Array.isArray(value)) {
        for (const v of value) {
          params = params.append(key, String(v));
        }
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
