import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Skill, UserProgress, UserSkill, WatchResult } from '@anime-gamify/shared-types';
import { CurrentUser, Public } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/types';
import { ProgressService } from './services/progress.service';
import { SkillsService } from './services/skills.service';
import { WatchService } from './services/watch.service';

@ApiTags('gamification')
@Controller()
export class GamificationController {
  constructor(
    private readonly watchService: WatchService,
    private readonly skillsService: SkillsService,
    private readonly progressService: ProgressService,
  ) {}

  @Post('episodes/:id/watch')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Records that the current user watched the episode' })
  watch(
    @CurrentUser() current: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) episodeId: string,
  ): Promise<WatchResult> {
    return this.watchService.recordWatch(current.id, episodeId);
  }

  @Get('users/me/skills')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Skill catalog with unlock status for the current user' })
  myskills(@CurrentUser() current: AuthenticatedUser): Promise<UserSkill[]> {
    return this.skillsService.listForUser(current.id);
  }

  @Get('users/me/progress')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Progress and XP info for the current user' })
  myProgress(@CurrentUser() current: AuthenticatedUser): Promise<UserProgress> {
    return this.progressService.getProgress(current.id);
  }

  @Public()
  @Get('skills')
  @ApiOkResponse({ description: 'Full skills catalog' })
  catalog(): Promise<Skill[]> {
    return this.skillsService.listCatalog();
  }
}
