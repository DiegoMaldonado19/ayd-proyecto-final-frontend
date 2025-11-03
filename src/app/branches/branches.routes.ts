import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./branches.component').then((m) => m.BranchesDashboardComponent),
  },
];
