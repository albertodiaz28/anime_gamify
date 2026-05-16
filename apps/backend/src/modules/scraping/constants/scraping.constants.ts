export const ANIMEFLV_BASE_URL = 'https://www3.animeflv.net';
export const ANIMEFLV_BROWSE_PATH = '/browse';
export const ANIMEFLV_ANIME_PATH = '/anime';
export const ANIMEFLV_EPISODE_PATH = '/ver';

export const NAV_TIMEOUT_MS = 45_000;
export const NAV_WAIT_UNTIL = 'networkidle2' as const;

export const MIN_DELAY_MS = 1_500;
export const MAX_DELAY_MS = 3_000;

export const MAX_RETRIES = 4;
export const BASE_BACKOFF_MS = 1_000;

export const USER_AGENTS: readonly string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

export const PUPPETEER_ARGS: readonly string[] = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-blink-features=AutomationControlled',
  '--disable-dev-shm-usage',
];

export const ENV_FALLBACK_JIKAN = 'SCRAPER_FALLBACK_JIKAN';
