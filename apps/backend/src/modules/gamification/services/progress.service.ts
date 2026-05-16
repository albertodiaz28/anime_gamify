import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { UserProgress } from '@anime-gamify/shared-types';
import { xpInCurrentLevel, xpToNext } from '@anime-gamify/shared-constants';
import { UserEntity } from '../../users/entities/user.entity';
import { WatchedEpisodeEntity } from '../entities/watched-episode.entity';

interface RatingCountRow {
  count: string;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(WatchedEpisodeEntity)
    private readonly watched: Repository<WatchedEpisodeEntity>,
  ) {}

  async getProgress(userId: string): Promise<UserProgress> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    const [episodesWatched, animesRated] = await Promise.all([
      this.watched.count({ where: { userId } }),
      this.countRatings(userId),
    ]);
    return {
      userId: user.id,
      level: user.level,
      xp: user.xp,
      xpInCurrentLevel: xpInCurrentLevel(user.xp),
      xpToNextLevel: xpToNext(user.level),
      episodesWatched,
      animesRated,
    };
  }

  private async countRatings(userId: string): Promise<number> {
    const row = await this.dataSource
      .query<RatingCountRow[]>(
        `SELECT COUNT(*)::text AS count FROM "ratings" WHERE "user_id" = $1`,
        [userId],
      )
      .catch(() => [{ count: '0' }] as RatingCountRow[]);
    return Number(row[0]?.count ?? 0);
  }
}
