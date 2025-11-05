import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../partials/navigation/topnav.component';

@Component({
  standalone: true,
  selector: 'app-backoffice-layout',
  imports: [RouterOutlet, TopNavComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="sticky top-0 z-40 bg-white/65 backdrop-blur-sm border-b">
        <div class="mx-auto max-w-7xl px-4 h-16 flex flex-col justify-center">
          <app-topnav
            role="BACK_OFFICE"
            [items]="[
              { label: 'Dashboard', link: '/backoffice/dashboard' },
              { label: 'Cambios de Placa', link: '/backoffice/plate-changes' },
              { label: 'Permisos Temporales', link: '/backoffice/temporal-permits' },
              { label: 'Perfil', link: '/backoffice/profile' }
            ]"
          ></app-topnav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-2">
        <router-outlet />
      </main>

      <!-- <app-confirm-dialog /> -->
    </div>
  `,
})
export class BackOfficeLayout {}

