import { Module } from '@nestjs/common';
import { AnimeFlvScraper } from './services/animeflv-scraper.service';
import { AnimeImporterService } from './services/anime-importer.service';
import { BrowserService } from './services/browser.service';
import { JikanFallbackService } from './services/jikan-fallback.service';
import { ScrapingPipelineService } from './services/scraping-pipeline.service';

@Module({
  providers: [
    BrowserService,
    AnimeFlvScraper,
    AnimeImporterService,
    JikanFallbackService,
    ScrapingPipelineService,
  ],
  exports: [ScrapingPipelineService],
})
export class ScrapingModule {}
