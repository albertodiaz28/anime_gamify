import { Routes } from '@angular/router';

export const catalogRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalog-placeholder.component').then((m) => m.CatalogPlaceholderComponent),
  },
];
