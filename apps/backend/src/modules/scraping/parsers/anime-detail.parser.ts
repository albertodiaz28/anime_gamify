import type { CheerioAPI } from 'cheerio';
import { AnimeStatus } from '@anime-gamify/shared-types';
import type { ScrapedAnimeDetail, ScrapedEpisode } from '../types/scraper.types';

const DESCRIPTION_SELECTOR = 'div.Description p';
const STATUS_SELECTOR = 'p.AnmStts span';
const GENRES_SELECTOR = 'nav.Nvgnrs a';
const EPISODES_SCRIPT_MATCH = /var\s+episodes\s*=\s*(\[\[.*?\]\]);/s;
const ANIME_INFO_SCRIPT_MATCH = /var\s+anime_info\s*=\s*(\[.*?\]);/s;

export function parseAnimeDetail($: CheerioAPI, slug: string): ScrapedAnimeDetail {
  const description = $(DESCRIPTION_SELECTOR).first().text().trim();
  const status = parseStatus($(STATUS_SELECTOR).first().text().trim());
  const categories = extractCategories($);
  const episodes = extractEpisodes($, slug);
  const totalEpisodes = episodes.length;
  const seasons = 1;
  return { description, status, totalEpisodes, seasons, categories, episodes };
}

function parseStatus(raw: string): AnimeStatus {
  const value = raw.toLowerCase();
  if (value.includes('emisi') || value.includes('airing')) return AnimeStatus.AIRING;
  if (value.includes('próx') || value.includes('prox') || value.includes('upcoming')) {
    return AnimeStatus.UPCOMING;
  }
  return AnimeStatus.FINISHED;
}

function extractCategories($: CheerioAPI): string[] {
  const result: string[] = [];
  $(GENRES_SELECTOR).each((_, element) => {
    const name = $(element).text().trim();
    if (name) result.push(name);
  });
  return result;
}

function extractEpisodes($: CheerioAPI, slug: string): ScrapedEpisode[] {
  const scriptText = collectScripts($);
  const episodesMatch = scriptText.match(EPISODES_SCRIPT_MATCH);
  if (!episodesMatch) return [];
  const raw = safeParseJson(episodesMatch[1]);
  if (!Array.isArray(raw)) return [];
  const animeInfoMatch = scriptText.match(ANIME_INFO_SCRIPT_MATCH);
  const animeInfo = animeInfoMatch ? safeParseJson(animeInfoMatch[1]) : null;
  const animeUid = Array.isArray(animeInfo) && typeof animeInfo[0] === 'string' ? animeInfo[0] : slug;
  return raw
    .map((entry): ScrapedEpisode | null => mapEpisodeEntry(entry, slug, animeUid))
    .filter((episode): episode is ScrapedEpisode => episode !== null)
    .sort((a, b) => a.number - b.number);
}

function mapEpisodeEntry(entry: unknown, slug: string, animeUid: string): ScrapedEpisode | null {
  if (!Array.isArray(entry) || entry.length < 2) return null;
  const number = Number(entry[0]);
  if (!Number.isFinite(number)) return null;
  return {
    number,
    title: `Episodio ${number}`,
    url: `/ver/${animeUid}/${slug}-${number}`,
    servers: [],
  };
}

function collectScripts($: CheerioAPI): string {
  const parts: string[] = [];
  $('script').each((_, el) => {
    parts.push($(el).html() ?? '');
  });
  return parts.join('\n');
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
