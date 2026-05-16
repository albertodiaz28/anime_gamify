import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  AnimeCard,
  AnimeDetail,
  CatalogQuery,
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

  private buildParams(query: CatalogQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
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
