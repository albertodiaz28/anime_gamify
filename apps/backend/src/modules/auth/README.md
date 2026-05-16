# Module: auth

JWT auth (email + password). Passport + bcrypt.

## Endpoints
- `POST /auth/register` — register a new user
- `POST /auth/login` — return JWT

## Files expected
- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `strategies/jwt.strategy.ts`
- `guards/jwt-auth.guard.ts` (registered globally in `app.module.ts`)
- `dto/register.dto.ts`, `dto/login.dto.ts`
- `decorators/public.decorator.ts`, `decorators/current-user.decorator.ts`
- `index.ts` (barrel)
- Tests: `auth.service.spec.ts`, `auth.e2e-spec.ts`

## Depends on
- `users` module (for `findByEmail` and `create`)
- `shared-types` (`AuthTokens`, `JwtPayload`)
