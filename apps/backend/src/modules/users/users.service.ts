import { Injectable, NotFoundException } from '@nestjs/common';
import type { AvatarConfig, User } from '@anime-gamify/shared-types';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  findByUsername(username: string): Promise<UserEntity | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(input: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const entity = this.usersRepository.create({
      email: input.email,
      username: input.username,
      passwordHash: input.passwordHash,
      avatarConfig: { baseSkin: 'default' },
    });
    return this.usersRepository.save(entity);
  }

  async updateAvatar(userId: string, avatar: AvatarConfig): Promise<UserEntity> {
    const user = await this.findByIdOrFail(userId);
    user.avatarConfig = avatar;
    return this.usersRepository.save(user);
  }

  toPublicUser(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      xp: user.xp,
      avatarConfig: user.avatarConfig,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
