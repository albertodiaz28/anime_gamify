# Project Rules — Anime Gamify

All agents working on this codebase MUST follow these rules. Include this file in every
agent prompt.

## Architecture
- IMPORTANT, use pnpm to install packages
- Modularize aggressively. One responsibility per file/class/function.
- Backend: feature-based modules (NestJS). Each module owns its controller, service,
  repository, DTOs and entity. No cross-module imports except via the module's public
  `index.ts` barrel.
- Frontend: feature folders with standalone Angular components, lazy-loaded routes.
- Shared code lives in `libs/shared-*`. Never duplicate types between frontend and
  backend — define them once in `libs/shared-types` and import.

## Clean Code
- Descriptive names. No abbreviations except well-known ones (`id`, `url`, `db`).
- Functions ≤ 30 lines. Files ≤ 300 lines. Otherwise split.
- Single Responsibility Principle. Dependency Injection everywhere.
- Pure functions when possible. Side effects isolated in services.
- No magic numbers/strings: extract to `libs/shared-constants`.

## Scalability
- Stateless services. No global mutable state.
- Pagination on all list endpoints — use **cursor pagination**, not offset.
- Use TypeORM `QueryBuilder` for any query with filters/joins; avoid `repository.find()`
  with relations for list endpoints.
- Indexed DB columns for every filterable field.
- Async/await with proper error boundaries. Never swallow errors silently.
- Domain events (`@nestjs/event-emitter`) for cross-module side effects
  (e.g. `UserLeveledUp`).

## Comments
- Write the **MINIMUM** comments possible.
- Only comment complex logic where the WHY is not obvious from the code.
- All comments MUST be in **ENGLISH**.
- No comments explaining WHAT the code does — naming should suffice.
- No TODO/FIXME left in committed code without a tracked issue.

## Style
- Backend: ESLint + Prettier (NestJS defaults). Strict TypeScript (`strict: true`).
- Frontend: Angular ESLint + Prettier. Strict mode. No `any`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).

## Security
- Never log secrets or PII.
- Validate every DTO with `class-validator`.
- Hash passwords with bcrypt (rounds ≥ 10).
- JWT in httpOnly cookies preferred; otherwise Authorization header with short TTL.
- `helmet`, `cors` whitelist, `@nestjs/throttler` rate limit on auth endpoints.

## Testing
- Unit tests for every service method with non-trivial logic.
- e2e tests for every controller endpoint (happy + error path).
- Test files colocated: `*.service.spec.ts` next to `*.service.ts`.
