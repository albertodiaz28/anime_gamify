# Module: animes (core)

Owns `Anime` entity and the catalog endpoint. **Performance-critical**.

## Endpoints
- `GET /animes` — paginated catalog (cursor) with filters: `q, categoryId, minEpisodes, maxEpisodes, language, season, sort, cursor, limit`
- `GET /animes/:id` — detail with episodes + servers

## Performance rules (MUST)
- Use TypeORM `QueryBuilder` — NOT `repository.find()` with relations.
- Cursor pagination (sortKey + id tiebreaker), no offset.
- Required DB indexes:
  - `anime.title` (GIN trigram) — enable `pg_trgm` in migration
  - `anime.totalEpisodes` (btree)
  - `anime.externalId` (unique)
  - `server.language` (composite with `episodeId`)
  - `episode.animeId`
  - pivot `anime_category(animeId, categoryId)`
- Project flat DTOs (`AnimeCardDto`) — never return heavy nested entities for list view.

## Files expected
- `animes.module.ts`, `animes.controller.ts`
- `services/anime-catalog.service.ts` (the QueryBuilder)
- `services/anime-detail.service.ts`
- `entities/anime.entity.ts`
- `dto/catalog-query.dto.ts`, `dto/anime-card.dto.ts`, `dto/anime-detail.dto.ts`
- Tests for QueryBuilder with seeded data (test filter combinations)
