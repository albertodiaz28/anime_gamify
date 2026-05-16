# Module: episodes

Owns `Episode` and `Server` entities.

## Endpoints
- `GET /animes/:id/episodes` — episode list (paginated)
- `GET /episodes/:id/servers` — servers grouped by language

## Entities
- `Episode (id, animeId, number, title)` — unique `(animeId, number)`
- `Server (id, episodeId, name, embedUrl, language)` — index `(episodeId, language)`

## Notes
- `language` is an enum from `shared-types` (`ES`, `LAT`, `JP_SUB`, `EN_SUB`, ...)
