import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { computeLevel } from '@anime-gamify/shared-constants';
import { UserEntity } from '../../users/entities/user.entity';
import {
  USER_LEVELED_UP_EVENT,
  UserLeveledUpEvent,
} from '../events/user-leveled-up.event';

export interface AddXpResult {
  newXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

@Injectable()
export class LevelService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addXp(userId: string, xpDelta: number): Promise<AddXpResult> {
    const result = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UserEntity);
      const user = await repo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where('u.id = :id', { id: userId })
        .getOne();
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      const oldLevel = user.level;
      const newXp = Math.max(0, user.xp + xpDelta);
      const newLevel = computeLevel(newXp);
      await repo
        .createQueryBuilder()
        .update(UserEntity)
        .set({ xp: newXp, level: newLevel })
        .where('id = :id', { id: userId })
        .execute();
      return { newXp, oldLevel, newLevel, leveledUp: newLevel > oldLevel };
    });

    if (result.leveledUp) {
      await this.eventEmitter.emitAsync(
        USER_LEVELED_UP_EVENT,
        new UserLeveledUpEvent(userId, result.oldLevel, result.newLevel),
      );
    }
    return result;
  }
}
