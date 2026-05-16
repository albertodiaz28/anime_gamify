import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AnimeCard } from '@anime-gamify/shared-types';

@Component({
  selector: 'ag-anime-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="ag-card" [routerLink]="['/anime', anime.id]" [attr.aria-label]="anime.title">
      <div class="ag-card__cover">
        <img [src]="anime.coverUrl" [alt]="anime.title" loading="lazy" />
        <span class="ag-card__rating">★ {{ anime.avgRating.toFixed(1) }}</span>
      </div>
      <div class="ag-card__body">
        <h3 class="ag-card__title">{{ anime.title }}</h3>
        <div class="ag-card__meta">
          <span class="ag-card__chip">{{ anime.status }}</span>
          <span>{{ anime.totalEpisodes }} ep</span>
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      .ag-card {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
        background: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 150ms ease;
      }
      .ag-card:hover {
        transform: translateY(-2px);
      }
      .ag-card__cover {
        position: relative;
        aspect-ratio: 2 / 3;
        background: #222;
      }
      .ag-card__cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ag-card__rating {
        position: absolute;
        top: 0.4rem;
        right: 0.4rem;
        background: rgba(0, 0, 0, 0.7);
        color: #ffb300;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .ag-card__body {
        padding: 0.5rem 0.6rem 0.75rem;
      }
      .ag-card__title {
        margin: 0 0 0.4rem;
        font-size: 0.95rem;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .ag-card__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: #aaa;
      }
      .ag-card__chip {
        background: #333;
        padding: 0.1rem 0.4rem;
        border-radius: 999px;
        font-size: 0.7rem;
      }
    `,
  ],
})
export class AnimeCardComponent {
  @Input({ required: true }) anime!: AnimeCard;
}
