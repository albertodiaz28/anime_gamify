import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { UsersService } from '../users';
import { UserEntity } from '../users/entities/user.entity';
import { LevelService } from '../gamification/services/level.service';
import { CommentsService } from './comments.service';
import { CommentEntity } from './entities/comment.entity';

describe('CommentsService', () => {
  let comments: jest.Mocked<Repository<CommentEntity>>;
  let users: jest.Mocked<Repository<UserEntity>>;
  let usersService: jest.Mocked<UsersService>;
  let levelService: jest.Mocked<LevelService>;
  let service: CommentsService;

  const sampleUser: UserEntity = {
    id: 'u1',
    email: 'a@b.com',
    username: 'alice',
    passwordHash: '',
    level: 2,
    xp: 100,
    avatarConfig: { baseSkin: 'default' },
    createdAt: new Date(),
  } as UserEntity;

  beforeEach(() => {
    comments = {
      save: jest.fn(),
      create: jest.fn().mockImplementation((data: Partial<CommentEntity>) => data as CommentEntity),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<CommentEntity>>;
    users = {
      findOne: jest.fn().mockResolvedValue(sampleUser),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;
    usersService = {
      toPublicUser: jest.fn().mockReturnValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
        level: 2,
        xp: 100,
        avatarConfig: { baseSkin: 'default' },
        createdAt: '2024-01-01',
      }),
    } as unknown as jest.Mocked<UsersService>;
    levelService = {
      addXp: jest.fn().mockResolvedValue({ newXp: 0, oldLevel: 1, newLevel: 1, leveledUp: false }),
    } as unknown as jest.Mocked<LevelService>;
    service = new CommentsService(comments, users, usersService, levelService);
  });

  it('creates a sanitized comment and awards xp', async () => {
    const saved: CommentEntity = {
      id: 'c1',
      userId: 'u1',
      animeId: 'a1',
      parentId: null,
      body: 'hi',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    comments.save.mockResolvedValue(saved);

    const result = await service.create('u1', 'a1', '<b>hi</b>', undefined);

    expect(comments.save).toHaveBeenCalled();
    expect(result.body).toBe('hi');
    expect(result.author.username).toBe('alice');
    expect(levelService.addXp).toHaveBeenCalled();
  });

  it('rejects empty bodies after sanitization', async () => {
    await expect(
      service.create('u1', 'a1', '<script>x</script>', undefined),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects deletion by non-author', async () => {
    comments.findOne.mockResolvedValue({
      id: 'c1',
      userId: 'other',
      animeId: 'a',
      parentId: null,
      body: 'x',
      createdAt: new Date(),
    });

    await expect(service.remove('u1', 'c1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws not found when the comment is missing', async () => {
    comments.findOne.mockResolvedValue(null);
    await expect(service.remove('u1', 'c1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists comments with pagination', async () => {
    const row: CommentEntity = {
      id: 'c1',
      userId: 'u1',
      animeId: 'a1',
      parentId: null,
      body: 'hello',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    const qb = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([row]),
    } as unknown as SelectQueryBuilder<CommentEntity>;
    comments.createQueryBuilder.mockReturnValue(qb);
    const usersQb = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([sampleUser]),
    } as unknown as SelectQueryBuilder<UserEntity>;
    users.createQueryBuilder.mockReturnValue(usersQb);

    const result = await service.list('a1', undefined, 10);

    expect(result.items).toHaveLength(1);
    expect(result.hasMore).toBe(false);
    expect(result.items[0].author.username).toBe('alice');
  });
});
