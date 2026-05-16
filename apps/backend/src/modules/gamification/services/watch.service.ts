import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { WatchResult } from '@anime-gamify/shared-types';
import { XP_PER_EPISODE } from '@anime-gamify/shared-constants';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';
import { WatchedEpisodeEntity } from '../entities/watched-episode.entity';
import { UserSkillEntity } from '../entities/user-skill.entity';
import { LevelService } from './level.service';

@Injectable()
export class WatchService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(UserSkillEntity)
    private readonly userSkills: Repository<UserSkillEntity>,
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
      ? await this.fetchSkillsUnlockedAt(userId, levelResult.newLevel)
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

  private async fetchSkillsUnlockedAt(userId: string, level: number): Promise<string[]> {
    const rows = await this.userSkills
      .createQueryBuilder('us')
      .innerJoin('skills', 's', 's.id = us.skill_id')
      .where('us.user_id = :userId', { userId })
      .andWhere('s.required_level <= :level', { level })
      .getMany();
    return rows.map((row) => row.skillId);
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
