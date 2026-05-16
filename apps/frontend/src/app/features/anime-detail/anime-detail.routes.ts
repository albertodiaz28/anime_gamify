import { Routes } from '@angular/router';

export const animeDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./anime-detail-placeholder.component').then(
        (m) => m.AnimeDetailPlaceholderComponent,
      ),
  },
];
