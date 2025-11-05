import { Routes } from '@angular/router';

export const BACKOFFICE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./backoffice.component').then((m) => m.BackofficeDashboardComponent),
  },
  {
    path: 'plate-changes',
    loadComponent: () => import('./plate-changes.page').then((m) => m.PlateChangesBackofficePage),
  },
  {
    path: 'plate-changes/:id',
    loadComponent: () => import('./plate-change-detail.page').then((m) => m.PlateChangeDetailPage),
  }
];
