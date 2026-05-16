export interface Rating {
  userId: string;
  animeId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingAggregate {
  animeId: string;
  avg: number;
  count: number;
}
