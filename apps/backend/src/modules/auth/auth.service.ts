import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthResponse, AuthTokens, JwtPayload } from '@anime-gamify/shared-types';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    await this.assertUniqueEmailAndUsername(dto.email, dto.username);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  private async assertUniqueEmailAndUsername(email: string, username: string): Promise<void> {
    const [byEmail, byUsername] = await Promise.all([
      this.usersService.findByEmail(email),
      this.usersService.findByUsername(username),
    ]);
    if (byEmail) {
      throw new ConflictException('Email already registered');
    }
    if (byUsername) {
      throw new ConflictException('Username already taken');
    }
  }

  private buildAuthResponse(user: UserEntity): AuthResponse {
    const tokens = this.issueTokens(user);
    return { user: this.usersService.toPublicUser(user), tokens };
  }

  private issueTokens(user: UserEntity): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const expiresIn = Number(
      this.configService.get<string>('JWT_EXPIRES_IN_SECONDS') ?? DEFAULT_EXPIRES_IN_SECONDS,
    );
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    return { accessToken, expiresIn };
  }
}
