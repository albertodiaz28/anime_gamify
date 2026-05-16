import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { SkillType, type SkillPayload } from '@anime-gamify/shared-types';

@Entity({ name: 'skills' })
export class SkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Index()
  @Column({ type: 'int', name: 'required_level' })
  requiredLevel!: number;

  @Column({ type: 'enum', enum: SkillType })
  type!: SkillType;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: SkillPayload;
}
