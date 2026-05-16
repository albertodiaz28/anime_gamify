import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { firstValueFrom } from 'rxjs';
import type { AnimeDetail, Episode, WatchResult } from '@anime-gamify/shared-types';
import { SocialApi } from '../../core/services/social.api';
import { GamificationApi } from '../../core/services/gamification.api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LevelUpDialogComponent } from '../../shared/components/level-up-dialog.component';
import { RatingStarsComponent } from './components/rating-stars.component';
import { CommentsSectionComponent } from './components/comments-section.component';

const VIRTUAL_THRESHOLD = 50;

@Component({
  selector: 'ag-anime-detail',
  standalone: true,
  imports: [
    RouterLink,
    ScrollingModule,
    RatingStarsComponent,
    CommentsSectionComponent,
    LevelUpDialogComponent,
  ],
  template: `
    @if (anime(); as a) {
      <section class="ag-detail">
        <header
          class="ag-detail__hero"
          [style.background-image]="'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(' + a.coverUrl + ')'"
        >
          <img class="ag-detail__cover" [src]="a.coverUrl" [alt]="a.title" />
          <div class="ag-detail__info">
            <h1>{{ a.title }}</h1>
            <div class="ag-detail__meta">
              <span class="ag-chip">{{ a.status }}</span>
              <span>★ {{ a.avgRating.toFixed(1) }} ({{ a.ratingCount }})</span>
              <span>{{ a.totalEpisodes }} episodes</span>
            </div>
            <div class="ag-detail__cats">
              @for (cat of a.categories; track cat.id) {
                <span class="ag-chip">{{ cat.name }}</span>
              }
            </div>
            <div class="ag-detail__rate">
              <span>Your rating:</span>
              <ag-rating-stars [value]="myRating()" (rate)="onRate($event)" />
            </div>
          </div>
        </header>

        <p class="ag-detail__desc">{{ a.description }}</p>

        <section class="ag-detail__episodes">
          <h2>Episodes</h2>
          @if (useVirtual()) {
            <cdk-virtual-scroll-viewport itemSize="56" class="ag-detail__viewport">
              <div
                *cdkVirtualFor="let ep of a.episodes; trackBy: trackEpisode"
                class="ag-detail__episode"
              >
                <a [routerLink]="['/player', ep.id]">
                  <strong>Ep {{ ep.number }}</strong>
                  <span>{{ ep.title }}</span>
                </a>
                <button type="button" (click)="markWatched(ep.id)" [disabled]="watching() === ep.id">
                  {{ watching() === ep.id ? '...' : 'Mark watched' }}
                </button>
              </div>
            </cdk-virtual-scroll-viewport>
          } @else {
            <ul class="ag-detail__eplist">
              @for (ep of a.episodes; track ep.id) {
                <li class="ag-detail__episode">
                  <a [routerLink]="['/player', ep.id]">
                    <strong>Ep {{ ep.number }}</strong>
                    <span>{{ ep.title }}</span>
                  </a>
                  <button type="button" (click)="markWatched(ep.id)" [disabled]="watching() === ep.id">
                    {{ watching() === ep.id ? '...' : 'Mark watched' }}
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        <ag-comments-section [animeId]="a.id" />
      </section>

      @if (levelUpResult(); as lvl) {
        <ag-level-up-dialog
          [newLevel]="lvl.newLevel"
          [unlockedSkillIds]="lvl.unlockedSkillIds"
          (close)="levelUpResult.set(null)"
        />
      }
    } @else {
      <p>Loading...</p>
    }
  `,
  styles: [
    `
      .ag-detail {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 1100px;
        margin: 0 auto;
      }
      .ag-detail__hero {
        display: flex;
        gap: 1.5rem;
        padding: 1.5rem;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        color: #fff;
      }
      .ag-detail__cover {
        width: 180px;
        height: 270px;
        border-radius: 8px;
        object-fit: cover;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
      .ag-detail__info {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        flex: 1;
      }
      .ag-detail__info h1 {
        margin: 0;
      }
      .ag-detail__meta,
      .ag-detail__cats {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .ag-chip {
        background: rgba(255, 255, 255, 0.15);
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
      }
      .ag-detail__rate {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: auto;
      }
      .ag-detail__desc {
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .ag-detail__episodes h2 {
        margin: 0 0 0.5rem;
      }
      .ag-detail__viewport {
        height: 480px;
        background: #1a1a1a;
        border-radius: 8px;
      }
      .ag-detail__eplist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .ag-detail__episode {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #1a1a1a;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        height: 56px;
        box-sizing: border-box;
      }
      .ag-detail__episode a {
        color: #fff;
        text-decoration: none;
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .ag-detail__episode button {
        background: #1976d2;
        color: #fff;
        border: 0;
        padding: 0.3rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .ag-detail__episode button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      @media (max-width: 700px) {
        .ag-detail__hero {
          flex-direction: column;
        }
        .ag-detail__cover {
          width: 100%;
          height: auto;
        }
      }
    `,
  ],
})
export class AnimeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly socialApi = inject(SocialApi);
  private readonly gamificationApi = inject(GamificationApi);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly anime = signal<AnimeDetail | null>(
    (this.route.snapshot.data['anime'] as AnimeDetail) ?? null,
  );
  readonly myRating = signal<number>(0);
  readonly watching = signal<string | null>(null);
  readonly levelUpResult = signal<WatchResult | null>(null);
  readonly useVirtual = computed(() => (this.anime()?.episodes.length ?? 0) > VIRTUAL_THRESHOLD);

  constructor() {
    const a = this.anime();
    if (a) {
      void this.loadMyRating(a.id);
    }
  }

  async onRate(score: number): Promise<void> {
    const a = this.anime();
    if (!a) return;
    const previous = this.myRating();
    this.myRating.set(score);
    try {
      const aggregate = await firstValueFrom(this.socialApi.rateAnime(a.id, score));
      this.anime.set({ ...a, avgRating: aggregate.avg, ratingCount: aggregate.count });
      this.toast.success(`Rated ${score}/10`);
    } catch {
      this.myRating.set(previous);
      this.toast.error('Failed to rate.');
    }
  }

  async markWatched(episodeId: string): Promise<void> {
    if (this.watching()) return;
    this.watching.set(episodeId);
    try {
      const result = await firstValueFrom(this.gamificationApi.markWatched(episodeId));
      this.handleWatchResult(result);
    } catch {
      this.toast.error('Failed to mark watched.');
    } finally {
      this.watching.set(null);
    }
  }

  trackEpisode(_idx: number, ep: Episode): string {
    return ep.id;
  }

  private async loadMyRating(animeId: string): Promise<void> {
    try {
      const me = await firstValueFrom(this.socialApi.getMyRating(animeId));
      this.myRating.set(me?.score ?? 0);
    } catch {
      this.myRating.set(0);
    }
  }

  private handleWatchResult(result: WatchResult): void {
    if (result.alreadyWatched) {
      this.toast.show('Already watched.');
      return;
    }
    if (result.xpGained > 0) {
      this.toast.xp(result.xpGained);
    }
    this.authService.applyProgress({ xp: result.newXp, level: result.newLevel });
    if (result.leveledUp) {
      this.levelUpResult.set(result);
    }
  }
}
