import { Injectable, Logger } from '@nestjs/common';
import { load } from 'cheerio';
import {
  ANIMEFLV_ANIME_PATH,
  ANIMEFLV_BASE_URL,
  ANIMEFLV_BROWSE_PATH,
} from '../constants/scraping.constants';
import { parseAnimeDetail, parseCatalogPage, parseEpisodeServers } from '../parsers';
import type {
  CatalogItem,
  ScrapedAnimeDetail,
  ScrapedServer,
} from '../types/scraper.types';
import { withRetry } from '../utils/retry.util';
import { BrowserService } from './browser.service';

@Injectable()
export class AnimeFlvScraper {
  private readonly logger = new Logger(AnimeFlvScraper.name);

  constructor(private readonly browser: BrowserService) {}

  async fetchCatalogPage(pageNumber: number): Promise<CatalogItem[]> {
    const url = this.buildCatalogUrl(pageNumber);
    const html = await withRetry(`catalog:${pageNumber}`, () => this.browser.getRenderedHtml(url));
    const items = parseCatalogPage(load(html));
    this.logger.log(`catalog page ${pageNumber}: ${items.length} items`);
    return items;
  }

  async fetchAnimeDetail(slug: string): Promise<ScrapedAnimeDetail> {
    const url = `${ANIMEFLV_BASE_URL}${ANIMEFLV_ANIME_PATH}/${slug}`;
    const html = await withRetry(`detail:${slug}`, () => this.browser.getRenderedHtml(url));
    const detail = parseAnimeDetail(load(html), slug);
    this.logger.log(`detail ${slug}: ${detail.episodes.length} episodes`);
    return detail;
  }

  async fetchEpisodeServers(episodeUrl: string): Promise<ScrapedServer[]> {
    const url = episodeUrl.startsWith('http') ? episodeUrl : `${ANIMEFLV_BASE_URL}${episodeUrl}`;
    const html = await withRetry(`servers:${url}`, () => this.browser.getRenderedHtml(url));
    return parseEpisodeServers(load(html));
  }

  private buildCatalogUrl(pageNumber: number): string {
    return `${ANIMEFLV_BASE_URL}${ANIMEFLV_BROWSE_PATH}?page=${pageNumber}`;
  }
}
