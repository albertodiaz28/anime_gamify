import { Injectable, Logger } from '@nestjs/common';
import { ENV_FALLBACK_JIKAN } from '../constants/scraping.constants';
import type { ScrapedAnimeDetail } from '../types/scraper.types';

@Injectable()
export class JikanFallbackService {
  private readonly logger = new Logger(JikanFallbackService.name);

  isEnabled(): boolean {
    return process.env[ENV_FALLBACK_JIKAN] === 'true';
  }

  async fetchAnimeDetail(_slug: string): Promise<ScrapedAnimeDetail | null> {
    if (!this.isEnabled()) return null;
    this.logger.warn(`Jikan fallback requested but not implemented yet (slug=${_slug})`);
    return null;
  }
}
