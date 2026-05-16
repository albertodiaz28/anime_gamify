import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnimeStatus } from '@anime-gamify/shared-types';
import { CategoryEntity } from '../../categories';

@Entity({ name: 'animes' })
export class AnimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', name: 'external_id', length: 128 })
  externalId!: string;

  @Index()
  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', name: 'cover_url', length: 500 })
  coverUrl!: string;

  @Index()
  @Column({ type: 'int', name: 'total_episodes', default: 0 })
  totalEpisodes!: number;

  @Column({ type: 'int', default: 1 })
  seasons!: number;

  @Column({ type: 'enum', enum: AnimeStatus, default: AnimeStatus.AIRING })
  status!: AnimeStatus;

  @Index()
  @Column({ type: 'numeric', name: 'avg_rating', precision: 4, scale: 2, default: 0 })
  avgRating!: string;

  @Column({ type: 'int', name: 'rating_count', default: 0 })
  ratingCount!: number;

  @ManyToMany(() => CategoryEntity, { cascade: false })
  @JoinTable({
    name: 'anime_categories',
    joinColumn: { name: 'anime_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: CategoryEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
