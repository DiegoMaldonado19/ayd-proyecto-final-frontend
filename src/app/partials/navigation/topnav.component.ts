import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

export interface TopNavProps {
  items: { label: string; link: string }[];
  role: 'ADMIN' | 'BRANCH_OPERATOR' | 'BACK_OFFICE' | 'CLIENT' | 'COMPANY' | 'COMMERCE';
}

@Component({
  standalone: true,
  selector: 'app-topnav',
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="w-full flex items-center justify-between gap-4">
      <!-- Logo y Rol -->
      <div class="flex items-center gap-3">
        <h1 class="text-lg md:text-xl">
          <span class="font-extrabold">ParkControl</span> 
          <span class="hidden md:inline"> - {{ roleLabel }}</span>
        </h1>
      </div>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex items-center gap-6">
        @for (item of items(); track $index) {
        <li class="font-medium text-slate-700 transition-colors">
          <a
            [routerLink]="item.link"
            class="relative hover:bg-gradient-to-r hover:text-transparent hover:bg-clip-text px-3 py-2 rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:bg-slate-200"
            [class]="roleColorClassMap[this.role() || ''] || ''"
            >{{ item.label }}</a
          >
        </li>
        }
      </ul>

      <!-- User Dropdown + Mobile Menu -->
      <div class="flex items-center gap-3">
        <!-- User Dropdown (Desktop) -->
        <div class="hidden md:block relative">
          <button
            (click)="toggleUserDropdown()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {{ getUserInitials() }}
            </div>
            <div class="text-left hidden lg:block">
              <div class="text-sm font-medium text-slate-700">
                {{ authService.currentUser()?.full_name }}
              </div>
              <div class="text-xs text-slate-500">{{ roleLabel }}</div>
            </div>
            <svg class="w-4 h-4 text-slate-500 transition-transform" [class.rotate-180]="userDropdownOpen()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          @if (userDropdownOpen()) {
          <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
            <div class="px-4 py-2 border-b border-slate-200">
              <p class="text-sm font-medium text-slate-700">{{ authService.currentUser()?.full_name }}</p>
              <p class="text-xs text-slate-500">{{ authService.currentUser()?.email }}</p>
            </div>
            
            <button 
              (click)="goToProfile()"
              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ver Perfil
            </button>
            
            <button 
              (click)="changePassword()"
              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Cambiar Contraseña
            </button>

            <div class="border-t border-slate-200 my-1"></div>
            
            <button 
              (click)="logout()"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
          }
        </div>

        <!-- Mobile Menu Button -->
        <button
          (click)="toggleMobileMenu()"
          class="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg class="w-6 h-6 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="mobileMenuOpen() ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    @if (mobileMenuOpen()) {
    <div class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" (click)="toggleMobileMenu()"></div>
    
    <!-- Mobile Menu Sidebar -->
    <div class="md:hidden fixed right-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto">
      <div class="p-4 border-b border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-lg">Menú</h2>
          <button (click)="toggleMobileMenu()" class="p-1 hover:bg-slate-100 rounded">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {{ getUserInitials() }}
          </div>
          <div>
            <p class="text-sm font-medium text-slate-700">{{ authService.currentUser()?.full_name }}</p>
            <p class="text-xs text-slate-500">{{ roleLabel }}</p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <ul class="space-y-2">
          @for (item of items(); track $index) {
          <li>
            <a
              [routerLink]="item.link"
              (click)="toggleMobileMenu()"
              class="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              {{ item.label }}
            </a>
          </li>
          }
        </ul>

        <div class="mt-6 pt-6 border-t border-slate-200 space-y-2">
          <button 
            (click)="goToProfile(); toggleMobileMenu()"
            class="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ver Perfil
          </button>
          
          <button 
            (click)="changePassword(); toggleMobileMenu()"
            class="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </button>

          <button 
            (click)="logout()"
            class="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
    }
  `,
})
export class TopNavComponent {
  readonly items = input<{ label: string; link: string }[]>();
  readonly role = input<
    'ADMIN' | 'BRANCH_OPERATOR' | 'BACK_OFFICE' | 'CLIENT' | 'COMPANY' | 'COMMERCE'
  >();

  readonly authService = inject(AuthService);
  private router = inject(Router);

  // Estado de los menús
  userDropdownOpen = signal(false);
  mobileMenuOpen = signal(false);

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

  getUserInitials(): string {
    const fullName = this.authService.currentUser()?.full_name || 'Usuario';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  toggleUserDropdown() {
    this.userDropdownOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  goToProfile() {
    this.userDropdownOpen.set(false);
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.userDropdownOpen.set(false);
    this.router.navigate(['/change-password']);
  }

  logout() {
    this.userDropdownOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
