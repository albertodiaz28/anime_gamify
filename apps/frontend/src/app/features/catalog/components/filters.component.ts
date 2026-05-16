import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Category } from '@anime-gamify/shared-types';
import { Language, CatalogSort } from '@anime-gamify/shared-types';
import type { CatalogFilters } from '../catalog.store';

const LANGUAGE_OPTIONS: Language[] = [
  Language.ES,
  Language.LAT,
  Language.JP_SUB,
  Language.EN_SUB,
  Language.EN_DUB,
];

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: CatalogSort.NEWEST, label: 'Newest' },
  { value: CatalogSort.TITLE_ASC, label: 'Title A→Z' },
  { value: CatalogSort.RATING_DESC, label: 'Top Rated' },
  { value: CatalogSort.EPISODES_DESC, label: 'Most Episodes' },
];

@Component({
  selector: 'ag-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="ag-filters">
      <h3>Filters</h3>

      <section>
        <h4>Sort</h4>
        <select [ngModel]="filters.sort" (ngModelChange)="patch({ sort: $event })">
          @for (opt of sortOptions; track opt.value) {
            <option [ngValue]="opt.value">{{ opt.label }}</option>
          }
        </select>
      </section>

      <section>
        <h4>Categories</h4>
        <div class="ag-filters__list">
          @for (cat of categories; track cat.id) {
            <label>
              <input
                type="checkbox"
                [checked]="filters.categoryId.includes(cat.id)"
                (change)="toggleCategory(cat.id)"
              />
              {{ cat.name }}
            </label>
          }
        </div>
      </section>

      <section>
        <h4>Language</h4>
        <div class="ag-filters__list">
          @for (lang of languages; track lang) {
            <label>
              <input
                type="checkbox"
                [checked]="filters.language.includes(lang)"
                (change)="toggleLanguage(lang)"
              />
              {{ lang }}
            </label>
          }
        </div>
      </section>

      <section>
        <h4>Episodes</h4>
        <div class="ag-filters__row">
          <input
            type="number"
            placeholder="min"
            min="0"
            [ngModel]="filters.minEpisodes"
            (ngModelChange)="patch({ minEpisodes: toNullableNumber($event) })"
          />
          <input
            type="number"
            placeholder="max"
            min="0"
            [ngModel]="filters.maxEpisodes"
            (ngModelChange)="patch({ maxEpisodes: toNullableNumber($event) })"
          />
        </div>
      </section>

      <section>
        <h4>Season</h4>
        <input
          type="number"
          min="1"
          placeholder="any"
          [ngModel]="filters.season"
          (ngModelChange)="patch({ season: toNullableNumber($event) })"
        />
      </section>

      <button type="button" class="ag-filters__reset" (click)="reset.emit()">Reset</button>
    </aside>
  `,
  styles: [
    `
      .ag-filters {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background: #1a1a1a;
        border-radius: 8px;
        min-width: 220px;
      }
      h3, h4 {
        margin: 0 0 0.5rem;
      }
      h4 {
        font-size: 0.85rem;
        text-transform: uppercase;
        color: #aaa;
      }
      .ag-filters__list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-height: 200px;
        overflow-y: auto;
      }
      .ag-filters__list label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
      }
      .ag-filters__row {
        display: flex;
        gap: 0.4rem;
      }
      input[type="number"], select {
        background: #222;
        color: #fff;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 0.35rem;
        width: 100%;
      }
      .ag-filters__reset {
        background: transparent;
        color: #fff;
        border: 1px solid #555;
        padding: 0.4rem;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class FiltersComponent {
  @Input({ required: true }) filters!: CatalogFilters;
  @Input() categories: Category[] = [];
  @Output() filtersChange = new EventEmitter<Partial<CatalogFilters>>();
  @Output() reset = new EventEmitter<void>();

  readonly languages = LANGUAGE_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;

  patch(patch: Partial<CatalogFilters>): void {
    this.filtersChange.emit(patch);
  }

  toggleCategory(id: string): void {
    const next = this.filters.categoryId.includes(id)
      ? this.filters.categoryId.filter((c) => c !== id)
      : [...this.filters.categoryId, id];
    this.patch({ categoryId: next });
  }

  toggleLanguage(lang: Language): void {
    const next = this.filters.language.includes(lang)
      ? this.filters.language.filter((l) => l !== lang)
      : [...this.filters.language, lang];
    this.patch({ language: next });
  }

  toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}
