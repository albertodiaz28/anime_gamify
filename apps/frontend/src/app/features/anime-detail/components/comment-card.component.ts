import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Comment } from '@anime-gamify/shared-types';

@Component({
  selector: 'ag-comment-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <article class="ag-comment">
      <header class="ag-comment__head">
        <strong>{{ comment.author.username }}</strong>
        <span class="ag-comment__level">Lv {{ comment.author.level }}</span>
        <time>{{ comment.createdAt | date: 'short' }}</time>
        @if (canDelete) {
          <button type="button" class="ag-comment__delete" (click)="delete.emit(comment.id)">
            Delete
          </button>
        }
      </header>
      <p class="ag-comment__body">{{ comment.body }}</p>
    </article>
  `,
  styles: [
    `
      .ag-comment {
        background: #1a1a1a;
        border-radius: 6px;
        padding: 0.75rem 1rem;
      }
      .ag-comment__head {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #aaa;
        margin-bottom: 0.4rem;
      }
      .ag-comment__head strong {
        color: #fff;
      }
      .ag-comment__level {
        background: #ffb300;
        color: #111;
        padding: 0 0.4rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
      }
      .ag-comment__delete {
        margin-left: auto;
        background: transparent;
        color: #ff6b6b;
        border: 1px solid #ff6b6b;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.75rem;
      }
      .ag-comment__body {
        margin: 0;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class CommentCardComponent {
  @Input({ required: true }) comment!: Comment;
  @Input() canDelete = false;
  @Output() delete = new EventEmitter<string>();
}
