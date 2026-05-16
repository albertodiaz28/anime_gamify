import { SkillType } from '@anime-gamify/shared-types';

export interface SkillSeed {
  slug: string;
  name: string;
  description: string;
  requiredLevel: number;
  type: SkillType;
  payload: Record<string, unknown>;
}

export const SKILLS_SEED: readonly SkillSeed[] = Object.freeze([
  {
    slug: 'hair-classic',
    name: 'Classic Hair',
    description: 'Starter hairstyle for every otaku.',
    requiredLevel: 1,
    type: SkillType.COSMETIC,
    payload: { slot: 'hair', asset: 'hair_classic' },
  },
  {
    slug: 'hair-spiky',
    name: 'Spiky Hair',
    description: 'For protagonists who refuse to lose.',
    requiredLevel: 3,
    type: SkillType.COSMETIC,
    payload: { slot: 'hair', asset: 'hair_spiky' },
  },
  {
    slug: 'eyes-sharingan',
    name: 'Crimson Eyes',
    description: 'Unlocked after binging at least 5 series.',
    requiredLevel: 5,
    type: SkillType.COSMETIC,
    payload: { slot: 'eyes', asset: 'eyes_crimson' },
  },
  {
    slug: 'outfit-uniform',
    name: 'School Uniform',
    description: 'A timeless classic.',
    requiredLevel: 2,
    type: SkillType.COSMETIC,
    payload: { slot: 'outfit', asset: 'outfit_uniform' },
  },
  {
    slug: 'outfit-hero-cape',
    name: 'Hero Cape',
    description: 'Reserved for those who break the limit.',
    requiredLevel: 10,
    type: SkillType.COSMETIC,
    payload: { slot: 'outfit', asset: 'outfit_cape' },
  },
  {
    slug: 'bg-sakura',
    name: 'Sakura Background',
    description: 'Soft petals for slice-of-life fans.',
    requiredLevel: 4,
    type: SkillType.COSMETIC,
    payload: { slot: 'background', asset: 'bg_sakura' },
  },
  {
    slug: 'bg-galaxy',
    name: 'Galaxy Background',
    description: 'For mecha enthusiasts.',
    requiredLevel: 12,
    type: SkillType.COSMETIC,
    payload: { slot: 'background', asset: 'bg_galaxy' },
  },
  {
    slug: 'feature-watchlist',
    name: 'Custom Watchlist',
    description: 'Unlocks personal watchlists.',
    requiredLevel: 6,
    type: SkillType.FEATURE,
    payload: { featureKey: 'watchlist' },
  },
  {
    slug: 'feature-rating-weight',
    name: 'Weighted Rating',
    description: 'Your rating counts double for the global score.',
    requiredLevel: 15,
    type: SkillType.FEATURE,
    payload: { featureKey: 'rating_weight' },
  },
  {
    slug: 'feature-pinned-comments',
    name: 'Pinned Comments',
    description: 'Your top comment stays at the top.',
    requiredLevel: 20,
    type: SkillType.FEATURE,
    payload: { featureKey: 'pinned_comments' },
  },
]);
