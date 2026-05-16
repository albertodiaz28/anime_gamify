import { MAX_DELAY_MS, MIN_DELAY_MS } from '../constants/scraping.constants';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(min: number = MIN_DELAY_MS, max: number = MAX_DELAY_MS): Promise<void> {
  const span = Math.max(0, max - min);
  const value = min + Math.floor(Math.random() * (span + 1));
  return sleep(value);
}

export function backoffDelayMs(attempt: number, base: number): number {
  const jitter = Math.floor(Math.random() * base);
  return base * 2 ** attempt + jitter;
}
