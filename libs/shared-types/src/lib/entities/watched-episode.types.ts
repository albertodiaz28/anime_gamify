export interface WatchedEpisode {
  userId: string;
  episodeId: string;
  watchedAt: string;
}

export interface WatchResult {
  alreadyWatched: boolean;
  xpGained: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  unlockedSkillIds: string[];
}
