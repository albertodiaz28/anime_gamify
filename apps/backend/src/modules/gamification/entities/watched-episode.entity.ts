import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'watched_episodes' })
export class WatchedEpisodeEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'episode_id' })
  episodeId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'watched_at' })
  watchedAt!: Date;
}
