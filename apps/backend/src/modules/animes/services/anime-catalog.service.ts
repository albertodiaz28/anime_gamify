import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AnimeCard,
  CatalogQuery,
  CatalogSort,
  CursorPage,
} from '@anime-gamify/shared-types';
import { AnimeEntity } from '../entities/anime.entity';
import {
  decodeCursor,
  encodeCursor,
  extractSortValue,
  SORT_COLUMN,
  SORT_DIRECTION,
} from './catalog-cursor';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const DEFAULT_SORT = CatalogSort.NEWEST;

@Injectable()
export class AnimeCatalogService {
  constructor(
    @InjectRepository(AnimeEntity)
    private readonly repo: Repository<AnimeEntity>,
  ) {}

  async findCatalog(query: CatalogQuery): Promise<CursorPage<AnimeCard>> {
    const sort = query.sort ?? DEFAULT_SORT;
    const limit = this.normalizeLimit(query.limit);
    const qb = this.buildBaseQuery();
    this.applyFilters(qb, query);
    this.applySort(qb, sort);
    this.applyCursor(qb, sort, query.cursor);
    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = slice.map((row) => this.toCard(row));
    const nextCursor = hasMore ? this.buildNextCursor(slice[slice.length - 1], sort) : null;
    return { items, nextCursor, hasMore };
  }

  private normalizeLimit(limit: number | undefined): number {
    if (!limit || limit < 1) {
      return DEFAULT_LIMIT;
    }
    return Math.min(limit, MAX_LIMIT);
  }

  private buildBaseQuery(): SelectQueryBuilder<AnimeEntity> {
    return this.repo
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.categories', 'category');
  }

  private applyFilters(qb: SelectQueryBuilder<AnimeEntity>, query: CatalogQuery): void {
    this.applyTextFilter(qb, query);
    this.applyCategoryFilter(qb, query);
    this.applyEpisodeFilters(qb, query);
    this.applyLanguageFilter(qb, query);
  }

  private applyTextFilter(qb: SelectQueryBuilder<AnimeEntity>, query: CatalogQuery): void {
    if (query.q && query.q.trim().length > 0) {
      qb.andWhere('anime.title ILIKE :q', { q: `%${query.q.trim()}%` });
    }
  }

  private applyCategoryFilter(qb: SelectQueryBuilder<AnimeEntity>, query: CatalogQuery): void {
    if (!query.categoryId || query.categoryId.length === 0) {
      return;
    }
    qb.andWhere(
      (sub) =>
        'anime.id IN ' +
        sub
          .subQuery()
          .select('ac.anime_id')
          .from('anime_categories', 'ac')
          .where('ac.category_id IN (:...categoryIds)')
          .getQuery(),
      { categoryIds: query.categoryId },
    );
  }

  private applyEpisodeFilters(qb: SelectQueryBuilder<AnimeEntity>, query: CatalogQuery): void {
    if (typeof query.minEpisodes === 'number') {
      qb.andWhere('anime.total_episodes >= :minEpisodes', { minEpisodes: query.minEpisodes });
    }
    if (typeof query.maxEpisodes === 'number') {
      qb.andWhere('anime.total_episodes <= :maxEpisodes', { maxEpisodes: query.maxEpisodes });
    }
    if (typeof query.season === 'number') {
      qb.andWhere('anime.seasons = :season', { season: query.season });
    }
  }

  private applyLanguageFilter(qb: SelectQueryBuilder<AnimeEntity>, query: CatalogQuery): void {
    if (!query.language || query.language.length === 0) {
      return;
    }
    qb.andWhere(
      (sub) =>
        'anime.id IN ' +
        sub
          .subQuery()
          .select('ep.anime_id')
          .from('episodes', 'ep')
          .innerJoin('servers', 'sv', 'sv.episode_id = ep.id')
          .where('sv.language IN (:...langs)')
          .getQuery(),
      { langs: query.language },
    );
  }

  private applySort(qb: SelectQueryBuilder<AnimeEntity>, sort: CatalogSort): void {
    const column = SORT_COLUMN[sort];
    const direction = SORT_DIRECTION[sort];
    qb.orderBy(column, direction);
    qb.addOrderBy('anime.id', direction);
  }

  private applyCursor(
    qb: SelectQueryBuilder<AnimeEntity>,
    sort: CatalogSort,
    cursor: string | undefined,
  ): void {
    if (!cursor) {
      return;
    }
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      return;
    }
    const column = SORT_COLUMN[sort];
    const comparator = SORT_DIRECTION[sort] === 'ASC' ? '>' : '<';
    qb.andWhere(
      `(${column}, anime.id) ${comparator} (:cursorValue, :cursorId)`,
      { cursorValue: decoded.v, cursorId: decoded.id },
    );
  }

  private buildNextCursor(row: AnimeEntity, sort: CatalogSort): string {
    const value = extractSortValue(
      {
        title: row.title,
        avgRating: row.avgRating,
        totalEpisodes: row.totalEpisodes,
        createdAt: row.createdAt,
      },
      sort,
    );
    return encodeCursor({ v: value, id: row.id });
  }

  private toCard(row: AnimeEntity): AnimeCard {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      coverUrl: row.coverUrl,
      totalEpisodes: row.totalEpisodes,
      status: row.status,
      avgRating: Number(row.avgRating),
      ratingCount: row.ratingCount,
      categories: (row.categories ?? []).map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
      })),
    };
  }
}
