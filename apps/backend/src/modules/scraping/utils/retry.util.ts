import { Logger } from '@nestjs/common';
import { BASE_BACKOFF_MS, MAX_RETRIES } from '../constants/scraping.constants';
import { backoffDelayMs, sleep } from './delay.util';

const logger = new Logger('Retry');

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      if (attempt === maxRetries) break;
      const wait = backoffDelayMs(attempt, BASE_BACKOFF_MS);
      logger.warn(`${label} failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${wait}ms.`);
      await sleep(wait);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed after ${maxRetries + 1} attempts`);
}
