import type {
  DataSource,
  EntityManager,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { XP_PER_RATING } from '@anime-gamify/shared-constants';
import { LevelService } from '../gamification/services/level.service';
import { RatingEntity } from './entities/rating.entity';
import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  let levelService: jest.Mocked<LevelService>;
  let ratingsRepo: jest.Mocked<Repository<RatingEntity>>;
  let manager: jest.Mocked<EntityManager>;
  let dataSource: jest.Mocked<DataSource>;
  let service: RatingsService;

  const baseEntity: RatingEntity = {
    userId: 'u1',
    animeId: 'a1',
    score: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    ratingsRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (r: RatingEntity) => r),
      create: jest.fn().mockImplementation((data: Partial<RatingEntity>) => ({
        ...baseEntity,
        ...data,
      })),
    } as unknown as jest.Mocked<Repository<RatingEntity>>;

    manager = {
      getRepository: jest.fn().mockReturnValue(ratingsRepo),
      query: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EntityManager>;

    levelService = {
      addXp: jest.fn().mockResolvedValue({ newXp: XP_PER_RATING, oldLevel: 1, newLevel: 1, leveledUp: false }),
    } as unknown as jest.Mocked<LevelService>;

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: EntityManager) => unknown) => cb(manager)),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new RatingsService(dataSource, levelService);
  });

  it('inserts a new rating and grants XP', async () => {
    ratingsRepo.findOne.mockResolvedValue(null);

    const result = await service.upsertRating('u1', 'a1', 8);

    expect(result.score).toBe(8);
    expect(levelService.addXp).toHaveBeenCalledWith('u1', XP_PER_RATING);
    expect(manager.query).toHaveBeenCalled();
  });

  it('updates without granting XP when rating already exists', async () => {
    ratingsRepo.findOne.mockResolvedValue({ ...baseEntity });

    await service.upsertRating('u1', 'a1', 9);

    expect(levelService.addXp).not.toHaveBeenCalled();
  });

  it('computes aggregate from the ratings table', async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ avg: '7.5', count: '2' }),
    } as unknown as SelectQueryBuilder<ObjectLiteral>;
    (dataSource.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const result = await service.getAggregate('a1');

    expect(result).toEqual({ animeId: 'a1', avg: 7.5, count: 2 });
  });
});
