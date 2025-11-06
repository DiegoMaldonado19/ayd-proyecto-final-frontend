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
  },
  {
    path: 'temporal-permits',
    loadComponent: () => import('./temporal-permits.page').then((m) => m.TemporalPermitsBackofficePage),
  },
  {
    path: 'temporal-permits/new',
    loadComponent: () => import('./temporal-permit-create.page').then((m) => m.TemporalPermitCreatePage),
  },
  {
    path: 'temporal-permits/:id',
    loadComponent: () => import('./temporal-permit-detail.page').then((m) => m.TemporalPermitDetailPage),
  },
  {
    path: 'temporal-permits/:id/edit',
    loadComponent: () => import('./temporal-permit-edit.page').then((m) => m.TemporalPermitEditPage),
  }
];
