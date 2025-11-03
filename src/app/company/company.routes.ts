import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./company.component').then((m) => m.CompanyDashboardComponent),
  },
];
