import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  AnimeCard,
  CatalogQuery,
  Language,
} from '@anime-gamify/shared-types';
import { CatalogSort } from '@anime-gamify/shared-types';
import { AnimeApi } from '../../core/services/anime.api';

const DEFAULT_LIMIT = 24;

export interface CatalogFilters {
  q: string;
  categoryId: string[];
  language: Language[];
  minEpisodes: number | null;
  maxEpisodes: number | null;
  season: number | null;
  sort: CatalogSort;
}

export const EMPTY_FILTERS: CatalogFilters = {
  q: '',
  categoryId: [],
  language: [],
  minEpisodes: null,
  maxEpisodes: null,
  season: null,
  sort: CatalogSort.NEWEST,
};

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly animeApi = inject(AnimeApi);

  private readonly filtersSignal = signal<CatalogFilters>({ ...EMPTY_FILTERS });
  private readonly resultsSignal = signal<AnimeCard[]>([]);
  private readonly cursorSignal = signal<string | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly hasMoreSignal = signal<boolean>(true);
  private readonly errorSignal = signal<string | null>(null);

  readonly filters = this.filtersSignal.asReadonly();
  readonly results = this.resultsSignal.asReadonly();
  readonly cursor = this.cursorSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isEmpty = computed(
    () => !this.loadingSignal() && this.resultsSignal().length === 0,
  );

  setFilters(filters: CatalogFilters): void {
    this.filtersSignal.set(filters);
    void this.reload();
  }

  patchFilters(patch: Partial<CatalogFilters>): void {
    this.filtersSignal.update((current) => ({ ...current, ...patch }));
    void this.reload();
  }

  async reload(): Promise<void> {
    this.resultsSignal.set([]);
    this.cursorSignal.set(null);
    this.hasMoreSignal.set(true);
    await this.loadNext();
  }

  async loadNext(): Promise<void> {
    if (this.loadingSignal() || !this.hasMoreSignal()) {
      return;
    }
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const query = this.buildQuery();
      const page = await firstValueFrom(this.animeApi.getCatalog(query));
      this.resultsSignal.update((current) => [...current, ...page.items]);
      this.cursorSignal.set(page.nextCursor);
      this.hasMoreSignal.set(page.nextCursor !== null);
    } catch (err) {
      this.errorSignal.set(this.extractMessage(err));
      this.hasMoreSignal.set(false);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private buildQuery(): CatalogQuery {
    const f = this.filtersSignal();
    const query: CatalogQuery = {
      limit: DEFAULT_LIMIT,
      sort: f.sort,
    };
    if (f.q.trim()) query.q = f.q.trim();
    if (f.categoryId.length) query.categoryId = f.categoryId;
    if (f.language.length) query.language = f.language;
    if (f.minEpisodes !== null) query.minEpisodes = f.minEpisodes;
    if (f.maxEpisodes !== null) query.maxEpisodes = f.maxEpisodes;
    if (f.season !== null) query.season = f.season;
    if (this.cursorSignal()) query.cursor = this.cursorSignal() ?? undefined;
    return query;
  }

  private extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Failed to load catalog.';
  }
}
