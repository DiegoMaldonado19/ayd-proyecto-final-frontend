import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export interface TopNavProps {
  items: { label: string; link: string }[];
  role: 'ADMIN' | 'BRANCH_OPERATOR' | 'BACK_OFFICE' | 'CLIENT' | 'COMPANY' | 'COMMERCE';
}

@Component({
  standalone: true,
  selector: 'app-topnav',
  imports: [RouterLink],
  template: `
    <nav class="w-full flex items-center justify-between gap-4">
      <h1><span class="font-extrabold">ParkControl</span> - {{ roleLabel }}</h1>
      <ul class="flex items-center gap-6">
        @for (item of items(); track $index) {
        <li class="font-medium text-slate-700 transition-colors">
          <a
            [routerLink]="item.link"
            class="relative hover:bg-gradient-to-r  hover:text-transparent hover:bg-clip-text px-3 py-2 rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:bg-slate-200"
            [class]="roleColorClassMap[this.role() || ''] || ''"
            >{{ item.label }}</a
          >
        </li>
        }
      </ul>
      <div class="font-light text-sm text-slate-600 flex flex-col items-end">
        <span> Sesión iniciada como: </span>
        <span class="font-medium">
          {{ authService.currentUser()?.full_name }}
        </span>
      </div>
    </nav>
  `,
})
export class TopNavComponent {
  readonly items = input<{ label: string; link: string }[]>();
  readonly role = input<
    'ADMIN' | 'BRANCH_OPERATOR' | 'BACK_OFFICE' | 'CLIENT' | 'COMPANY' | 'COMMERCE'
  >();

  readonly authService = inject(AuthService);

  roleLabelMap: Record<string, string> = {
    ADMIN: 'Administrador',
    BRANCH_OPERATOR: 'Operador de Sucursal',
    BACK_OFFICE: 'Back Office',
    CLIENT: 'Cliente',
    COMPANY: 'Empresa',
    COMMERCE: 'Comercio',
  };

  roleColorClassMap: Record<string, string> = {
    ADMIN: 'hover:from-red-800 hover:to-red-400',
    BRANCH_OPERATOR: 'hover:from-green-800 hover:to-green-400',
    BACK_OFFICE: 'hover:from-yellow-800 hover:to-yellow-400',
    CLIENT: 'hover:from-blue-800 hover:to-blue-400',
    COMPANY: 'hover:from-purple-800 hover:to-purple-400',
    COMMERCE: 'hover:from-pink-800 hover:to-pink-400',
  }

  get roleLabel(): string {
    const roleKey = this.role() ?? '';
    return this.roleLabelMap[roleKey] || 'Desconocido';
  }
}
