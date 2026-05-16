import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile-placeholder.component').then((m) => m.ProfilePlaceholderComponent),
  },
];
