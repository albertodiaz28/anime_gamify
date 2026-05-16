import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AnimeCard, AnimeDetail, CursorPage } from '@anime-gamify/shared-types';
import { Public } from '../auth';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { AnimeCatalogService } from './services/anime-catalog.service';
import { AnimeDetailService } from './services/anime-detail.service';

@ApiTags('animes')
@Controller('animes')
export class AnimesController {
  constructor(
    private readonly catalog: AnimeCatalogService,
    private readonly detail: AnimeDetailService,
  ) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Catalog of animes (cursor paginated)' })
  findCatalog(@Query() query: CatalogQueryDto): Promise<CursorPage<AnimeCard>> {
    return this.catalog.findCatalog(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: 'Anime detail with episodes and servers' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AnimeDetail> {
    return this.detail.findOne(id);
  }
}
