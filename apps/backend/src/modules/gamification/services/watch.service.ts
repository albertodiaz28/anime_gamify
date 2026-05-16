import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { WatchResult } from '@anime-gamify/shared-types';
import { XP_PER_EPISODE } from '@anime-gamify/shared-constants';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';
import { SkillEntity } from '../entities/skill.entity';
import { WatchedEpisodeEntity } from '../entities/watched-episode.entity';
import { LevelService } from './level.service';

@Injectable()
export class WatchService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(SkillEntity)
    private readonly skills: Repository<SkillEntity>,
    private readonly levelService: LevelService,
  ) {}

  async recordWatch(userId: string, episodeId: string): Promise<WatchResult> {
    await this.assertEpisodeExists(episodeId);
    const isNew = await this.insertIfAbsent(userId, episodeId);
    if (!isNew) {
      return this.buildAlreadyWatchedResult(userId);
    }
    const levelResult = await this.levelService.addXp(userId, XP_PER_EPISODE);
    const unlocked = levelResult.leveledUp
      ? await this.fetchNewlyUnlockedSkills(levelResult.oldLevel, levelResult.newLevel)
      : [];
    return {
      alreadyWatched: false,
      xpGained: XP_PER_EPISODE,
      newXp: levelResult.newXp,
      newLevel: levelResult.newLevel,
      leveledUp: levelResult.leveledUp,
      unlockedSkillIds: unlocked,
    };
  }

  private async assertEpisodeExists(episodeId: string): Promise<void> {
    const found = await this.episodes.findOne({ where: { id: episodeId } });
    if (!found) {
      throw new NotFoundException('Episode not found');
    }
  }

  private async insertIfAbsent(userId: string, episodeId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(WatchedEpisodeEntity)
      .values({ userId, episodeId })
      .orIgnore()
      .execute();
    return (result.identifiers?.length ?? 0) > 0;
  }

  private async fetchNewlyUnlockedSkills(oldLevel: number, newLevel: number): Promise<string[]> {
    const rows = await this.skills
      .createQueryBuilder('s')
      .select('s.id', 'id')
      .where('s.required_level > :old AND s.required_level <= :new', {
        old: oldLevel,
        new: newLevel,
      })
      .getRawMany<{ id: string }>();
    return rows.map((row) => row.id);
  }

  private async buildAlreadyWatchedResult(userId: string): Promise<WatchResult> {
    const user = await this.dataSource
      .getRepository('users')
      .createQueryBuilder('u')
      .select(['u.xp', 'u.level'])
      .where('u.id = :id', { id: userId })
      .getRawOne<{ u_xp: number; u_level: number }>();
    return {
      alreadyWatched: true,
      xpGained: 0,
      newXp: Number(user?.u_xp ?? 0),
      newLevel: Number(user?.u_level ?? 1),
      leveledUp: false,
      unlockedSkillIds: [],
    };
  }
}
