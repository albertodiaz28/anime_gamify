import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { ScrapingPipelineService } from '../services/scraping-pipeline.service';

interface ScrapeCliOptions {
  limit?: number;
  fromPage?: number;
  dryRun?: boolean;
}

const DEFAULT_LIMIT = 50;
const DEFAULT_FROM_PAGE = 1;

@Command({ name: 'scrape', description: 'Scrape AnimeFLV catalog and persist anime data' })
export class ScrapeCommand extends CommandRunner {
  private readonly logger = new Logger(ScrapeCommand.name);

  constructor(private readonly pipeline: ScrapingPipelineService) {
    super();
  }

  async run(_inputs: string[], options: ScrapeCliOptions = {}): Promise<void> {
    const resolved = {
      limit: options.limit ?? DEFAULT_LIMIT,
      fromPage: options.fromPage ?? DEFAULT_FROM_PAGE,
      dryRun: options.dryRun ?? false,
    };
    this.logger.log(
      `starting scrape limit=${resolved.limit} fromPage=${resolved.fromPage} dryRun=${resolved.dryRun}`,
    );
    await this.pipeline.run(resolved);
  }

  @Option({ flags: '--limit <n>', description: 'Maximum number of animes to process' })
  parseLimit(value: string): number {
    return parsePositiveInt(value, 'limit');
  }

  @Option({ flags: '--from-page <n>', description: 'Catalog page to start from' })
  parseFromPage(value: string): number {
    return parsePositiveInt(value, 'from-page');
  }

  @Option({ flags: '--dry-run', description: 'Skip persistence (log only)' })
  parseDryRun(): boolean {
    return true;
  }
}

function parsePositiveInt(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid --${label} value: ${value}`);
  }
  return parsed;
}
