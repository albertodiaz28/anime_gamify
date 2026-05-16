# Module: ratings

## Entity
- `Rating (userId, animeId, score 1-10)` — unique composite

## Endpoints
- `POST /animes/:id/rating` — upsert
- `GET /animes/:id/rating/aggregate` — `{ avg, count }`

## Notes
- Maintain a denormalized `anime.avgRating` updated via DB trigger or domain event.
