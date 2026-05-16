import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import type { Category, Language } from '@anime-gamify/shared-types';
import { CatalogSort } from '@anime-gamify/shared-types';
import { AnimeApi } from '../../core/services/anime.api';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton.component';
import { AnimeCardComponent } from './components/anime-card.component';
import { FiltersComponent } from './components/filters.component';
import { CatalogStore, CatalogFilters, EMPTY_FILTERS } from './catalog.store';

@Component({
  selector: 'ag-catalog-page',
  standalone: true,
  imports: [
    FormsModule,
    AnimeCardComponent,
    FiltersComponent,
    LoadingSkeletonComponent,
  ],
  template: `
    <div class="ag-catalog">
      <ag-filters
        [filters]="store.filters()"
        [categories]="categories()"
        (filtersChange)="onFilterPatch($event)"
        (reset)="onReset()"
      />

      <div class="ag-catalog__main">
        <div class="ag-catalog__searchbar">
          <input
            type="search"
            placeholder="Search anime..."
            [ngModel]="searchText()"
            (ngModelChange)="onSearchInput($event)"
            aria-label="Search anime"
          />
        </div>

        @if (store.error()) {
          <div class="ag-catalog__error">
            {{ store.error() }}
            <button type="button" (click)="retry()">Retry</button>
          </div>
        }

        <div class="ag-catalog__grid">
          @for (item of store.results(); track item.id) {
            <ag-anime-card [anime]="item" />
          }
          @if (store.loading()) {
            @for (i of skeletons; track i) {
              <div class="ag-catalog__skeleton">
                <ag-loading-skeleton height="240px" radius="8px" />
              </div>
            }
          }
        </div>

        @if (store.isEmpty()) {
          <div class="ag-catalog__empty">No anime found. Try a different filter.</div>
        }

        <div #sentinel class="ag-catalog__sentinel" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .ag-catalog {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 1rem;
      }
      .ag-catalog__main {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .ag-catalog__searchbar input {
        width: 100%;
        padding: 0.6rem 0.75rem;
        background: #1a1a1a;
        border: 1px solid #333;
        color: #fff;
        border-radius: 6px;
      }
      .ag-catalog__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
      }
      .ag-catalog__skeleton {
        background: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
      }
      .ag-catalog__empty {
        padding: 3rem;
        text-align: center;
        color: #888;
      }
      .ag-catalog__error {
        padding: 1rem;
        background: #3a1f1f;
        border-radius: 6px;
        color: #ffaaaa;
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .ag-catalog__error button {
        background: #c62828;
        color: #fff;
        border: 0;
        padding: 0.3rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .ag-catalog__sentinel {
        height: 1px;
      }
      @media (max-width: 768px) {
        .ag-catalog {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CatalogPageComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly store = inject(CatalogStore);
  private readonly animeApi = inject(AnimeApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('sentinel') sentinel?: ElementRef<HTMLElement>;

  readonly categories = signal<Category[]>([]);
  readonly searchText = signal<string>('');
  readonly skeletons = Array.from({ length: 6 }, (_, i) => i);

  private readonly searchSubject = new Subject<string>();
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    void this.loadCategories();
    this.readQueryParams();
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        this.store.patchFilters({ q });
        this.syncUrl();
      });
  }

  ngAfterViewInit(): void {
    if (!this.sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && this.store.hasMore() && !this.store.loading()) {
          void this.store.loadNext();
        }
      }
    }, { rootMargin: '200px' });
    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.searchSubject.next(value);
  }

  onFilterPatch(patch: Partial<CatalogFilters>): void {
    this.store.patchFilters(patch);
    this.syncUrl();
  }

  onReset(): void {
    this.searchText.set('');
    this.store.setFilters({ ...EMPTY_FILTERS });
    this.syncUrl();
  }

  retry(): void {
    void this.store.loadNext();
  }

  private async loadCategories(): Promise<void> {
    try {
      const list = await firstValueFrom(this.animeApi.getCategories());
      this.categories.set(list);
    } catch {
      this.categories.set([]);
    }
  }

  private readQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const filters: CatalogFilters = {
      ...EMPTY_FILTERS,
      q: params.get('q') ?? '',
      categoryId: params.getAll('categoryId'),
      language: params.getAll('language') as Language[],
      minEpisodes: this.numberOrNull(params.get('minEpisodes')),
      maxEpisodes: this.numberOrNull(params.get('maxEpisodes')),
      season: this.numberOrNull(params.get('season')),
      sort: (params.get('sort') as CatalogSort) ?? CatalogSort.NEWEST,
    };
    this.searchText.set(filters.q);
    this.store.setFilters(filters);
  }

  private syncUrl(): void {
    const f = this.store.filters();
    const queryParams: Record<string, string | string[] | null> = {
      q: f.q || null,
      categoryId: f.categoryId.length ? f.categoryId : null,
      language: f.language.length ? f.language : null,
      minEpisodes: f.minEpisodes !== null ? String(f.minEpisodes) : null,
      maxEpisodes: f.maxEpisodes !== null ? String(f.maxEpisodes) : null,
      season: f.season !== null ? String(f.season) : null,
      sort: f.sort === CatalogSort.NEWEST ? null : f.sort,
    };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private numberOrNull(v: string | null): number | null {
    if (v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}
