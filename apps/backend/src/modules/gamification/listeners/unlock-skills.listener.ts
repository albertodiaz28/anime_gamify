import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  USER_LEVELED_UP_EVENT,
  UserLeveledUpEvent,
} from '../events/user-leveled-up.event';
import { SkillEntity } from '../entities/skill.entity';
import { UserSkillEntity } from '../entities/user-skill.entity';

@Injectable()
export class UnlockSkillsListener {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @OnEvent(USER_LEVELED_UP_EVENT, { async: true, promisify: true })
  async handle(event: UserLeveledUpEvent): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const skillsRepo = manager.getRepository(SkillEntity);
      const eligible = await skillsRepo
        .createQueryBuilder('s')
        .where('s.required_level <= :level', { level: event.newLevel })
        .andWhere((qb) => {
          const sub = qb
            .subQuery()
            .select('us.skill_id')
            .from(UserSkillEntity, 'us')
            .where('us.user_id = :userId', { userId: event.userId })
            .getQuery();
          return `s.id NOT IN ${sub}`;
        })
        .getMany();
      if (eligible.length === 0) {
        return;
      }
      await manager
        .createQueryBuilder()
        .insert()
        .into(UserSkillEntity)
        .values(eligible.map((skill) => ({ userId: event.userId, skillId: skill.id })))
        .orIgnore()
        .execute();
    });
  }
}
