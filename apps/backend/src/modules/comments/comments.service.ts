import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Comment, CursorPage, PublicUser } from '@anime-gamify/shared-types';
import { XP_PER_COMMENT } from '@anime-gamify/shared-constants';
import { UsersService } from '../users';
import { UserEntity } from '../users/entities/user.entity';
import { LevelService } from '../gamification/services/level.service';
import {
  decodeCommentCursor,
  encodeCommentCursor,
} from './comments.cursor';
import { sanitizeCommentBody } from './comments.sanitize';
import { CommentEntity } from './entities/comment.entity';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly comments: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly levelService: LevelService,
  ) {}

  async create(
    userId: string,
    animeId: string,
    rawBody: string,
    parentId: string | undefined,
  ): Promise<Comment> {
    const body = sanitizeCommentBody(rawBody);
    if (body.length === 0) {
      throw new ForbiddenException('Comment body is empty after sanitization');
    }
    if (parentId) {
      await this.assertParentExists(parentId, animeId);
    }
    const saved = await this.comments.save(
      this.comments.create({ userId, animeId, body, parentId: parentId ?? null }),
    );
    await this.levelService.addXp(userId, XP_PER_COMMENT);
    return this.toComment(saved, await this.loadAuthor(userId));
  }

  async list(
    animeId: string,
    cursor: string | undefined,
    limit: number | undefined,
  ): Promise<CursorPage<Comment>> {
    const take = this.normalizeLimit(limit);
    const qb = this.comments
      .createQueryBuilder('c')
      .where('c.anime_id = :animeId', { animeId })
      .orderBy('c.created_at', 'DESC')
      .addOrderBy('c.id', 'DESC')
      .take(take + 1);
    this.applyCursor(qb, cursor);
    const rows = await qb.getMany();
    const hasMore = rows.length > take;
    const slice = hasMore ? rows.slice(0, take) : rows;
    const authors = await this.loadAuthors(slice.map((row) => row.userId));
    const items = slice.map((row) => this.toComment(row, authors.get(row.userId)));
    const last = slice[slice.length - 1];
    const nextCursor = hasMore && last
      ? encodeCommentCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
      : null;
    return { items, nextCursor, hasMore };
  }

  async remove(userId: string, commentId: string): Promise<void> {
    const found = await this.comments.findOne({ where: { id: commentId } });
    if (!found) {
      throw new NotFoundException('Comment not found');
    }
    if (found.userId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.comments.delete({ id: commentId });
  }

  private normalizeLimit(limit: number | undefined): number {
    if (!limit || limit < 1) {
      return DEFAULT_LIMIT;
    }
    return Math.min(limit, MAX_LIMIT);
  }

  private applyCursor(qb: ReturnType<Repository<CommentEntity>['createQueryBuilder']>, cursor: string | undefined): void {
    if (!cursor) {
      return;
    }
    const decoded = decodeCommentCursor(cursor);
    if (!decoded) {
      return;
    }
    qb.andWhere('(c.created_at, c.id) < (:createdAt, :id)', {
      createdAt: decoded.createdAt,
      id: decoded.id,
    });
  }

  private async assertParentExists(parentId: string, animeId: string): Promise<void> {
    const parent = await this.comments.findOne({ where: { id: parentId } });
    if (!parent || parent.animeId !== animeId) {
      throw new NotFoundException('Parent comment not found for this anime');
    }
  }

  private async loadAuthor(userId: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { id: userId } });
  }

  private async loadAuthors(userIds: string[]): Promise<Map<string, UserEntity>> {
    const unique = Array.from(new Set(userIds));
    if (unique.length === 0) {
      return new Map();
    }
    const rows = await this.users
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids: unique })
      .getMany();
    return new Map(rows.map((row) => [row.id, row]));
  }

  private toComment(row: CommentEntity, author: UserEntity | null | undefined): Comment {
    return {
      id: row.id,
      animeId: row.animeId,
      parentId: row.parentId,
      body: row.body,
      author: this.toPublicAuthor(row.userId, author ?? null),
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toPublicAuthor(userId: string, user: UserEntity | null): PublicUser {
    if (!user) {
      return {
        id: userId,
        username: 'unknown',
        level: 1,
        avatarConfig: { baseSkin: 'default' },
      };
    }
    const full = this.usersService.toPublicUser(user);
    return {
      id: full.id,
      username: full.username,
      level: full.level,
      avatarConfig: full.avatarConfig,
    };
  }
}
