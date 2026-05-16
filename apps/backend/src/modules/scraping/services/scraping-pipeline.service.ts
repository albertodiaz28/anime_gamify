import { Injectable, Logger } from '@nestjs/common';
import { randomDelay } from '../utils/delay.util';
import { AnimeFlvScraper } from './animeflv-scraper.service';
import { AnimeImporterService } from './anime-importer.service';
import { BrowserService } from './browser.service';
import { JikanFallbackService } from './jikan-fallback.service';
import type { CatalogItem, ScrapedAnime } from '../types/scraper.types';

export interface PipelineOptions {
  limit: number;
  fromPage: number;
  dryRun: boolean;
}

@Injectable()
export class ScrapingPipelineService {
  private readonly logger = new Logger(ScrapingPipelineService.name);

  constructor(
    private readonly scraper: AnimeFlvScraper,
    private readonly importer: AnimeImporterService,
    private readonly browser: BrowserService,
    private readonly fallback: JikanFallbackService,
  ) {}

  async run(options: PipelineOptions): Promise<void> {
    const start = Date.now();
    let processed = 0;
    let page = options.fromPage;
    try {
      while (processed < options.limit) {
        const catalog = await this.scraper.fetchCatalogPage(page);
        if (catalog.length === 0) break;
        for (const item of catalog) {
          if (processed >= options.limit) break;
          await this.processItem(item, options.dryRun);
          processed += 1;
        }
        page += 1;
        await randomDelay();
      }
    } finally {
      await this.browser.close();
    }
    this.logger.log(
      `pipeline done: processed=${processed} pages=${page - options.fromPage + 1} elapsedMs=${Date.now() - start}`,
    );
  }

  private async processItem(item: CatalogItem, dryRun: boolean): Promise<void> {
    const detail =
      (await safeDetail(() => this.scraper.fetchAnimeDetail(item.slug))) ??
      (await this.fallback.fetchAnimeDetail(item.slug));
    if (!detail) {
      this.logger.warn(`skip ${item.slug}: no detail available`);
      return;
    }
    const full: ScrapedAnime = { ...item, ...detail };
    if (dryRun) {
      this.logger.log(`dry-run ${item.slug}: episodes=${detail.episodes.length}`);
      return;
    }
    const id = await this.importer.upsertAnime(full);
    this.logger.log(`upserted ${item.slug} as ${id}`);
  }
}

async function safeDetail<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}
