import { Routes } from '@angular/router';

export const COMMERCE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./commerce.component').then((m) => m.CommerceDashboardComponent),
  },
];
