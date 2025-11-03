import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../partials/navigation/topnav.component';

@Component({
  standalone: true,
  selector: 'app-branches-layout',
  imports: [RouterOutlet, TopNavComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div class="mx-auto max-w-6xl px-4 h-16 flex flex-col justify-center">
          <app-topnav
            role="BRANCH_OPERATOR"
            [items]="[
              { label: 'Dashboard', link: '/branches/dashboard' },
              { label: 'Perfil', link: '/branches/profile' }
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
export class BranchesLayout {}
