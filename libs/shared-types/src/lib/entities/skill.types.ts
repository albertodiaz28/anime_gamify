import { SkillType } from '../enums/skill-type.enum';

export interface SkillPayload {
  asset?: string;
  slot?: 'hair' | 'eyes' | 'outfit' | 'background' | 'accessory';
  featureKey?: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  requiredLevel: number;
  type: SkillType;
  payload: SkillPayload;
}

export interface UserSkill {
  skill: Skill;
  unlocked: boolean;
  unlockedAt: string | null;
}
