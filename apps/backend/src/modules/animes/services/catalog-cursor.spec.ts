import { CatalogSort } from '@anime-gamify/shared-types';
import {
  decodeCursor,
  encodeCursor,
  extractSortValue,
  SORT_COLUMN,
  SORT_DIRECTION,
} from './catalog-cursor';

describe('catalog-cursor', () => {
  it('encodes and decodes a payload symmetrically', () => {
    const cursor = encodeCursor({ v: 'Naruto', id: 'abc' });
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ v: 'Naruto', id: 'abc' });
  });

  it('decodes invalid cursors to null', () => {
    expect(decodeCursor('not-base64-json')).toBeNull();
    expect(decodeCursor('')).toBeNull();
  });

  it('maps every sort to a column and direction', () => {
    for (const sort of Object.values(CatalogSort)) {
      expect(SORT_COLUMN[sort]).toBeDefined();
      expect(SORT_DIRECTION[sort]).toMatch(/ASC|DESC/);
    }
  });

  it('extracts the proper sort value for each sort', () => {
    const row = {
      title: 'Bleach',
      avgRating: '4.5',
      totalEpisodes: 200,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    expect(extractSortValue(row, CatalogSort.TITLE_ASC)).toBe('Bleach');
    expect(extractSortValue(row, CatalogSort.RATING_DESC)).toBe(4.5);
    expect(extractSortValue(row, CatalogSort.EPISODES_DESC)).toBe(200);
    expect(extractSortValue(row, CatalogSort.NEWEST)).toBe('2024-01-01T00:00:00.000Z');
  });
});
