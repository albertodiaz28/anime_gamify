# Plan: MVP Anime Gamify (Angular + NestJS)

## Context

Construir un MVP de una página web de anime con sistema de gamificación. Los usuarios podrán registrarse, explorar animes scrapeados desde AnimeFLV, buscarlos/filtrarlos por múltiples criterios, puntuarlos, comentarlos y subir de nivel desbloqueando recompensas en función de los capítulos que vean. El scraping es **one-shot** (se ejecuta una sola vez para poblar la BD, dado que es un MVP). Stack: Angular (frontend), NestJS (backend), PostgreSQL + TypeORM, JWT auth. Monorepo. El diseño visual se delegará a la skill `ui-ux-pro-max`.

---

## 1. Inicialización (acción manual previa)

El directorio actual está vacío. Antes de implementar, el usuario debe ejecutar:

```bash
# 1. Instalar skill de diseño
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max

# 2. Crear monorepo Nx
npx create-nx-workspace@latest anime-gamify --preset=apps --packageManager=npm
cd anime-gamify

# 3. Añadir apps
npx nx add @nx/angular
npx nx add @nx/nest
npx nx g @nx/angular:app frontend --routing --style=scss --standalone
npx nx g @nx/nest:app backend

# 4. Init git
git init && git add . && git commit -m "chore: initial scaffold"
gh repo create anime-gamify --private --source=. --push
```

Confirmar al usuario si quiere que estos comandos se ejecuten en la fase de implementación.

---

## 2. Estructura del Monorepo

```
anime-gamify/
├── apps/
│   ├── frontend/                 # Angular standalone
│   └── backend/                  # NestJS
├── libs/
│   ├── shared-types/             # Interfaces compartidas (Anime, User, etc.)
│   └── shared-constants/         # Niveles, XP por capítulo, etc.
├── rules.md                      # Reglas para agentes (ver §7)
├── README.md
└── nx.json
```

---

## 3. Backend (NestJS) — Módulos

Cada módulo encapsula controller + service + repository + DTOs + entity, siguiendo Clean Architecture ligera.

### 3.1 `auth/`
- `POST /auth/register` — email, password (bcrypt), username.
- `POST /auth/login` — devuelve JWT.
- Guard `JwtAuthGuard` global con `@Public()` para rutas abiertas.
- Passport + `@nestjs/jwt`.

### 3.2 `users/`
- Entity: `id, email, passwordHash, username, level, xp, unlockedSkills[], avatarConfig (jsonb), createdAt`.
- `GET /users/me`, `PATCH /users/me/avatar`.

### 3.3 `categories/`
- Entity: `id, slug, name`.
- Seed inicial (acción, romance, shounen, seinen, etc.).
- `GET /categories`.

### 3.4 `animes/`
- Entity `Anime`: `id, externalId, title, description, coverUrl, totalEpisodes, seasons, status`.
- Relación `ManyToMany` con `Category`.
- Relación `OneToMany` con `Episode`.
- `GET /animes` con query params: `q, categoryId, minEpisodes, maxEpisodes, language, season, sort, cursor, limit`.
- `GET /animes/:id` (incluye episodios + servidores).

**Implementación del listado (performance crítico):**
- Usar **TypeORM `QueryBuilder` desde el inicio**, NO `repository.find()`. Esto evita el N+1 implícito de las relaciones y permite controlar joins, índices y proyección.
- Filtros aplicados como `andWhere` condicional; `language` requiere `INNER JOIN episodes → servers`; `categoryId` join sobre la tabla pivot.
- **Paginación por cursor** (no offset), basada en `(score DESC, id DESC)` o `(title ASC, id ASC)` según `sort`. Offset se degrada con N grande.
- Índices DB: `anime.title (gin trigram)`, `anime.totalEpisodes`, `server.language`, `episode.animeId`, pivot `anime_category(animeId, categoryId)`.
- Búsqueda textual: `ILIKE` sobre `title` + extensión `pg_trgm` para fuzzy.
- DTOs de salida planos (sin entidades anidadas pesadas) — proyectar solo campos necesarios para card.

### 3.5 `episodes/`
- Entity `Episode`: `id, animeId, number, title`.
- Entity `Server`: `id, episodeId, name, embedUrl, language` (`ES`, `LAT`, `JP-SUB`, etc.).

### 3.6 `scraping/` (CLI command, NO cron)
- `nx run backend:scrape` — comando único (`nest-commander`).
- **Stack obligatorio: `puppeteer-extra` + `puppeteer-extra-plugin-stealth`**. AnimeFLV está detrás de Cloudflare; axios+cheerio devolverá 403 en la mayoría de las peticiones. Stealth parchea las huellas que Cloudflare comprueba (webdriver flag, plugins, languages, WebGL, etc.).
- Configuración Puppeteer:
  - `headless: 'new'`, `args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']`.
  - User-Agent realista rotatorio.
  - Esperar a `networkidle2` antes de extraer; si aparece el challenge de Cloudflare, esperar selector real con timeout amplio (30–45s).
  - Reutilizar **una sola página** entre requests (cookies persistentes) — el primer challenge resuelto sirve para los siguientes.
- Cheerio se usa **solo** sobre el `page.content()` ya renderizado, para parsing rápido en memoria (no para descargar).
- Pipeline: lista de animes (paginada) → detalle → episodios → servidores.
- Idempotente: upsert por `externalId`.
- Backoff exponencial + delay aleatorio 1.5–3s entre páginas. Reintentos con jitter.
- Fallback documentado: si AnimeFLV bloquea persistentemente, alternativa es **Jikan API** (MyAnimeList no oficial) para metadatos + AnimeFLV solo para servidores — registrar esta decisión si ocurre.

### 3.7 `ratings/`
- Entity: `userId, animeId, score (1-10)` (unique compuesto).
- `POST /animes/:id/rating`, `GET /animes/:id/rating/aggregate`.

### 3.8 `comments/`
- Entity: `id, userId, animeId, body, createdAt, parentId (nullable para threads)`.
- `POST /animes/:id/comments`, `GET /animes/:id/comments?page=`.
- Validación longitud + sanitización (xss-clean).

### 3.9 `gamification/`
- Entity `WatchedEpisode`: `userId, episodeId, watchedAt` (unique compuesto → evita farm).
- `POST /episodes/:id/watch` — registra y suma XP.
- Service `LevelService`:
  - Tabla de XP por nivel (constante en `libs/shared-constants`).
  - `addXp(userId, amount)` → recalcula nivel, emite evento.
- Entity `Skill`: `id, name, requiredLevel, type (cosmetic|feature), payload (jsonb)`.
- Evento `UserLeveledUp` → desbloquea skills automáticamente.
- `GET /users/me/skills`, `GET /skills` (catálogo).

### 3.10 Cross-cutting
- `ValidationPipe` global (class-validator).
- `helmet`, `cors`, rate-limit (`@nestjs/throttler`).
- Swagger en `/api/docs`.
- Config con `@nestjs/config` + `.env` (NUNCA commitear).
- Migrations TypeORM (no `synchronize: true` en prod).

---

## 4. Frontend (Angular standalone)

### 4.1 Estructura
```
apps/frontend/src/app/
├── core/                # interceptors, guards, services singleton (auth, http)
├── shared/              # componentes UI reutilizables (delegados a ui-ux-pro-max)
├── features/
│   ├── auth/            # login, register pages
│   ├── catalog/         # listado + filtros + búsqueda
│   ├── anime-detail/    # detalle + episodios + ratings + comments
│   ├── profile/         # perfil, nivel, skills, avatar
│   └── player/          # selector servidor/idioma + iframe
└── app.routes.ts
```

### 4.2 Decisiones
- **Standalone components** (no NgModules).
- **Signals** para estado local; `@ngrx/signals` o servicios con `signal()` para estado global ligero.
- `HttpInterceptor` para JWT.
- `AuthGuard` para rutas protegidas.
- **Lazy loading** por feature (`loadComponent` / `loadChildren`).
- Formularios reactivos.
- Filtros del catálogo sincronizados con query params.
- TailwindCSS o Angular Material — **decisión final delegada a `ui-ux-pro-max`**.

### 4.3 Gamificación visual
- Componente `LevelBadge` + `XpBar` (usados en navbar y profile).
- Modal de "subida de nivel" al detectar evento.
- Vista de skills con bloqueadas/desbloqueadas.
- Avatar configurable (composición de capas SVG basadas en `unlockedSkills`).

---

## 5. Diseño UI/UX

**Delegado íntegramente a la skill `ui-ux-pro-max`**. Tras instalar la skill, invocar:

```
/ui-ux-pro-max diseña el sistema visual del MVP (paleta, tipografía, componentes base,
layout del catálogo, detalle de anime, player con servidores/idiomas, perfil gamificado).
```

Inputs que recibirá: lista de páginas (auth, catalog, detail, profile, player) y temas (anime, gamificación, oscuro por defecto).

---

## 6. Modelo de datos (resumen)

```
User (1)──(N) Rating (N)──(1) Anime
User (1)──(N) Comment (N)──(1) Anime
User (1)──(N) WatchedEpisode (N)──(1) Episode
User (N)──(N) Skill (vía UserSkill)
Anime (N)──(N) Category
Anime (1)──(N) Episode (1)──(N) Server
```

---

## 7. `rules.md` (raíz del monorepo)

Contenido a generar (que se inyectará en los prompts de cada agente):

```markdown
# Project Rules — Anime Gamify

All agents working on this codebase MUST follow these rules:

## Architecture
- Modularize aggressively. One responsibility per file/class/function.
- Backend: feature-based modules (NestJS). Each module owns its controller, service,
  repository, DTOs and entity. No cross-module imports except via public `index.ts`.
- Frontend: feature folders with standalone components, lazy-loaded routes.
- Shared code lives in `libs/shared-*`. Never duplicate types between frontend/backend.

## Clean Code
- Descriptive names. No abbreviations except well-known ones (id, url, db).
- Functions ≤ 30 lines. Files ≤ 300 lines. Otherwise split.
- Single Responsibility Principle. Dependency Injection everywhere.
- Pure functions when possible. Side effects isolated in services.
- No magic numbers/strings: extract to `shared-constants`.

## Scalability
- Stateless services. No global mutable state.
- Pagination on all list endpoints. Indexed DB columns for filters.
- Async/await + proper error boundaries. Never swallow errors.
- Domain events for cross-module side effects (e.g. `UserLeveledUp`).

## Comments
- Write the MINIMUM comments possible.
- Only comment complex logic where the WHY is not obvious from the code.
- All comments MUST be in ENGLISH.
- No comments explaining WHAT the code does — naming should suffice.
- No TODO/FIXME left in committed code without a tracked issue.

## Style
- Backend: ESLint + Prettier (NestJS defaults). Strict TypeScript.
- Frontend: Angular ESLint + Prettier. Strict mode. No `any`.
- Conventional Commits.

## Security
- Never log secrets or PII.
- Validate every DTO with class-validator.
- Hash passwords with bcrypt (rounds ≥ 10).
- JWT in httpOnly cookies preferred (or Authorization header with short TTL).
```

---

## 8. Roadmap de implementación (orden sugerido)

1. Init monorepo + apps + `rules.md`.
2. Backend: módulos `auth` + `users` + migrations + tests.
3. Backend: entidades `Anime/Episode/Server/Category` + endpoints CRUD-read.
4. Backend: scraper command (one-shot) y ejecución inicial → poblar DB.
5. Backend: `ratings`, `comments`.
6. Backend: `gamification` (watched, xp, skills) + eventos.
7. Frontend: scaffold + auth + interceptor + guard.
8. Frontend: catálogo con búsqueda y filtros.
9. Frontend: detalle anime + player + servidores/idiomas.
10. Frontend: ratings + comentarios.
11. Frontend: profile + nivel + skills + avatar.
12. **Invocar `ui-ux-pro-max`** y aplicar sistema de diseño.
13. README + scripts npm + documentación de despliegue.

---

## 9. Critical files (a crear)

- `rules.md` (raíz)
- `apps/backend/src/modules/{auth,users,animes,episodes,categories,ratings,comments,gamification,scraping}/`
- `apps/backend/src/main.ts`, `apps/backend/src/scrape.command.ts`
- `apps/frontend/src/app/{core,shared,features}/`
- `libs/shared-types/src/index.ts`, `libs/shared-constants/src/levels.ts`
- `.env.example`, `docker-compose.yml` (Postgres local)

---

## 10. Verificación end-to-end

1. `docker compose up -d` (Postgres) → `nx run backend:migration:run`.
2. `nx run backend:scrape` → confirmar N animes en DB (`SELECT COUNT(*) FROM anime`).
3. `nx serve backend` + `nx serve frontend`.
4. Registro → login → JWT presente en peticiones.
5. Catálogo: búsqueda por título, filtros por categoría / nº capítulos / idioma / temporada.
6. Detalle: ratear, comentar, ver embed de servidor en cada idioma.
7. "Marcar episodio visto" → XP sube → al cruzar umbral, modal de level-up y skill desbloqueada.
8. Tests: `nx test backend` y `nx test frontend` en verde.
9. Swagger en `http://localhost:3000/api/docs` operativo.
