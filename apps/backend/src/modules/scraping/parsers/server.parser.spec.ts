import { load } from 'cheerio';
import { Language } from '@anime-gamify/shared-types';
import { parseEpisodeServers } from './server.parser';
import { serversHtmlFixture } from './__fixtures__/servers.fixture';

describe('parseEpisodeServers', () => {
  it('extracts servers per language from videos object', () => {
    const servers = parseEpisodeServers(load(serversHtmlFixture));
    expect(servers).toHaveLength(3);

    const sub = servers.filter((s) => s.language === Language.JP_SUB);
    expect(sub).toHaveLength(2);
    expect(sub[0].embedUrl).toBe('https://mega.nz/embed/abc');
    expect(sub[0].name).toBe('Mega');

    const lat = servers.find((s) => s.language === Language.LAT);
    expect(lat?.embedUrl).toBe('https://yu.tv/e/1');
  });

  it('returns empty array when videos script is missing', () => {
    const servers = parseEpisodeServers(load('<html><body></body></html>'));
    expect(servers).toEqual([]);
  });
});
