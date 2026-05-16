import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import type { UserEntity } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const baseUser: UserEntity = {
    id: 'user-1',
    email: 'a@b.com',
    username: 'alice',
    passwordHash: 'hashed',
    level: 1,
    xp: 0,
    avatarConfig: { baseSkin: 'default' },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  } as UserEntity;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      createUser: jest.fn(),
      toPublicUser: jest.fn().mockReturnValue({
        id: baseUser.id,
        email: baseUser.email,
        username: baseUser.username,
        level: 1,
        xp: 0,
        avatarConfig: baseUser.avatarConfig,
        createdAt: baseUser.createdAt.toISOString(),
      }),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
    } as unknown as jest.Mocked<JwtService>;
    configService = {
      get: jest.fn().mockReturnValue('3600'),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(usersService, jwtService, configService);
  });

  describe('register', () => {
    it('hashes password and returns tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(baseUser);

      const result = await service.register({
        email: 'a@b.com',
        username: 'alice',
        password: 'password123',
      });

      expect(usersService.createUser).toHaveBeenCalledTimes(1);
      const createArg = usersService.createUser.mock.calls[0][0];
      expect(createArg.passwordHash).not.toEqual('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
      expect(result.tokens.accessToken).toEqual('signed.jwt.token');
      expect(result.tokens.expiresIn).toEqual(3600);
    });

    it('throws if email already registered', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser);
      usersService.findByUsername.mockResolvedValue(null);
      await expect(
        service.register({ email: 'a@b.com', username: 'x', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws if username already taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(baseUser);
      await expect(
        service.register({ email: 'new@b.com', username: 'alice', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue({ ...baseUser, passwordHash } as UserEntity);

      const result = await service.login({ email: 'a@b.com', password: 'password123' });
      expect(result.tokens.accessToken).toEqual('signed.jwt.token');
    });

    it('throws when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'missing@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when password mismatch', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue({ ...baseUser, passwordHash } as UserEntity);
      await expect(
        service.login({ email: 'a@b.com', password: 'wrongpassword' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
