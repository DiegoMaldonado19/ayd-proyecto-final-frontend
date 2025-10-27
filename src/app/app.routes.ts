import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{
		path: 'login',
		loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'ui-guide',
		loadComponent: () => import('./ui-guide/ui-guide.component').then(m => m.UiGuideComponent)
	},
	{
		path: '',
		canActivate: [authGuard],
		children: [
			{
				path: 'dashboard',
				loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			{
				path: 'tickets',
				loadComponent: () => import('./tickets/tickets.component').then(m => m.TicketsComponent)
			},
			{
				path: 'branches',
				loadComponent: () => import('./branches/branches.component').then(m => m.BranchesComponent)
			},
			{
				path: 'subscriptions',
				loadComponent: () => import('./subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
			},
			{
				path: 'commerce',
				loadComponent: () => import('./commerce/commerce.component').then(m => m.CommerceComponent)
			},
			{
				path: 'reports',
				loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
			},
			{
				path: 'admin',
				loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
			}
		]
	},
	{ path: '**', redirectTo: 'dashboard' }
];
