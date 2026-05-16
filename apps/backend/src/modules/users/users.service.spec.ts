import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { UsersRepository } from './users.repository';
import type { UserEntity } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;

  const sampleUser: UserEntity = {
    id: 'u-1',
    email: 'a@b.com',
    username: 'alice',
    passwordHash: 'hash',
    level: 1,
    xp: 0,
    avatarConfig: { baseSkin: 'default' },
    createdAt: new Date(),
  } as UserEntity;

  beforeEach(() => {
    repo = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    service = new UsersService(repo);
  });

  describe('findByEmail', () => {
    it('returns the user found by email', async () => {
      repo.findByEmail.mockResolvedValue(sampleUser);
      const result = await service.findByEmail('a@b.com');
      expect(result).toBe(sampleUser);
      expect(repo.findByEmail).toHaveBeenCalledWith('a@b.com');
    });

    it('returns null when no user matches', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const result = await service.findByEmail('missing@b.com');
      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('throws NotFoundException when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findByIdOrFail('x')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
