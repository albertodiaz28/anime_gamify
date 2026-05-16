import type { DataSource, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { SkillType } from '@anime-gamify/shared-types';
import { SkillEntity } from '../entities/skill.entity';
import { UserLeveledUpEvent } from '../events/user-leveled-up.event';
import { UnlockSkillsListener } from './unlock-skills.listener';

describe('UnlockSkillsListener', () => {
  it('inserts only skills not yet owned by the user', async () => {
    const eligible: SkillEntity[] = [
      {
        id: 's-1',
        slug: 'a',
        name: 'A',
        description: '',
        requiredLevel: 1,
        type: SkillType.COSMETIC,
        payload: {},
      },
      {
        id: 's-2',
        slug: 'b',
        name: 'B',
        description: '',
        requiredLevel: 2,
        type: SkillType.COSMETIC,
        payload: {},
      },
    ];
    const skillsQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(eligible),
    } as unknown as SelectQueryBuilder<SkillEntity>;
    const skillsRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(skillsQb),
    } as unknown as Repository<SkillEntity>;
    const insertExecute = jest.fn().mockResolvedValue(undefined);
    const manager = {
      getRepository: jest.fn().mockReturnValue(skillsRepo),
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: insertExecute,
      }),
    } as unknown as EntityManager;
    const dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: EntityManager) => unknown) => cb(manager)),
    } as unknown as DataSource;

    const listener = new UnlockSkillsListener(dataSource);
    await listener.handle(new UserLeveledUpEvent('u1', 1, 3));

    expect(insertExecute).toHaveBeenCalledTimes(1);
    expect((manager.createQueryBuilder as jest.Mock).mock.results[0].value.values).toHaveBeenCalledWith([
      { userId: 'u1', skillId: 's-1' },
      { userId: 'u1', skillId: 's-2' },
    ]);
  });

  it('is a no-op when no skills are eligible', async () => {
    const skillsQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as unknown as SelectQueryBuilder<SkillEntity>;
    const skillsRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(skillsQb),
    } as unknown as Repository<SkillEntity>;
    const insertExecute = jest.fn();
    const manager = {
      getRepository: jest.fn().mockReturnValue(skillsRepo),
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: insertExecute,
      }),
    } as unknown as EntityManager;
    const dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: EntityManager) => unknown) => cb(manager)),
    } as unknown as DataSource;

    const listener = new UnlockSkillsListener(dataSource);
    await listener.handle(new UserLeveledUpEvent('u1', 1, 1));

    expect(insertExecute).not.toHaveBeenCalled();
  });
});
