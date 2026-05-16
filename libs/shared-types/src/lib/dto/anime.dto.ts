import { AnimeStatus } from '../enums/anime-status.enum';
import { Language } from '../enums/language.enum';
import { CatalogSort } from '../enums/sort.enum';
import { Category } from '../entities/category.types';
import { Episode } from '../entities/episode.types';

export interface CatalogQuery {
  q?: string;
  categoryId?: string[];
  minEpisodes?: number;
  maxEpisodes?: number;
  language?: Language[];
  season?: number;
  sort?: CatalogSort;
  cursor?: string;
  limit?: number;
}

export interface AnimeCard {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  totalEpisodes: number;
  status: AnimeStatus;
  avgRating: number;
  ratingCount: number;
  categories: Pick<Category, 'id' | 'slug' | 'name'>[];
}

export interface AnimeDetail {
  id: string;
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
  episodes: Episode[];
}
