import type { CheerioAPI } from 'cheerio';
import type { CatalogItem } from '../types/scraper.types';

const CATALOG_ITEM_SELECTOR = 'ul.ListAnimes li article.Anime';
const LINK_SELECTOR = 'a';
const TITLE_SELECTOR = 'h3.Title';
const IMG_SELECTOR = 'figure img';

export function parseCatalogPage($: CheerioAPI): CatalogItem[] {
  const items: CatalogItem[] = [];
  $(CATALOG_ITEM_SELECTOR).each((_, element) => {
    const node = $(element);
    const href = node.find(LINK_SELECTOR).first().attr('href') ?? '';
    const slug = extractSlugFromHref(href);
    if (!slug) return;
    const title = node.find(TITLE_SELECTOR).first().text().trim();
    const cover = node.find(IMG_SELECTOR).first().attr('src') ?? '';
    items.push({
      slug,
      externalId: slug,
      title,
      coverUrl: cover,
    });
  });
  return items;
}

function extractSlugFromHref(href: string): string | null {
  const match = href.match(/\/anime\/([^/?#]+)/);
  return match?.[1] ?? null;
}
