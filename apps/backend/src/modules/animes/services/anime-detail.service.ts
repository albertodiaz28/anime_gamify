import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimeDetail } from '@anime-gamify/shared-types';
import { AnimeEntity } from '../entities/anime.entity';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';
import { ServerEntity } from '../../episodes/entities/server.entity';

@Injectable()
export class AnimeDetailService {
  constructor(
    @InjectRepository(AnimeEntity)
    private readonly animes: Repository<AnimeEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
  ) {}

  async findOne(id: string): Promise<AnimeDetail> {
    const anime = await this.animes
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.categories', 'category')
      .where('anime.id = :id', { id })
      .getOne();

    if (!anime) {
      throw new NotFoundException('Anime not found');
    }

    const episodes = await this.episodes
      .createQueryBuilder('ep')
      .leftJoinAndSelect('ep.servers', 'sv')
      .where('ep.anime_id = :id', { id })
      .orderBy('ep.number', 'ASC')
      .getMany();

    return this.toDetail(anime, episodes);
  }

  private toDetail(anime: AnimeEntity, episodes: EpisodeEntity[]): AnimeDetail {
    return {
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      description: anime.description,
      coverUrl: anime.coverUrl,
      totalEpisodes: anime.totalEpisodes,
      seasons: anime.seasons,
      status: anime.status,
      avgRating: Number(anime.avgRating),
      ratingCount: anime.ratingCount,
      categories: (anime.categories ?? []).map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
      })),
      episodes: episodes.map((ep) => ({
        id: ep.id,
        animeId: ep.animeId,
        number: ep.number,
        title: ep.title,
        servers: (ep.servers ?? []).map((sv: ServerEntity) => ({
          id: sv.id,
          episodeId: sv.episodeId,
          name: sv.name,
          embedUrl: sv.embedUrl,
          language: sv.language,
        })),
      })),
    };
  }
}
