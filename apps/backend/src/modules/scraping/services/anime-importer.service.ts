// Persistence: tables are owned by feat/backend-domain — uses raw SQL by design until merge.
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import type { ScrapedAnime, ScrapedEpisode, ScrapedServer } from '../types/scraper.types';

@Injectable()
export class AnimeImporterService {
  private readonly logger = new Logger(AnimeImporterService.name);

  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  async upsertAnime(data: ScrapedAnime): Promise<string> {
    return this.manager.transaction(async (trx) => {
      const animeId = await this.upsertAnimeRow(trx, data);
      await this.replaceCategories(trx, animeId, data.categories);
      await this.replaceEpisodes(trx, animeId, data.episodes);
      this.logger.debug(`upsert ok: ${data.externalId} -> ${animeId}`);
      return animeId;
    });
  }

  private async upsertAnimeRow(trx: EntityManager, data: ScrapedAnime): Promise<string> {
    const rows = (await trx.query(
      `INSERT INTO animes (external_id, slug, title, description, cover_url, total_episodes, seasons, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (external_id) DO UPDATE SET
         slug = EXCLUDED.slug,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         cover_url = EXCLUDED.cover_url,
         total_episodes = EXCLUDED.total_episodes,
         seasons = EXCLUDED.seasons,
         status = EXCLUDED.status,
         updated_at = NOW()
       RETURNING id`,
      [
        data.externalId,
        data.slug,
        data.title,
        data.description,
        data.coverUrl,
        data.totalEpisodes,
        data.seasons,
        data.status,
      ],
    )) as Array<{ id: string }>;
    const id = rows[0]?.id;
    if (!id) throw new Error(`Failed to upsert anime ${data.externalId}`);
    return id;
  }

  private async replaceCategories(
    trx: EntityManager,
    animeId: string,
    categoryNames: string[],
  ): Promise<void> {
    await trx.query(`DELETE FROM anime_category WHERE anime_id = $1`, [animeId]);
    for (const name of categoryNames) {
      const slug = slugify(name);
      const rows = (await trx.query(
        `INSERT INTO categories (slug, name) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [slug, name],
      )) as Array<{ id: string }>;
      const categoryId = rows[0]?.id;
      if (!categoryId) continue;
      await trx.query(
        `INSERT INTO anime_category (anime_id, category_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [animeId, categoryId],
      );
    }
  }

  private async replaceEpisodes(
    trx: EntityManager,
    animeId: string,
    episodes: ScrapedEpisode[],
  ): Promise<void> {
    for (const episode of episodes) {
      const rows = (await trx.query(
        `INSERT INTO episodes (anime_id, number, title)
         VALUES ($1, $2, $3)
         ON CONFLICT (anime_id, number) DO UPDATE SET title = EXCLUDED.title
         RETURNING id`,
        [animeId, episode.number, episode.title],
      )) as Array<{ id: string }>;
      const episodeId = rows[0]?.id;
      if (!episodeId) continue;
      await this.replaceServers(trx, episodeId, episode.servers);
    }
  }

  private async replaceServers(
    trx: EntityManager,
    episodeId: string,
    servers: ScrapedServer[],
  ): Promise<void> {
    await trx.query(`DELETE FROM servers WHERE episode_id = $1`, [episodeId]);
    for (const server of servers) {
      await trx.query(
        `INSERT INTO servers (episode_id, name, embed_url, language)
         VALUES ($1, $2, $3, $4)`,
        [episodeId, server.name, server.embedUrl, server.language],
      );
    }
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
