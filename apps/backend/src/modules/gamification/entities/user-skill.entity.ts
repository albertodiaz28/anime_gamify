import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_skills' })
export class UserSkillEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'skill_id' })
  skillId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'unlocked_at' })
  unlockedAt!: Date;
}
