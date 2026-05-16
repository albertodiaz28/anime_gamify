import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SKILLS_SEED } from '@anime-gamify/shared-constants';
import { SkillEntity } from '../entities/skill.entity';

@Injectable()
export class SkillsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SkillsSeeder.name);

  constructor(
    @InjectRepository(SkillEntity)
    private readonly skills: Repository<SkillEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SKIP_SEED === 'true') {
      return;
    }
    try {
      await this.seed();
    } catch (error) {
      this.logger.warn(`Skill seeding skipped: ${(error as Error).message}`);
    }
  }

  async seed(): Promise<void> {
    for (const item of SKILLS_SEED) {
      await this.skills
        .createQueryBuilder()
        .insert()
        .values({
          slug: item.slug,
          name: item.name,
          description: item.description,
          requiredLevel: item.requiredLevel,
          type: item.type,
          payload: item.payload,
        })
        .orIgnore()
        .execute();
    }
  }
}
