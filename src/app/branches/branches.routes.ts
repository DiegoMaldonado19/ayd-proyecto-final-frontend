import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./branches.component').then((m) => m.BranchesDashboardComponent),
  },
  {
    path: 'tickets',
    loadComponent: () => import('./ticket-list.component').then((m) => m.TicketListComponent),
  },
  {
    path: 'tickets/entry',
    loadComponent: () => import('./ticket-entry.component').then((m) => m.TicketEntryComponent),
  },
  {
    path: 'tickets/exit',
    loadComponent: () => import('./ticket-exit.component').then((m) => m.TicketExitComponent),
  },
  {
    path: 'tickets/exits',
    loadComponent: () => import('./ticket-exits-history.component').then((m) => m.TicketExitsHistoryComponent),
  },
];
