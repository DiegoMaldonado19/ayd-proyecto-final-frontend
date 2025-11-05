import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Manage2FAComponent } from '../auth/manage-2fa.component';

/**
 * Componente de perfil de usuario
 * Muestra información del usuario y opciones de seguridad
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, Manage2FAComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center gap-6">
          <!-- Avatar -->
          <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
            {{ getInitials() }}
          </div>
          
          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ user()?.full_name || 'Usuario' }}</h1>
            <p class="text-blue-100 mb-3">{{ user()?.email }}</p>
            <div class="flex gap-3">
              <span class="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                {{ getRoleDisplay() }}
              </span>
              @if (user()?.has_2fa_enabled) {
                <span class="inline-flex items-center px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-sm font-medium">
                  <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  2FA Activo
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Información Personal
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
            <p class="text-gray-900 font-medium">{{ user()?.full_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label>
            <p class="text-gray-900 font-medium">{{ user()?.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Rol</label>
            <p class="text-gray-900 font-medium">{{ getRoleDisplay() }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">ID de Usuario</label>
            <p class="text-gray-900 font-medium">#{{ user()?.user_id }}</p>
          </div>
        </div>
      </div>

      <!-- Seguridad -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          Seguridad de la Cuenta
        </h2>
        
        <div class="space-y-4">
          <!-- Cambiar Contraseña -->
          <div class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Cambiar Contraseña</h3>
                  <p class="text-sm text-gray-600">Actualiza tu contraseña periódicamente</p>
                </div>
              </div>
              <a
                href="/change-password"
                class="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors"
              >
                Cambiar
              </a>
            </div>
          </div>

          <!-- Gestión 2FA -->
          <app-manage-2fa></app-manage-2fa>
        </div>
      </div>

      <!-- Sesión -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Sesión Activa
        </h2>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">Token JWT:</span>
            <span class="text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {{ getTokenPreview() }}
            </span>
          </div>
          
          <button
            (click)="logout()"
            class="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUser;

  getInitials(): string {
    const name = this.user()?.full_name || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  getRoleDisplay(): string {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'BRANCH_OPERATOR': 'Operador de Sucursal',
      'BACK_OFFICE': 'Operador Back Office',
      'CLIENT': 'Cliente',
      'COMPANY': 'Administrador de Flotilla',
      'COMMERCE': 'Comercio Afiliado'
    };
    return roleMap[this.user()?.role || ''] || this.user()?.role || 'Usuario';
  }

  getTokenPreview(): string {
    const token = this.authService.getAccessToken();
    if (!token) return 'No disponible';
    return token.substring(0, 20) + '...' + token.substring(token.length - 20);
  }

  async logout() {
    try {
      await this.authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar logout local si falla el backend
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
