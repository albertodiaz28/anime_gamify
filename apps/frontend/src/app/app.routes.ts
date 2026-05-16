import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout.component').then((m) => m.MainLayoutComponent),
    canMatch: [authGuard],
    children: [
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.catalogRoutes),
      },
      {
        path: 'anime/:id',
        loadChildren: () =>
          import('./features/anime-detail/anime-detail.routes').then(
            (m) => m.animeDetailRoutes,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then((m) => m.profileRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'catalog' },
];
