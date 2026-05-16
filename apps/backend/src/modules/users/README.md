# Module: users

Owns the `User` entity. Consumed by `auth`, `gamification`, `ratings`, `comments`.

## Endpoints
- `GET /users/me` — current user profile
- `PATCH /users/me/avatar` — update avatar config (must use only unlocked skills)

## Files expected
- `users.module.ts`, `users.controller.ts`, `users.service.ts`
- `entities/user.entity.ts`
- `dto/update-avatar.dto.ts`
- `index.ts`
- Tests
