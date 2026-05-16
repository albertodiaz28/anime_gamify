import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { ServerEntity } from '../episodes/entities/server.entity';
import { AnimesController } from './animes.controller';
import { AnimeEntity } from './entities/anime.entity';
import { AnimeCatalogService } from './services/anime-catalog.service';
import { AnimeDetailService } from './services/anime-detail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnimeEntity, EpisodeEntity, ServerEntity])],
  controllers: [AnimesController],
  providers: [AnimeCatalogService, AnimeDetailService],
  exports: [AnimeCatalogService, AnimeDetailService, TypeOrmModule],
})
export class AnimesModule {}
