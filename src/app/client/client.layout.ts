import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../partials/navigation/topnav.component';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [RouterOutlet, TopNavComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="sticky top-0 z-40 bg-white/65 backdrop-blur-sm border-b">
        <div class="mx-auto max-w-6xl px-4 h-16 flex flex-col justify-center">
          <app-topnav
            role="CLIENT"
            [items]="[
              { label: '📊 Dashboard', link: '/client/dashboard' },
              { label: '👤 Perfil', link: '/client/profile' }
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
export class ClientLayout {}
