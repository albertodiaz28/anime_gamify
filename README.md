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
```bash
# 1. Skill UI (una sola vez)
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max

# 2. Inicializar monorepo Nx (si aún no se ha hecho)
#    Ver sección 1 de PLAN.md

# 3. Dependencias
npm install

# 4. Base de datos
cp .env.example .env
npm run db:up
npm run migration:run

# 5. Scraping inicial (one-shot)
npm run scrape

# 6. Arrancar apps
npm run start:backend     # http://localhost:3000
npm run start:frontend    # http://localhost:4200
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
