import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';
import {
  NAV_TIMEOUT_MS,
  NAV_WAIT_UNTIL,
  PUPPETEER_ARGS,
} from '../constants/scraping.constants';
import { pickUserAgent } from '../utils/user-agent.util';

puppeteerExtra.use(StealthPlugin());

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;
  private page: Page | null = null;

  async getPage(): Promise<Page> {
    if (this.page && !this.page.isClosed()) return this.page;
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(pickUserAgent());
    await page.setViewport({ width: 1366, height: 768 });
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
    this.page = page;
    return page;
  }

  async goto(url: string): Promise<Page> {
    const page = await this.getPage();
    this.logger.debug(`GET ${url}`);
    await page.goto(url, { waitUntil: NAV_WAIT_UNTIL, timeout: NAV_TIMEOUT_MS });
    return page;
  }

  async getRenderedHtml(url: string): Promise<string> {
    const page = await this.goto(url);
    return page.content();
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async close(): Promise<void> {
    if (this.page && !this.page.isClosed()) {
      await safeAwait(this.page.close());
      this.page = null;
    }
    if (this.browser) {
      await safeAwait(this.browser.close());
      this.browser = null;
    }
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser) return this.browser;
    this.logger.log('Launching Puppeteer browser');
    const launched = (await puppeteerExtra.launch({
      headless: 'new',
      args: [...PUPPETEER_ARGS],
    })) as unknown as Browser;
    this.browser = launched;
    return launched;
  }
}

async function safeAwait(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
  } catch {
    // best effort cleanup
  }
}
