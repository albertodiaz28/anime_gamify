import type { DataSource, Repository } from 'typeorm';
import { XP_PER_EPISODE } from '@anime-gamify/shared-constants';

jest.mock('../../episodes/entities/episode.entity', () => ({
  EpisodeEntity: class {},
}));

import { EpisodeEntity } from '../../episodes/entities/episode.entity';
import { SkillEntity } from '../entities/skill.entity';
import { LevelService } from './level.service';
import { WatchService } from './watch.service';

describe('WatchService', () => {
  let episodes: jest.Mocked<Repository<EpisodeEntity>>;
  let skills: jest.Mocked<Repository<SkillEntity>>;
  let levelService: jest.Mocked<LevelService>;
  let dataSource: { createQueryBuilder: jest.Mock; getRepository: jest.Mock };
  let service: WatchService;
  let insertExecute: jest.Mock;

  beforeEach(() => {
    episodes = {
      findOne: jest.fn().mockResolvedValue({ id: 'ep-1' } as EpisodeEntity),
    } as unknown as jest.Mocked<Repository<EpisodeEntity>>;
    skills = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<SkillEntity>>;
    levelService = {
      addXp: jest.fn(),
    } as unknown as jest.Mocked<LevelService>;
    insertExecute = jest.fn();
    dataSource = {
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: insertExecute,
      }),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ u_xp: 30, u_level: 1 }),
        }),
      }),
    };
    service = new WatchService(
      dataSource as unknown as DataSource,
      episodes,
      skills,
      levelService,
    );
  });

  it('grants xp when the episode is new', async () => {
    insertExecute.mockResolvedValue({ identifiers: [{ user_id: 'u1', episode_id: 'ep-1' }] });
    levelService.addXp.mockResolvedValue({
      newXp: XP_PER_EPISODE,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
    });

    const result = await service.recordWatch('u1', 'ep-1');

    expect(result.alreadyWatched).toBe(false);
    expect(result.xpGained).toBe(XP_PER_EPISODE);
    expect(levelService.addXp).toHaveBeenCalledWith('u1', XP_PER_EPISODE);
  });

  it('returns alreadyWatched without granting xp when duplicate', async () => {
    insertExecute.mockResolvedValue({ identifiers: [] });

    const result = await service.recordWatch('u1', 'ep-1');

    expect(result.alreadyWatched).toBe(true);
    expect(result.xpGained).toBe(0);
    expect(levelService.addXp).not.toHaveBeenCalled();
  });

  it('fetches newly unlocked skills after a level-up', async () => {
    insertExecute.mockResolvedValue({ identifiers: [{ user_id: 'u1', episode_id: 'ep-1' }] });
    levelService.addXp.mockResolvedValue({
      newXp: 1000,
      oldLevel: 1,
      newLevel: 3,
      leveledUp: true,
    });
    skills.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ id: 's-1' }, { id: 's-2' }]),
    } as never);

    const result = await service.recordWatch('u1', 'ep-1');

    expect(result.leveledUp).toBe(true);
    expect(result.unlockedSkillIds).toEqual(['s-1', 's-2']);
  });
});
