import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import type { Rating, RatingAggregate } from '@anime-gamify/shared-types';
import { XP_PER_RATING } from '@anime-gamify/shared-constants';
import { LevelService } from '../gamification/services/level.service';
import { RatingEntity } from './entities/rating.entity';

interface AggregateRow {
  avg: string | null;
  count: string;
}

@Injectable()
export class RatingsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly levelService: LevelService,
  ) {}

  async upsertRating(userId: string, animeId: string, score: number): Promise<Rating> {
    const { rating, isNew } = await this.dataSource.transaction(async (manager) => {
      const result = await this.persistRating(manager, userId, animeId, score);
      await this.refreshAnimeAggregate(manager, animeId);
      return result;
    });
    if (isNew) {
      await this.levelService.addXp(userId, XP_PER_RATING);
    }
    return this.toRating(rating);
  }

  async getAggregate(animeId: string): Promise<RatingAggregate> {
    const row = await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(AVG(r.score), 0)', 'avg')
      .addSelect('COUNT(r.score)', 'count')
      .from(RatingEntity, 'r')
      .where('r.anime_id = :animeId', { animeId })
      .getRawOne<AggregateRow>();
    return {
      animeId,
      avg: row ? Number(row.avg ?? 0) : 0,
      count: row ? Number(row.count) : 0,
    };
  }

  private async persistRating(
    manager: EntityManager,
    userId: string,
    animeId: string,
    score: number,
  ): Promise<{ rating: RatingEntity; isNew: boolean }> {
    const repo = manager.getRepository(RatingEntity);
    const existing = await repo.findOne({ where: { userId, animeId } });
    const isNew = !existing;
    if (existing) {
      existing.score = score;
      const saved = await repo.save(existing);
      return { rating: saved, isNew };
    }
    const saved = await repo.save(repo.create({ userId, animeId, score }));
    return { rating: saved, isNew };
  }

  private async refreshAnimeAggregate(manager: EntityManager, animeId: string): Promise<void> {
    await manager.query(
      `UPDATE "animes" SET
         "avg_rating" = COALESCE((SELECT AVG(score) FROM "ratings" WHERE anime_id = $1), 0),
         "rating_count" = (SELECT COUNT(*) FROM "ratings" WHERE anime_id = $1),
         "updated_at" = now()
       WHERE "id" = $1`,
      [animeId],
    );
  }

  private toRating(entity: RatingEntity): Rating {
    return {
      userId: entity.userId,
      animeId: entity.animeId,
      score: entity.score,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
