import { Repository } from 'typeorm';
import { AnimeStatus, CatalogSort, Language } from '@anime-gamify/shared-types';
import { AnimeEntity } from '../entities/anime.entity';
import { AnimeCatalogService } from './anime-catalog.service';
import { decodeCursor } from './catalog-cursor';

interface QueryBuilderCalls {
  whereClauses: { sql: string; params?: Record<string, unknown> }[];
  orderBy: { column: string; direction: 'ASC' | 'DESC' }[];
  takeValue: number;
}

const buildEntity = (overrides: Partial<AnimeEntity> = {}): AnimeEntity =>
  ({
    id: overrides.id ?? 'a-1',
    externalId: 'ext-1',
    slug: 'slug',
    title: overrides.title ?? 'Title',
    description: 'desc',
    coverUrl: 'cover',
    totalEpisodes: overrides.totalEpisodes ?? 12,
    seasons: 1,
    status: AnimeStatus.AIRING,
    avgRating: overrides.avgRating ?? '4.50',
    ratingCount: 10,
    categories: overrides.categories ?? [],
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  }) as unknown as AnimeEntity;

const createQueryBuilderMock = (rows: AnimeEntity[]) => {
  const calls: QueryBuilderCalls = {
    whereClauses: [],
    orderBy: [],
    takeValue: 0,
  };
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn((sql: unknown, params?: Record<string, unknown>) => {
      const text = typeof sql === 'function' ? '<sub>' : String(sql);
      calls.whereClauses.push({ sql: text, params });
      return qb;
    }),
    orderBy: jest.fn((column: string, direction: 'ASC' | 'DESC') => {
      calls.orderBy = [{ column, direction }];
      return qb;
    }),
    addOrderBy: jest.fn((column: string, direction: 'ASC' | 'DESC') => {
      calls.orderBy.push({ column, direction });
      return qb;
    }),
    take: jest.fn((value: number) => {
      calls.takeValue = value;
      return qb;
    }),
    subQuery: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn(() => '(SELECT 1)'),
    getMany: jest.fn().mockResolvedValue(rows),
  };
  return { qb, calls };
};

const createRepoMock = (rows: AnimeEntity[]) => {
  const { qb, calls } = createQueryBuilderMock(rows);
  const repo = {
    createQueryBuilder: jest.fn(() => qb),
  } as unknown as Repository<AnimeEntity>;
  return { repo, qb, calls };
};

describe('AnimeCatalogService', () => {
  it('returns mapped cards with no filters', async () => {
    const rows = [buildEntity({ id: 'a-1' }), buildEntity({ id: 'a-2' })];
    const { repo } = createRepoMock(rows);
    const service = new AnimeCatalogService(repo);

    const result = await service.findCatalog({});

    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('a-1');
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('applies q, episode bounds and season filters', async () => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);

    await service.findCatalog({
      q: 'naruto',
      minEpisodes: 10,
      maxEpisodes: 500,
      season: 2,
    });

    const sqls = calls.whereClauses.map((c) => c.sql);
    expect(sqls.some((s) => s.includes('ILIKE'))).toBe(true);
    expect(sqls.some((s) => s.includes('total_episodes >='))).toBe(true);
    expect(sqls.some((s) => s.includes('total_episodes <='))).toBe(true);
    expect(sqls.some((s) => s.includes('seasons'))).toBe(true);
  });

  it('applies category and language filters', async () => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);

    await service.findCatalog({
      categoryId: ['c-1', 'c-2'],
      language: [Language.ES, Language.JP_SUB],
    });

    expect(calls.whereClauses.length).toBeGreaterThanOrEqual(2);
  });

  it('uses NEWEST sort by default with DESC direction', async () => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);

    await service.findCatalog({});

    expect(calls.orderBy[0]).toEqual({ column: 'anime.created_at', direction: 'DESC' });
    expect(calls.orderBy[1]).toEqual({ column: 'anime.id', direction: 'DESC' });
  });

  it.each([
    [CatalogSort.TITLE_ASC, 'anime.title', 'ASC'],
    [CatalogSort.RATING_DESC, 'anime.avg_rating', 'DESC'],
    [CatalogSort.EPISODES_DESC, 'anime.total_episodes', 'DESC'],
    [CatalogSort.NEWEST, 'anime.created_at', 'DESC'],
  ])('honors %s', async (sort, expectedColumn, expectedDir) => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);
    await service.findCatalog({ sort });
    expect(calls.orderBy[0]).toEqual({ column: expectedColumn, direction: expectedDir });
  });

  it('emits a next cursor when there are more rows than the limit', async () => {
    const rows = Array.from({ length: 3 }, (_, i) =>
      buildEntity({ id: `a-${i}`, title: `T${i}` }),
    );
    const { repo, calls } = createRepoMock(rows);
    const service = new AnimeCatalogService(repo);

    const result = await service.findCatalog({ limit: 2, sort: CatalogSort.TITLE_ASC });

    expect(calls.takeValue).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).not.toBeNull();
    const decoded = decodeCursor(result.nextCursor as string);
    expect(decoded?.id).toBe('a-1');
    expect(decoded?.v).toBe('T1');
  });

  it('applies cursor as a where clause when provided', async () => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);
    const cursor = Buffer.from(JSON.stringify({ v: 'T1', id: 'a-1' }), 'utf8').toString(
      'base64url',
    );

    await service.findCatalog({ cursor, sort: CatalogSort.TITLE_ASC });

    const cursorClause = calls.whereClauses.find((c) => c.sql.includes('cursorValue'));
    expect(cursorClause).toBeDefined();
    expect(cursorClause?.params).toEqual({ cursorValue: 'T1', cursorId: 'a-1' });
  });

  it('caps limit at MAX_LIMIT', async () => {
    const { repo, calls } = createRepoMock([]);
    const service = new AnimeCatalogService(repo);
    await service.findCatalog({ limit: 9999 });
    expect(calls.takeValue).toBe(61);
  });
});
