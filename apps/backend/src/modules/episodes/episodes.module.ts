import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeEntity } from './entities/episode.entity';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { ServerEntity } from './entities/server.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EpisodeEntity, ServerEntity])],
  controllers: [EpisodesController],
  providers: [EpisodesService],
  exports: [EpisodesService, TypeOrmModule],
})
export class EpisodesModule {}
