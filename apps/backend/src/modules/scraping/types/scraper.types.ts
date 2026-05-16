import { AnimeStatus, Language } from '@anime-gamify/shared-types';

export interface CatalogItem {
  slug: string;
  externalId: string;
  title: string;
  coverUrl: string;
}

export interface ScrapedServer {
  name: string;
  embedUrl: string;
  language: Language;
}

export interface ScrapedEpisode {
  number: number;
  title: string;
  url: string;
  servers: ScrapedServer[];
}

export interface ScrapedAnimeDetail {
  description: string;
  status: AnimeStatus;
  totalEpisodes: number;
  seasons: number;
  categories: string[];
  episodes: ScrapedEpisode[];
}

export interface ScrapedAnime extends CatalogItem, ScrapedAnimeDetail {}
