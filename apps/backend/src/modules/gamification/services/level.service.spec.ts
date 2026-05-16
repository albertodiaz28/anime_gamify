import { EventEmitter2 } from '@nestjs/event-emitter';
import type { DataSource, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { LEVEL_TABLE } from '@anime-gamify/shared-constants';
import { UserEntity } from '../../users/entities/user.entity';
import {
  USER_LEVELED_UP_EVENT,
  UserLeveledUpEvent,
} from '../events/user-leveled-up.event';
import { LevelService } from './level.service';

interface MockUser {
  id: string;
  xp: number;
  level: number;
}

function buildDataSource(user: MockUser): {
  dataSource: DataSource;
  updateMock: jest.Mock;
} {
  const lockQb = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue({ ...user } as UserEntity),
  } as unknown as SelectQueryBuilder<UserEntity>;

  const updateExecute = jest.fn().mockResolvedValue(undefined);
  const updateQb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: updateExecute,
  };

  const repo = {
    createQueryBuilder: jest
      .fn()
      .mockImplementationOnce(() => lockQb)
      .mockImplementation(() => updateQb),
  } as unknown as Repository<UserEntity>;

  const manager = { getRepository: jest.fn().mockReturnValue(repo) } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn().mockImplementation(async (cb: (m: EntityManager) => Promise<unknown>) => cb(manager)),
  } as unknown as DataSource;

  return { dataSource, updateMock: updateExecute };
}

describe('LevelService', () => {
  let emitter: EventEmitter2;

  beforeEach(() => {
    emitter = { emitAsync: jest.fn().mockResolvedValue([]) } as unknown as EventEmitter2;
  });

  it('adds xp without level change when threshold not crossed', async () => {
    const { dataSource } = buildDataSource({ id: 'u1', xp: 0, level: 1 });
    const service = new LevelService(dataSource, emitter);

    const result = await service.addXp('u1', 50);

    expect(result).toEqual({ newXp: 50, oldLevel: 1, newLevel: 1, leveledUp: false });
    expect(emitter.emitAsync).not.toHaveBeenCalled();
  });

  it('emits UserLeveledUp when the user crosses a level threshold', async () => {
    const xpForLevel2 = LEVEL_TABLE[2];
    const { dataSource } = buildDataSource({ id: 'u1', xp: 0, level: 1 });
    const service = new LevelService(dataSource, emitter);

    const result = await service.addXp('u1', xpForLevel2);

    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBeGreaterThan(1);
    expect(emitter.emitAsync).toHaveBeenCalledWith(
      USER_LEVELED_UP_EVENT,
      expect.any(UserLeveledUpEvent),
    );
  });

  it('clamps xp at zero on negative deltas', async () => {
    const { dataSource } = buildDataSource({ id: 'u1', xp: 5, level: 1 });
    const service = new LevelService(dataSource, emitter);

    const result = await service.addXp('u1', -100);

    expect(result.newXp).toBe(0);
  });
});
