import { load } from 'cheerio';
import { AnimeStatus } from '@anime-gamify/shared-types';
import { parseAnimeDetail } from './anime-detail.parser';
import {
  animeDetailFinishedHtmlFixture,
  animeDetailHtmlFixture,
} from './__fixtures__/anime-detail.fixture';

describe('parseAnimeDetail', () => {
  it('extracts description, status, categories and ordered episodes', () => {
    const detail = parseAnimeDetail(load(animeDetailHtmlFixture), 'shingeki-no-kyojin');

    expect(detail.description).toBe('Una historia épica de titanes y libertad.');
    expect(detail.status).toBe(AnimeStatus.AIRING);
    expect(detail.categories).toEqual(['Acción', 'Drama']);
    expect(detail.totalEpisodes).toBe(3);
    expect(detail.episodes.map((e) => e.number)).toEqual([1, 2, 3]);
    expect(detail.episodes[0].url).toBe('/ver/1234/shingeki-no-kyojin-1');
  });

  it('maps Finalizado to FINISHED status', () => {
    const detail = parseAnimeDetail(load(animeDetailFinishedHtmlFixture), 'kimetsu-no-yaiba');
    expect(detail.status).toBe(AnimeStatus.FINISHED);
    expect(detail.episodes).toHaveLength(1);
  });

  it('returns empty episodes when scripts are missing', () => {
    const detail = parseAnimeDetail(load('<html><body></body></html>'), 'whatever');
    expect(detail.episodes).toEqual([]);
    expect(detail.totalEpisodes).toBe(0);
  });
});
