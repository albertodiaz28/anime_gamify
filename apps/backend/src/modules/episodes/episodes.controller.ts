import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Episode, Language, Server } from '@anime-gamify/shared-types';
import { Public } from '../auth/decorators';
import { EpisodesService } from './episodes.service';

@ApiTags('episodes')
@Controller()
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Public()
  @Get('animes/:id/episodes')
  @ApiOkResponse({ description: 'Episodes for the given anime' })
  findByAnime(@Param('id', ParseUUIDPipe) id: string): Promise<Episode[]> {
    return this.episodesService.findByAnime(id);
  }

  @Public()
  @Get('episodes/:id/servers')
  @ApiOkResponse({ description: 'Servers grouped by language' })
  findServers(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Record<Language, Server[]>> {
    return this.episodesService.findServers(id);
  }
}
