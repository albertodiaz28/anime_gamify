import { CatalogSort } from '@anime-gamify/shared-types';

export interface CursorPayload {
  v: string | number;
  id: string;
}

export const SORT_COLUMN: Record<CatalogSort, string> = {
  [CatalogSort.TITLE_ASC]: 'anime.title',
  [CatalogSort.RATING_DESC]: 'anime.avg_rating',
  [CatalogSort.EPISODES_DESC]: 'anime.total_episodes',
  [CatalogSort.NEWEST]: 'anime.created_at',
};

export const SORT_DIRECTION: Record<CatalogSort, 'ASC' | 'DESC'> = {
  [CatalogSort.TITLE_ASC]: 'ASC',
  [CatalogSort.RATING_DESC]: 'DESC',
  [CatalogSort.EPISODES_DESC]: 'DESC',
  [CatalogSort.NEWEST]: 'DESC',
};

export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

export const decodeCursor = (cursor: string): CursorPayload | null => {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as CursorPayload;
    if (parsed && typeof parsed.id === 'string' && parsed.v !== undefined) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const extractSortValue = (
  row: { title: string; avgRating: string | number; totalEpisodes: number; createdAt: Date },
  sort: CatalogSort,
): string | number => {
  switch (sort) {
    case CatalogSort.TITLE_ASC:
      return row.title;
    case CatalogSort.RATING_DESC:
      return typeof row.avgRating === 'string' ? Number(row.avgRating) : row.avgRating;
    case CatalogSort.EPISODES_DESC:
      return row.totalEpisodes;
    case CatalogSort.NEWEST:
      return row.createdAt.toISOString();
  }
};
