# Module: gamification

XP / level / skills. Driven by `WatchedEpisode` events.

## Entities
- `WatchedEpisode (userId, episodeId, watchedAt)` — unique `(userId, episodeId)` to prevent farming
- `Skill (id, name, requiredLevel, type: 'cosmetic' | 'feature', payload jsonb)`
- `UserSkill (userId, skillId, unlockedAt)`

## Endpoints
- `POST /episodes/:id/watch` — idempotent; adds XP only if newly recorded
- `GET /users/me/skills` — unlocked + locked (preview)
- `GET /users/me/progress` — `{ xp, level, nextLevelXp, episodesWatched }`
- `GET /skills` — full catalog

## Logic
- `LevelService.addXp(userId, xp)` runs in a transaction
- On crossing a level threshold → emit `UserLeveledUp` event
- Listener auto-unlocks every skill where `requiredLevel <= newLevel`
- XP table & helpers live in `libs/shared-constants`

## Files expected
- `gamification.module.ts`
- `services/level.service.ts`
- `services/watch.service.ts`
- `listeners/unlock-skills.listener.ts`
- `entities/watched-episode.entity.ts`, `skill.entity.ts`, `user-skill.entity.ts`
- `events/user-leveled-up.event.ts`
- `database/seeds/skills.seed.ts`
- Tests for: level-up transitions, watch idempotency, auto-unlock
