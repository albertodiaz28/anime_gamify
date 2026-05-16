import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode, Language, Server } from '@anime-gamify/shared-types';
import { EpisodeEntity } from './entities/episode.entity';
import { ServerEntity } from './entities/server.entity';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(ServerEntity)
    private readonly servers: Repository<ServerEntity>,
  ) {}

  async findByAnime(animeId: string): Promise<Episode[]> {
    const rows = await this.episodes
      .createQueryBuilder('ep')
      .where('ep.anime_id = :animeId', { animeId })
      .orderBy('ep.number', 'ASC')
      .getMany();
    return rows.map((row) => this.toEpisode(row));
  }

  async findServers(episodeId: string): Promise<Record<Language, Server[]>> {
    const episode = await this.episodes.findOne({ where: { id: episodeId } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    const rows = await this.servers
      .createQueryBuilder('sv')
      .where('sv.episode_id = :episodeId', { episodeId })
      .orderBy('sv.language', 'ASC')
      .addOrderBy('sv.name', 'ASC')
      .getMany();
    return this.groupByLanguage(rows);
  }

  private groupByLanguage(rows: ServerEntity[]): Record<Language, Server[]> {
    const grouped = {} as Record<Language, Server[]>;
    for (const row of rows) {
      const server = this.toServer(row);
      if (!grouped[row.language]) {
        grouped[row.language] = [];
      }
      grouped[row.language].push(server);
    }
    return grouped;
  }

  private toEpisode(row: EpisodeEntity): Episode {
    return {
      id: row.id,
      animeId: row.animeId,
      number: row.number,
      title: row.title,
    };
  }

  private toServer(row: ServerEntity): Server {
    return {
      id: row.id,
      episodeId: row.episodeId,
      name: row.name,
      embedUrl: row.embedUrl,
      language: row.language,
    };
  }
}
