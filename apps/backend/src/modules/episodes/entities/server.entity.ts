import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Language } from '@anime-gamify/shared-types';
import { EpisodeEntity } from './episode.entity';

@Entity({ name: 'servers' })
@Index('IDX_servers_episode_language', ['episodeId', 'language'])
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'episode_id' })
  episodeId!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', name: 'embed_url', length: 500 })
  embedUrl!: string;

  @Column({ type: 'enum', enum: Language })
  language!: Language;

  @ManyToOne(() => EpisodeEntity, (episode) => episode.servers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episode_id' })
  episode?: EpisodeEntity;
}
