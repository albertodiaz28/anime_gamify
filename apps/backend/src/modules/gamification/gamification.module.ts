import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodesModule } from '../episodes/episodes.module';
import { UsersModule } from '../users';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from './entities/skill.entity';
import { UserSkillEntity } from './entities/user-skill.entity';
import { WatchedEpisodeEntity } from './entities/watched-episode.entity';
import { GamificationController } from './gamification.controller';
import { UnlockSkillsListener } from './listeners/unlock-skills.listener';
import { SkillsSeeder } from './seed/skills.seeder';
import { LevelService } from './services/level.service';
import { ProgressService } from './services/progress.service';
import { SkillsService } from './services/skills.service';
import { WatchService } from './services/watch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WatchedEpisodeEntity,
      SkillEntity,
      UserSkillEntity,
      UserEntity,
    ]),
    EpisodesModule,
    UsersModule,
  ],
  controllers: [GamificationController],
  providers: [
    LevelService,
    WatchService,
    SkillsService,
    ProgressService,
    UnlockSkillsListener,
    SkillsSeeder,
  ],
  exports: [LevelService, WatchService, SkillsService, ProgressService],
})
export class GamificationModule {}
