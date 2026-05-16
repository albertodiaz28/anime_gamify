# shared-types

Domain types shared between backend and frontend. NEVER duplicate these types.

## Exports
- Entities: `User`, `Anime`, `Episode`, `Server`, `Category`, `Rating`, `Comment`, `Skill`, `WatchedEpisode`
- Enums: `Language`, `AnimeStatus`, `SkillType`
- DTOs: `PaginatedResponse<T>`, `CursorPage<T>`, `AuthTokens`, `JwtPayload`, `AnimeCardDto`, etc.
