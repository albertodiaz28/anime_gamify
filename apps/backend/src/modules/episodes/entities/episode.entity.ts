import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AnimeEntity } from '../../animes/entities/anime.entity';
import { ServerEntity } from './server.entity';

@Entity({ name: 'episodes' })
@Unique('UQ_episodes_anime_number', ['animeId', 'number'])
export class EpisodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'anime_id' })
  animeId!: string;

  @Column({ type: 'int' })
  number!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ManyToOne(() => AnimeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'anime_id' })
  anime?: AnimeEntity;

  @OneToMany(() => ServerEntity, (server) => server.episode)
  servers?: ServerEntity[];
}
