# Frontend — Angular standalone

## Structure
```
core/        singletons (auth, http, interceptors, guards)
shared/      reusable UI components (delegated to ui-ux-pro-max)
layouts/     shell layout (navbar + outlet)
features/
  auth/         login + register
  catalog/      list + filters + search
  anime-detail/ detail + ratings + comments
  player/       server/language selector + iframe
  profile/      stats + skills + avatar editor
```

## Rules
- Standalone components only — no NgModules.
- Signals for state. Use `signal()` services or `@ngrx/signals` for global state.
- Lazy load every feature route (`loadChildren` / `loadComponent`).
- Strict TypeScript, no `any`.
- Filters in the catalog are synced with query params.
- Tailwind vs Material → final decision by `ui-ux-pro-max`.
