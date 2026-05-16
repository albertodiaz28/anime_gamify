import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Skill, UserSkill } from '@anime-gamify/shared-types';
import { SkillEntity } from '../entities/skill.entity';
import { UserSkillEntity } from '../entities/user-skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skills: Repository<SkillEntity>,
    @InjectRepository(UserSkillEntity)
    private readonly userSkills: Repository<UserSkillEntity>,
  ) {}

  async listCatalog(): Promise<Skill[]> {
    const rows = await this.skills
      .createQueryBuilder('s')
      .orderBy('s.required_level', 'ASC')
      .addOrderBy('s.name', 'ASC')
      .getMany();
    return rows.map((row) => this.toSkill(row));
  }

  async listForUser(userId: string): Promise<UserSkill[]> {
    const catalog = await this.listCatalog();
    const unlocked = await this.userSkills.find({ where: { userId } });
    const unlockedMap = new Map(unlocked.map((row) => [row.skillId, row.unlockedAt]));
    return catalog.map((skill) => {
      const unlockedAt = unlockedMap.get(skill.id);
      return {
        skill,
        unlocked: Boolean(unlockedAt),
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
      };
    });
  }

  private toSkill(row: SkillEntity): Skill {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      requiredLevel: row.requiredLevel,
      type: row.type,
      payload: row.payload,
    };
  }
}
