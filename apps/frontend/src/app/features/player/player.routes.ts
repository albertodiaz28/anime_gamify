import { Routes } from '@angular/router';

export const playerRoutes: Routes = [
  {
    path: ':episodeId',
    loadComponent: () =>
      import('./player-page.component').then((m) => m.PlayerPageComponent),
  },
];
