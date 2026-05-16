import { AnimeStatus } from '../enums/anime-status.enum';
import { Category } from './category.types';

export interface Anime {
  id: string;
  externalId: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  totalEpisodes: number;
  seasons: number;
  status: AnimeStatus;
  avgRating: number;
  ratingCount: number;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}
