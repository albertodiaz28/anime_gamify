import { load } from 'cheerio';
import { parseCatalogPage } from './catalog.parser';
import { catalogHtmlFixture } from './__fixtures__/catalog.fixture';

describe('parseCatalogPage', () => {
  it('extracts items whose href matches /anime/<slug>', () => {
    const items = parseCatalogPage(load(catalogHtmlFixture));
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      slug: 'shingeki-no-kyojin',
      externalId: 'shingeki-no-kyojin',
      title: 'Shingeki no Kyojin',
      coverUrl: 'https://cdn.example.com/aot.jpg',
    });
    expect(items[1].slug).toBe('one-piece-tv');
  });

  it('returns empty array when no anime cards are present', () => {
    const items = parseCatalogPage(load('<html><body><ul class="ListAnimes"></ul></body></html>'));
    expect(items).toEqual([]);
  });
});
