import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./client.component').then((m) => m.ClientDashboardComponent),
  },
];
