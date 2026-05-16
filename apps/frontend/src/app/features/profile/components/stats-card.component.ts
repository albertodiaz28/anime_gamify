import { Component, Input } from '@angular/core';
import type { UserProgress } from '@anime-gamify/shared-types';

@Component({
  selector: 'ag-stats-card',
  standalone: true,
  template: `
    <section class="ag-stats">
      <h2>Stats</h2>
      <div class="ag-stats__grid">
        <div class="ag-stats__cell">
          <span class="ag-stats__label">Level</span>
          <span class="ag-stats__value">{{ progress.level }}</span>
        </div>
        <div class="ag-stats__cell">
          <span class="ag-stats__label">XP</span>
          <span class="ag-stats__value">{{ progress.xp }}</span>
        </div>
        <div class="ag-stats__cell">
          <span class="ag-stats__label">Episodes Watched</span>
          <span class="ag-stats__value">{{ progress.episodesWatched }}</span>
        </div>
        <div class="ag-stats__cell">
          <span class="ag-stats__label">Animes Rated</span>
          <span class="ag-stats__value">{{ progress.animesRated }}</span>
        </div>
      </div>
      <div class="ag-stats__bar" [attr.aria-label]="'XP progress'">
        <div
          class="ag-stats__bar-fill"
          [style.width.%]="percentToNext()"
        ></div>
      </div>
      <small>{{ progress.xpInCurrentLevel }} / {{ progress.xpToNextLevel }} XP to next level</small>
    </section>
  `,
  styles: [
    `
      .ag-stats {
        background: #1a1a1a;
        padding: 1.2rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      h2 {
        margin: 0;
      }
      .ag-stats__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
      }
      .ag-stats__cell {
        display: flex;
        flex-direction: column;
        background: #222;
        padding: 0.6rem;
        border-radius: 6px;
      }
      .ag-stats__label {
        color: #aaa;
        font-size: 0.75rem;
        text-transform: uppercase;
      }
      .ag-stats__value {
        font-size: 1.4rem;
        font-weight: 700;
      }
      .ag-stats__bar {
        height: 10px;
        background: #333;
        border-radius: 5px;
        overflow: hidden;
      }
      .ag-stats__bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #00bcd4, #4caf50);
        transition: width 300ms ease-out;
      }
      small {
        color: #888;
      }
    `,
  ],
})
export class StatsCardComponent {
  @Input({ required: true }) progress!: UserProgress;

  percentToNext(): number {
    const total = this.progress.xpInCurrentLevel + this.progress.xpToNextLevel;
    if (total <= 0) return 0;
    return Math.min(100, (this.progress.xpInCurrentLevel / total) * 100);
  }
}
