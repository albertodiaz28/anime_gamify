import { Routes } from '@angular/router';
import { animeDetailResolver } from './anime-detail.resolver';

export const animeDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./anime-detail.component').then((m) => m.AnimeDetailComponent),
    resolve: { anime: animeDetailResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];
