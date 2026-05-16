import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import type { Episode, Server, WatchResult } from '@anime-gamify/shared-types';
import { Language } from '@anime-gamify/shared-types';
import { AnimeApi } from '../../core/services/anime.api';
import { GamificationApi } from '../../core/services/gamification.api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LevelUpDialogComponent } from '../../shared/components/level-up-dialog.component';

const AUTO_WATCH_DELAY_MS = 60_000;

@Component({
  selector: 'ag-player-page',
  standalone: true,
  imports: [LevelUpDialogComponent],
  template: `
    <section class="ag-player">
      @if (episode(); as ep) {
        <header class="ag-player__head">
          <h1>Ep {{ ep.number }} — {{ ep.title }}</h1>
        </header>

        <div class="ag-player__langs">
          @for (lang of availableLanguages(); track lang) {
            <button
              type="button"
              class="ag-chip-btn"
              [class.ag-chip-btn--active]="lang === selectedLanguage()"
              (click)="selectLanguage(lang)"
            >{{ lang }}</button>
          }
        </div>

        <div class="ag-player__tabs">
          @for (s of filteredServers(); track s.id) {
            <button
              type="button"
              class="ag-chip-btn"
              [class.ag-chip-btn--active]="s.id === selectedServer()?.id"
              (click)="selectServer(s)"
            >{{ s.name }}</button>
          }
        </div>

        @if (safeEmbedUrl(); as url) {
          <div class="ag-player__frame">
            <iframe
              [src]="url"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerpolicy="no-referrer"
              allowfullscreen
              loading="lazy"
              title="Episode player"
            ></iframe>
          </div>
        } @else {
          <p class="ag-player__empty">No server selected.</p>
        }

        <footer class="ag-player__foot">
          <button type="button" (click)="markWatchedNow()" [disabled]="watched()">
            {{ watched() ? 'Watched' : 'Mark as watched' }}
          </button>
        </footer>
      } @else {
        <p>Loading...</p>
      }
    </section>

    @if (levelUpResult(); as lvl) {
      <ag-level-up-dialog
        [newLevel]="lvl.newLevel"
        [unlockedSkillIds]="lvl.unlockedSkillIds"
        (close)="levelUpResult.set(null)"
      />
    }
  `,
  styles: [
    `
      .ag-player {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 1100px;
        margin: 0 auto;
      }
      .ag-player__head h1 {
        margin: 0;
      }
      .ag-player__langs,
      .ag-player__tabs {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }
      .ag-chip-btn {
        background: #1a1a1a;
        color: #fff;
        border: 1px solid #333;
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .ag-chip-btn--active {
        background: #1976d2;
        border-color: #1976d2;
      }
      .ag-player__frame {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
      }
      .ag-player__frame iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .ag-player__empty {
        color: #888;
        text-align: center;
      }
      .ag-player__foot button {
        background: #2e7d32;
        color: #fff;
        border: 0;
        padding: 0.5rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
      }
      .ag-player__foot button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PlayerPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly animeApi = inject(AnimeApi);
  private readonly gamificationApi = inject(GamificationApi);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly episode = signal<Episode | null>(null);
  readonly servers = signal<Server[]>([]);
  readonly selectedLanguage = signal<Language | null>(null);
  readonly selectedServer = signal<Server | null>(null);
  readonly watched = signal<boolean>(false);
  readonly levelUpResult = signal<WatchResult | null>(null);

  readonly availableLanguages = computed(() => {
    const set = new Set<Language>();
    for (const s of this.servers()) set.add(s.language);
    return Array.from(set);
  });
  readonly filteredServers = computed(() => {
    const lang = this.selectedLanguage();
    return lang ? this.servers().filter((s) => s.language === lang) : this.servers();
  });
  readonly safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const s = this.selectedServer();
    return s ? this.sanitizer.bypassSecurityTrustResourceUrl(s.embedUrl) : null;
  });

  private autoWatchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const episodeId = this.route.snapshot.paramMap.get('episodeId');
    if (!episodeId) return;
    void this.loadEpisode(episodeId);
  }

  ngOnDestroy(): void {
    this.clearAutoWatch();
  }

  selectLanguage(lang: Language): void {
    this.selectedLanguage.set(lang);
    const first = this.servers().find((s) => s.language === lang);
    if (first) this.selectedServer.set(first);
  }

  selectServer(server: Server): void {
    this.selectedServer.set(server);
    this.scheduleAutoWatch();
  }

  async markWatchedNow(): Promise<void> {
    const ep = this.episode();
    if (!ep || this.watched()) return;
    await this.sendWatch(ep.id);
  }

  private async loadEpisode(episodeId: string): Promise<void> {
    try {
      const [ep, servers] = await Promise.all([
        firstValueFrom(this.animeApi.getEpisode(episodeId)),
        firstValueFrom(this.animeApi.getEpisodeServers(episodeId)),
      ]);
      this.episode.set(ep);
      this.servers.set(servers);
      if (servers.length > 0) {
        this.selectedLanguage.set(servers[0].language);
        this.selectedServer.set(servers[0]);
        this.scheduleAutoWatch();
      }
    } catch {
      this.toast.error('Failed to load episode.');
    }
  }

  private scheduleAutoWatch(): void {
    this.clearAutoWatch();
    if (this.watched()) return;
    this.autoWatchTimer = setTimeout(() => {
      const ep = this.episode();
      if (ep) void this.sendWatch(ep.id);
    }, AUTO_WATCH_DELAY_MS);
    this.destroyRef.onDestroy(() => this.clearAutoWatch());
  }

  private clearAutoWatch(): void {
    if (this.autoWatchTimer) {
      clearTimeout(this.autoWatchTimer);
      this.autoWatchTimer = undefined;
    }
  }

  private async sendWatch(episodeId: string): Promise<void> {
    try {
      const result = await firstValueFrom(this.gamificationApi.markWatched(episodeId));
      this.watched.set(true);
      this.clearAutoWatch();
      if (result.alreadyWatched) {
        this.toast.show('Already watched.');
        return;
      }
      if (result.xpGained > 0) this.toast.xp(result.xpGained);
      this.authService.applyProgress({ xp: result.newXp, level: result.newLevel });
      if (result.leveledUp) this.levelUpResult.set(result);
    } catch {
      this.toast.error('Failed to mark watched.');
    }
  }
}
