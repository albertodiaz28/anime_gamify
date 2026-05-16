# Module: comments

## Entity
- `Comment (id, userId, animeId, body, parentId nullable, createdAt)`

## Endpoints
- `POST /animes/:id/comments`
- `GET /animes/:id/comments?cursor=` — paginated
- `DELETE /comments/:id` — author only

## Rules
- Sanitize `body` (XSS), max 1000 chars
- Threaded via `parentId` (single level for MVP)
