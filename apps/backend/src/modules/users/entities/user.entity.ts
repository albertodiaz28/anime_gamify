import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { AvatarConfig } from '@anime-gamify/shared-types';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  username!: string;

  @Column({ type: 'varchar', name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @Column({
    type: 'jsonb',
    name: 'avatar_config',
    default: () => '\'{"baseSkin":"default"}\'::jsonb',
  })
  avatarConfig!: AvatarConfig;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
