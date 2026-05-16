import type { CheerioAPI } from 'cheerio';
import { Language } from '@anime-gamify/shared-types';
import type { ScrapedServer } from '../types/scraper.types';

const VIDEOS_SCRIPT_MATCH = /var\s+videos\s*=\s*(\{[\s\S]*?\});\s*\$\(/;

interface RawServer {
  server?: unknown;
  title?: unknown;
  url?: unknown;
  code?: unknown;
}

export function parseEpisodeServers($: CheerioAPI): ScrapedServer[] {
  const scriptText = collectScripts($);
  const match = scriptText.match(VIDEOS_SCRIPT_MATCH);
  if (!match) return [];
  const parsed = safeParseJson(match[1]);
  if (!parsed || typeof parsed !== 'object') return [];
  return Object.entries(parsed as Record<string, unknown>).flatMap(([key, value]) =>
    extractServersForLanguage(key, value),
  );
}

function extractServersForLanguage(key: string, value: unknown): ScrapedServer[] {
  if (!Array.isArray(value)) return [];
  const language = mapLanguageKey(key);
  return value
    .map((raw): ScrapedServer | null => mapRawServer(raw, language))
    .filter((server): server is ScrapedServer => server !== null);
}

function mapRawServer(raw: unknown, language: Language): ScrapedServer | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as RawServer;
  const embedUrl = pickUrl(item);
  const name = typeof item.title === 'string' && item.title.length > 0
    ? item.title
    : typeof item.server === 'string' ? item.server : 'unknown';
  if (!embedUrl) return null;
  return { name, embedUrl, language };
}

function pickUrl(item: RawServer): string | null {
  if (typeof item.url === 'string' && item.url.length > 0) return item.url;
  if (typeof item.code === 'string' && item.code.length > 0) return item.code;
  return null;
}

function mapLanguageKey(key: string): Language {
  const value = key.toUpperCase();
  if (value === 'SUB') return Language.JP_SUB;
  if (value === 'LAT') return Language.LAT;
  if (value === 'ESP' || value === 'ES') return Language.ES;
  if (value === 'ENG_DUB' || value === 'DUB') return Language.EN_DUB;
  return Language.JP_SUB;
}

function collectScripts($: CheerioAPI): string {
  const parts: string[] = [];
  $('script').each((_, el) => parts.push($(el).html() ?? ''));
  return parts.join('\n');
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
