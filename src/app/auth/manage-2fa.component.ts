import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, TwoFAResponse } from './auth.service';

/**
 * Componente para gestionar 2FA desde el perfil de usuario
 * Permite habilitar, deshabilitar y ver el estado de 2FA
 */
@Component({
  selector: 'app-manage-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Autenticación de Dos Factores (2FA)</h3>
            <p class="text-sm text-gray-600">Agrega una capa extra de seguridad a tu cuenta</p>
          </div>
        </div>
        
        <!-- Badge de estado -->
        <div class="flex items-center gap-2">
          @if (is2FAEnabled()) {
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Activado
            </span>
          } @else {
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Desactivado
            </span>
          }
        </div>
      </div>

      <!-- Mensaje de éxito -->
      @if (successMessage()) {
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fadeIn">
          <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm text-green-800 font-medium">{{ successMessage() }}</p>
        </div>
      }

      <!-- Mensaje de error -->
      @if (errorMessage()) {
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm text-red-800">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Estado desactivado -->
      @if (!is2FAEnabled() && !qrCodeUrl()) {
        <div class="space-y-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-semibold text-blue-900 mb-2">¿Por qué habilitar 2FA?</h4>
            <ul class="space-y-2 text-sm text-blue-800">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Protección adicional contra accesos no autorizados</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Código de seguridad temporal cada 30 segundos</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Compatible con Google Authenticator, Authy y otras apps</span>
              </li>
            </ul>
          </div>

          <button
            (click)="enable2FA()"
            [disabled]="isLoading()"
            class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            @if (isLoading()) {
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </span>
            } @else {
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Habilitar 2FA
              </span>
            }
          </button>
        </div>
      }

      <!-- Mostrar QR Code para configuración -->
      @if (qrCodeUrl()) {
        <div class="space-y-6">
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex gap-2">
              <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-amber-800">
                <span class="font-medium">Paso importante:</span> Escanea este código QR con tu aplicación autenticadora antes de cerrar esta ventana.
              </p>
            </div>
          </div>

          <div class="text-center space-y-4">
            <p class="text-sm font-medium text-gray-700">Escanea este código QR con tu aplicación</p>
            
            <!-- QR Code -->
            <div class="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-inner">
              <img [src]="qrCodeUrl()" alt="QR Code 2FA" class="w-64 h-64 mx-auto" />
            </div>

            <!-- Secret key alternativa -->
            @if (secretKey()) {
              <div class="space-y-2">
                <p class="text-xs text-gray-600">O ingresa manualmente esta clave:</p>
                <div class="flex items-center justify-center gap-2">
                  <code class="px-4 py-2 bg-gray-100 text-gray-800 rounded font-mono text-sm">{{ secretKey() }}</code>
                  <button
                    (click)="copySecret()"
                    class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Copiar clave"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="p-4 bg-gray-50 rounded-lg space-y-3">
            <p class="text-sm font-medium text-gray-900">Aplicaciones recomendadas:</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div class="text-center p-2 bg-white rounded border border-gray-200">
                <p class="text-sm font-medium text-gray-800">Google Authenticator</p>
                <p class="text-xs text-gray-500">iOS & Android</p>
              </div>
              <div class="text-center p-2 bg-white rounded border border-gray-200">
                <p class="text-sm font-medium text-gray-800">Microsoft Authenticator</p>
                <p class="text-xs text-gray-500">iOS & Android</p>
              </div>
              <div class="text-center p-2 bg-white rounded border border-gray-200">
                <p class="text-sm font-medium text-gray-800">Authy</p>
                <p class="text-xs text-gray-500">iOS, Android & Desktop</p>
              </div>
            </div>
          </div>

          <button
            (click)="closeQRCode()"
            class="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Ya escaneé el código, continuar
            </span>
          </button>
        </div>
      }

      <!-- Estado activado -->
      @if (is2FAEnabled() && !qrCodeUrl()) {
        <div class="space-y-4">
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex gap-3">
              <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-green-900 mb-1">Tu cuenta está protegida</p>
                <p class="text-sm text-green-700">Se te solicitará un código de verificación cada vez que inicies sesión desde un nuevo dispositivo.</p>
              </div>
            </div>
          </div>

          <button
            (click)="confirmDisable2FA()"
            [disabled]="isLoading()"
            class="w-full sm:w-auto px-6 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isLoading()) {
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deshabilitando...
              </span>
            } @else {
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Deshabilitar 2FA
              </span>
            }
          </button>
        </div>
      }

      <!-- Modal de confirmación para deshabilitar -->
      @if (showDisableConfirm()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 bg-red-100 rounded-full">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-900 mb-2">¿Deshabilitar 2FA?</h4>
                <p class="text-sm text-gray-600">Tu cuenta tendrá menos protección. Solo podrás iniciar sesión con tu contraseña.</p>
              </div>
            </div>

            <div class="flex gap-3 justify-end">
              <button
                (click)="showDisableConfirm.set(false)"
                class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="disable2FA()"
                [disabled]="isLoading()"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Sí, deshabilitar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-scaleIn {
      animation: scaleIn 0.2s ease-out;
    }
  `]
})
export class Manage2FAComponent {
  private authService = inject(AuthService);

  isLoading = signal(false);
  is2FAEnabled = signal(false);
  qrCodeUrl = signal<string | null>(null);
  secretKey = signal<string | null>(null);
  successMessage = signal('');
  errorMessage = signal('');
  showDisableConfirm = signal(false);

  ngOnInit() {
    this.loadUserStatus();
  }

  private loadUserStatus() {
    const user = this.authService.currentUser();
    if (user) {
      this.is2FAEnabled.set(user.has_2fa_enabled || false);
    }
  }

  async enable2FA() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const response = await this.authService.enable2FA();
      console.log('2FA enabled response:', response);
      
      // El backend retorna qr_code y secret
      this.qrCodeUrl.set(response.qr_code || null);
      this.secretKey.set(response.secret || null);
      this.successMessage.set('Escanea el código QR con tu aplicación autenticadora');
      
      // Actualizar estado del usuario
      const user = this.authService.currentUser();
      if (user) {
        user.has_2fa_enabled = true;
        localStorage.setItem('parkcontrol_user', JSON.stringify(user));
        this.authService.currentUser.set(user);
        this.is2FAEnabled.set(true);
      }
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      this.errorMessage.set(error?.error?.message || 'Error al habilitar 2FA. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  confirmDisable2FA() {
    this.showDisableConfirm.set(true);
  }

  async disable2FA() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showDisableConfirm.set(false);

    try {
      const response = await this.authService.disable2FA();
      console.log('2FA disabled response:', response);
      
      this.successMessage.set('2FA deshabilitado correctamente. Tu cuenta ahora usa solo contraseña.');
      this.is2FAEnabled.set(false);
      this.qrCodeUrl.set(null);
      
      // Actualizar estado del usuario
      const user = this.authService.currentUser();
      if (user) {
        user.has_2fa_enabled = false;
        localStorage.setItem('parkcontrol_user', JSON.stringify(user));
        this.authService.currentUser.set(user);
      }

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      this.errorMessage.set(error?.error?.message || 'Error al deshabilitar 2FA. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeQRCode() {
    this.qrCodeUrl.set(null);
    this.secretKey.set(null);
    this.successMessage.set('2FA habilitado correctamente. Ahora necesitarás el código al iniciar sesión.');
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  async copySecret() {
    const secret = this.secretKey();
    if (secret) {
      try {
        await navigator.clipboard.writeText(secret);
        this.successMessage.set('Clave copiada al portapapeles');
        setTimeout(() => this.successMessage.set(''), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }
}
