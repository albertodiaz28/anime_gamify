# Anime Gamify

MVP de plataforma de anime con scraping de AnimeFLV y sistema de gamificación.

## Stack
- **Frontend:** Angular (standalone, signals)
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Monorepo:** Nx
- **Auth:** JWT
- **Diseño:** delegado a la skill `ui-ux-pro-max`

## Documentación clave
- [PLAN.md](PLAN.md) / [PLAN.html](PLAN.html) — plan completo del MVP
- [TASKS.html](TASKS.html) — checklist detallada para ejecutar en orden
- [rules.md](rules.md) — reglas obligatorias para cualquier agente que toque el código

## Setup local

> **Importante:** este proyecto usa **pnpm**. No uses `npm`/`yarn`.
> Si no lo tienes: `corepack enable && corepack prepare pnpm@latest --activate`.

```bash
# 1. Skill UI (una sola vez)
pnpm dlx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max

# 2. Dependencias
pnpm install

# 3. Base de datos
cp .env.example .env
pnpm db:up
pnpm migration:run

# 4. Scraping inicial (one-shot)
pnpm scrape

# 5. Arrancar apps
pnpm start:backend     # http://localhost:3000
pnpm start:frontend    # http://localhost:4200
```

## Estructura
```
apps/
  backend/   NestJS
  frontend/  Angular
libs/
  shared-types/      tipos comunes
  shared-constants/  niveles, XP, skills
```

## Workflow con agentes
1. Cada agente lee `rules.md` antes de empezar.
2. Cada agente toma una sección de `TASKS.html` (por módulo).
3. Los módulos backend están aislados — pueden trabajarse en paralelo.
4. El frontend depende de la API; las features pueden mockear contratos desde `libs/shared-types`.
