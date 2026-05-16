# Module: scraping (one-shot CLI)

Populates the database with anime data from AnimeFLV. Runs **once** for the MVP.

## Stack (MANDATORY)
- `puppeteer-extra` + `puppeteer-extra-plugin-stealth` (AnimeFLV is behind Cloudflare; axios+cheerio gets 403)
- `cheerio` only for parsing `page.content()` already rendered
- `nest-commander` for the CLI

## Puppeteer config
- `headless: 'new'`
- args: `--no-sandbox`, `--disable-blink-features=AutomationControlled`
- Realistic rotating User-Agent
- Wait for `networkidle2`; allow up to 45s on Cloudflare challenge
- **Reuse a single page** across requests (persist Cloudflare cookies)

## Pipeline
1. Fetch catalog pages (paginated)
2. For each anime → fetch detail (title, description, cover, status, genres, episodes)
3. For each episode → fetch servers (name, embedUrl, language)
4. Upsert by `externalId` (idempotent)

## Behaviour
- Exponential backoff + random delay 1.5–3s between pages
- Structured logging with progress counters
- CLI flags: `--limit`, `--from-page`, `--dry-run`
- Command name: `scrape` (`nx run backend:scrape`)

## Fallback
If Cloudflare persistently blocks: switch to **Jikan API** (unofficial MyAnimeList) for metadata + AnimeFLV only for server URLs. Document the decision.

## Files expected
- `scraping.module.ts`
- `commands/scrape.command.ts`
- `services/animeflv-scraper.service.ts`
- `services/browser.service.ts` (Puppeteer lifecycle)
- `services/anime-importer.service.ts` (upsert logic)
- `parsers/anime-detail.parser.ts`, `parsers/episode.parser.ts`, `parsers/server.parser.ts`
