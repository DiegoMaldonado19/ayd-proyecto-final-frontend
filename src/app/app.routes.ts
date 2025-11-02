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
				path: 'subscriptions',
				loadComponent: () => import('./subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
			},
			{
				path: 'reports',
				loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
			},
			{
				path: 'admin',
				loadComponent: () => import('./admin/admin.layout').then(m => m.AdminLayout),
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
			},
      {
        path: 'branches',
        loadComponent: () => import('./branches/branches.layout').then(m => m.BranchesLayout),
        loadChildren: () => import('./branches/branches.routes').then(m => m.BRANCHES_ROUTES)
      },
      {
        path: 'backoffice',
        loadComponent: () => import('./backoffice/backoffice.layout').then(m => m.BackOfficeLayout),
        loadChildren: () => import('./backoffice/backoffice.routes').then(m => m.BACKOFFICE_ROUTES)
      },
      {
        path: 'client',
        loadComponent: () => import('./client/client.layout').then(m => m.ClientLayout),
        loadChildren: () => import('./client/client.routes').then(m => m.CLIENT_ROUTES)
      },
      {
        path: 'company',
        loadComponent: () => import('./company/company.layout').then(m => m.CompanyLayout),
        loadChildren: () => import('./company/company.routes').then(m => m.COMPANY_ROUTES)
      },
      {
        path: 'commerce',
        loadComponent: () => import('./commerce/commerce.layout').then(m => m.CommerceLayout),
        loadChildren: () => import('./commerce/commerce.routes').then(m => m.COMMERCE_ROUTES)
      }
		]
	},
	{ path: '**', redirectTo: 'dashboard' }
];
