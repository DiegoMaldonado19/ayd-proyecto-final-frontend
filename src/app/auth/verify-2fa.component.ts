import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Componente para verificar código 2FA durante el login
 * Se muestra cuando el usuario tiene 2FA habilitado
 */
@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-4 py-12">
      <div class="max-w-md w-full">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="inline-block p-3 bg-white/10 rounded-2xl backdrop-blur-sm mb-4">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Verificación 2FA</h2>
          <p class="text-blue-200">Ingresa el código enviado a tu correo electrónico</p>
        </div>

        <!-- Formulario -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <!-- Email del usuario -->
          <div class="mb-6 text-center">
            <p class="text-sm text-gray-600">Verificando para:</p>
            <p class="text-lg font-semibold text-gray-900">{{ userEmail }}</p>
          </div>

          <!-- Input del código -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Código de 6 dígitos
            </label>
            <input
              type="text"
              [(ngModel)]="code"
              (input)="onCodeInput($event)"
              (keyup.enter)="verify()"
              maxlength="6"
              pattern="[0-9]*"
              inputmode="numeric"
              placeholder="000000"
              class="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              [class.border-red-500]="errorMessage"
              [disabled]="isLoading"
            />
            
            <!-- Indicador de dígitos -->
            <div class="flex justify-center gap-2 mt-3">
              @for (i of [0,1,2,3,4,5]; track i) {
                <div 
                  class="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl font-mono transition-all"
                  [class]="code[i] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-50 text-gray-400'"
                >
                  {{ code[i] || '·' }}
                </div>
              }
            </div>
          </div>

          <!-- Mensaje de error -->
          @if (errorMessage) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          }

          <!-- Botón verificar -->
          <button
            (click)="verify()"
            [disabled]="isLoading || code.length !== 6"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            @if (isLoading) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            } @else {
              Verificar código
            }
          </button>

          <!-- Separador -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">¿Problemas?</span>
            </div>
          </div>

          <!-- Botón volver -->
          <button
            (click)="goBack()"
            [disabled]="isLoading"
            class="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Volver al login
          </button>

          <!-- Ayuda -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex gap-2">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">¿Dónde encuentro el código?</p>
                <p class="text-blue-700">Abre tu aplicación autenticadora (Google Authenticator, Authy, etc.) y encuentra el código de 6 dígitos para ParkControl.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center text-blue-200 text-sm">
          <p>El código expira en 30 segundos</p>
        </div>
      </div>
    </div>
  `
})
export class Verify2FAComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  code = '';
  isLoading = false;
  errorMessage = '';
  userEmail = '';

  ngOnInit() {
    // Obtener el email de los query params
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
      
      // Si no hay email, redirigir al login
      if (!this.userEmail) {
        console.error('verify2FA: Missing email');
        this.router.navigate(['/login']);
      }
    });
  }

  onCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Solo permitir números
    this.code = input.value.replace(/[^0-9]/g, '');
    this.errorMessage = '';
    
    // Auto-verificar cuando se completen los 6 dígitos
    if (this.code.length === 6) {
      setTimeout(() => this.verify(), 300);
    }
  }

  async verify() {
    if (this.code.length !== 6 || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('verify2FA: Verifying code for email:', this.userEmail);
      
      // Verificar con el backend
      const response = await this.authService.verify2FA(this.code, this.userEmail);
      
      console.log('verify2FA: Verification successful');
      
      // Verificar si requiere cambio de contraseña
      if (response.requires_password_change) {
        this.router.navigate(['/change-password']);
      } else {
        // Redirigir según el rol
        this.redirectByRole(response.role);
      }
    } catch (error: any) {
      console.error('verify2FA: Error', error);
      this.errorMessage = error?.error?.message || 'Código inválido o expirado. Por favor, intenta nuevamente.';
      this.code = '';
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  redirectByRole(role: string) {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'BRANCH_OPERATOR':
        this.router.navigate(['/branches/dashboard']);
        break;
      case 'BACK_OFFICE':
        this.router.navigate(['/backoffice/dashboard']);
        break;
      case 'CLIENT':
        this.router.navigate(['/client/dashboard']);
        break;
      case 'COMPANY':
        this.router.navigate(['/company/dashboard']);
        break;
      case 'COMMERCE':
        this.router.navigate(['/commerce/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
