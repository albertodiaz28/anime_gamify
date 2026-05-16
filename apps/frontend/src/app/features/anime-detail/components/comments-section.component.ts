import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { Comment } from '@anime-gamify/shared-types';
import { SocialApi } from '../../../core/services/social.api';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommentCardComponent } from './comment-card.component';

@Component({
  selector: 'ag-comments-section',
  standalone: true,
  imports: [FormsModule, CommentCardComponent],
  template: `
    <section class="ag-comments">
      <h2>Comments</h2>

      <form class="ag-comments__form" (submit)="$event.preventDefault(); submit()">
        <textarea
          [(ngModel)]="draft"
          name="body"
          rows="3"
          placeholder="Share your thoughts..."
          [disabled]="posting()"
          maxlength="2000"
        ></textarea>
        <button type="submit" [disabled]="!draft.trim() || posting()">
          {{ posting() ? 'Posting...' : 'Post' }}
        </button>
      </form>

      <div class="ag-comments__list">
        @for (c of comments(); track c.id) {
          <ag-comment-card
            [comment]="c"
            [canDelete]="c.author.id === currentUserId()"
            (delete)="onDelete($event)"
          />
        }
        @if (comments().length === 0 && !loading()) {
          <p class="ag-comments__empty">Be the first to comment.</p>
        }
      </div>

      @if (hasMore()) {
        <button
          type="button"
          class="ag-comments__more"
          (click)="loadMore()"
          [disabled]="loading()"
        >
          {{ loading() ? 'Loading...' : 'Load more' }}
        </button>
      }
    </section>
  `,
  styles: [
    `
      .ag-comments {
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .ag-comments__form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      textarea {
        background: #1a1a1a;
        color: #fff;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 0.5rem;
        font: inherit;
        resize: vertical;
      }
      .ag-comments__form button {
        align-self: flex-end;
        padding: 0.4rem 1rem;
        background: #1976d2;
        color: #fff;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      .ag-comments__form button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .ag-comments__list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .ag-comments__empty {
        color: #888;
        text-align: center;
        padding: 1rem;
      }
      .ag-comments__more {
        align-self: center;
        background: transparent;
        color: #fff;
        border: 1px solid #555;
        padding: 0.4rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class CommentsSectionComponent implements OnInit, OnChanges {
  @Input({ required: true }) animeId!: string;

  private readonly socialApi = inject(SocialApi);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly comments = signal<Comment[]>([]);
  readonly cursor = signal<string | null>(null);
  readonly hasMore = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly posting = signal<boolean>(false);
  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? null);

  draft = '';

  ngOnInit(): void {
    void this.loadFirstPage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animeId'] && !changes['animeId'].firstChange) {
      this.comments.set([]);
      this.cursor.set(null);
      this.hasMore.set(false);
      void this.loadFirstPage();
    }
  }

  async loadFirstPage(): Promise<void> {
    this.loading.set(true);
    try {
      const page = await firstValueFrom(this.socialApi.listComments(this.animeId));
      this.comments.set(page.items);
      this.cursor.set(page.nextCursor);
      this.hasMore.set(page.hasMore);
    } catch {
      this.toast.error('Failed to load comments.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (this.loading() || !this.hasMore()) return;
    this.loading.set(true);
    try {
      const page = await firstValueFrom(
        this.socialApi.listComments(this.animeId, this.cursor() ?? undefined),
      );
      this.comments.update((list) => [...list, ...page.items]);
      this.cursor.set(page.nextCursor);
      this.hasMore.set(page.hasMore);
    } catch {
      this.toast.error('Failed to load more.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    const body = this.draft.trim();
    if (!body || this.posting()) return;
    this.posting.set(true);
    try {
      const created = await firstValueFrom(
        this.socialApi.createComment(this.animeId, { body }),
      );
      this.comments.update((list) => [created, ...list]);
      this.draft = '';
      this.toast.success('Comment posted.');
    } catch {
      this.toast.error('Failed to post comment.');
    } finally {
      this.posting.set(false);
    }
  }

  async onDelete(id: string): Promise<void> {
    try {
      await firstValueFrom(this.socialApi.deleteComment(id));
      this.comments.update((list) => list.filter((c) => c.id !== id));
      this.toast.success('Comment deleted.');
    } catch {
      this.toast.error('Failed to delete comment.');
    }
  }
}
