import { APP_FILTER, APP_GUARD, Reflector } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import type { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const baseUser: UserEntity = {
    id: 'user-1',
    email: 'a@b.com',
    username: 'alice',
    passwordHash: '',
    level: 1,
    xp: 0,
    avatarConfig: { baseSkin: 'default' },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  } as UserEntity;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    createUser: jest.fn(),
    toPublicUser: jest.fn().mockImplementation((u: UserEntity) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      level: u.level,
      xp: u.xp,
      avatarConfig: u.avatarConfig,
      createdAt: u.createdAt.toISOString(),
    })),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }])],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: { sign: () => 'signed.jwt.token' } },
        { provide: ConfigService, useValue: { get: () => '3600' } },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        {
          provide: APP_GUARD,
          useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
          inject: [Reflector],
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('returns 201 with tokens for a valid body', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(null);
      usersServiceMock.createUser.mockResolvedValue(baseUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'a@b.com', username: 'alice', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.tokens.accessToken).toBe('signed.jwt.token');
      expect(response.body.user.email).toBe('a@b.com');
    });

    it('returns 400 for invalid body (missing email)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'alice', password: 'password123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 401 for unknown user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'missing@b.com', password: 'password123' });

      expect(response.status).toBe(401);
    });

    it('returns 200 with tokens for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      usersServiceMock.findByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@b.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.tokens.accessToken).toBe('signed.jwt.token');
    });
  });
});
