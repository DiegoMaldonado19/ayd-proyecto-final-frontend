  import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../partials/navigation/topnav.component';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [RouterOutlet, TopNavComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="sticky top-0 z-40 bg-white/65 backdrop-blur-sm border-b">
        <div class="mx-auto max-w-7xl px-4 h-16 flex flex-col justify-center">
          <app-topnav
            role="ADMIN"
            [items]="[
              { label: '📊 Dashboard', link: '/admin/dashboard' },
              { label: '📈 Reportes', link: '/admin/reports' },
              { label: '👥 Usuarios', link: '/admin/users' },
              { label: '🏪 Comercios', link: '/admin/commerces' },
              { label: '💳 Suscripción', link: '/admin/plans' },
              { label: '💰 Tarifas', link: '/admin/rates' },
              { label: '🚗 Flotillas', link: '/admin/fleets' },
              { label: '📝 Bitácora', link: '/admin/discount-audit' }
            ]"
          ></app-topnav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-2">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayout {}
