import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./users-management.component').then((m) => m.UsersManagementComponent),
  },
  {
    path: 'commerces',
    loadComponent: () => import('./commerces-management.component').then((m) => m.CommercesManagementComponent),
  },
  {
    path: 'plans',
    loadComponent: () => import('./subscription-plans.component').then((m) => m.SubscriptionPlansComponent),
  },
];
