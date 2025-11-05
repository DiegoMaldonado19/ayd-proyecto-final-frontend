import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from './auth.service';
import { InputComponent } from '../shared/components/input.component';
import { ButtonComponent } from '../shared/components/button.component';
import { CardComponent } from '../shared/components/card.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, CardComponent],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg"
          >
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Park Control S.A.</h1>
          <p class="text-gray-600">Sistema de Gestión de Parqueos</p>
        </div>

        <!-- Formulario de login -->
        <app-card>
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>

            <form (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email -->
              <app-input
                type="email"
                label="Correo electrónico"
                placeholder="usuario@parkcontrol.com"
                [(value)]="email"
                [required]="true"
                [error]="emailError()"
              />

              <!-- Contraseña -->
              <app-input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                [(value)]="password"
                [required]="true"
                [error]="passwordError()"
              />

              <!-- Link de recuperación -->
              <div class="flex justify-end">
                <button
                  type="button"
                  (click)="onForgotPassword()"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <!-- Botón de login -->
              <app-button
                type="submit"
                variant="primary"
                size="lg"
                [loading]="loading()"
                [disabled]="!isFormValid()"
                class="w-full"
              >
                Iniciar Sesión
              </app-button>
            </form>

            <!-- Footer informativo -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="text-center space-y-2">
                <p class="text-sm text-gray-600">
                  <span class="inline-flex items-center">
                    <svg
                      class="w-4 h-4 mr-1.5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Conexión segura SSL
                  </span>
                </p>
                <p class="text-xs text-gray-500">Versión 1.0.0 • © 2025 Park Control S.A.</p>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Información de ayuda -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿Problemas para acceder? Contacta a
            <a
              href="mailto:soporte@parkcontrol.com"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              soporte@parkcontrol.com
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  emailError = signal('');
  passwordError = signal('');

  constructor(
    private auth: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  isFormValid(): boolean {
    return (
      this.email.trim().length > 0 && this.password.trim().length >= 8 && this.email.includes('@')
    );
  }

  validateFields(): boolean {
    let valid = true;
    this.emailError.set('');
    this.passwordError.set('');

    // Validar email
    if (!this.email.trim()) {
      this.emailError.set('El correo electrónico es requerido');
      valid = false;
    } else if (!this.email.includes('@')) {
      this.emailError.set('Formato de correo inválido');
      valid = false;
    }

    // Validar password
    if (!this.password.trim()) {
      this.passwordError.set('La contraseña es requerida');
      valid = false;
    } else if (this.password.length < 8) {
      this.passwordError.set('La contraseña debe tener al menos 8 caracteres');
      valid = false;
    }

    return valid;
  }

  async onSubmit() {
    if (!this.validateFields()) {
      return;
    }

    this.loading.set(true);

    try {
      const response: LoginResponse = await this.auth.login(this.email, this.password);

      // Caso 1: Requiere verificación 2FA
      if (response.requires_2fa_verification) {
        // Redirigir INMEDIATAMENTE a la página de verificación 2FA
        // El backend ya envió el código por correo, solo necesitamos pasar el email
        await this.router.navigate(['/auth/verify-2fa'], {
          queryParams: { 
            email: response.email || this.email
          }
        });
        // Mostrar notificación DESPUÉS de la navegación
        this.notification.info('Se ha enviado un código de verificación a tu correo electrónico');
        return;
      }

      // Caso 2: Requiere cambio de contraseña
      if (response.requires_password_change) {
        // Guardar la contraseña temporal en sessionStorage para el primer cambio
        // El backend la necesita en /auth/password/first-change
        sessionStorage.setItem('parkcontrol_temp_password', this.password);
        
        // Redirigir directamente a cambio de contraseña
        // El componente se encargará de solicitar el código 2FA
        await this.router.navigate(['/change-password']);
        this.notification.warning('Debes cambiar tu contraseña antes de continuar');
        return;
      }

      // Caso 3: Login exitoso completo
      this.notification.success(`¡Bienvenido ${response.full_name}!`);

      // Redirigir según rol
      this.redirectByRole(response.role);
    } catch (error: any) {
      console.error('Error en login:', error);

      // Manejar errores específicos
      if (error.status === 401) {
        this.notification.error('Credenciales incorrectas');
        this.passwordError.set('Usuario o contraseña incorrectos');
      } else if (error.status === 403) {
        this.notification.error('Cuenta bloqueada. Contacta a soporte');
      } else if (error.status === 429) {
        this.notification.error('Demasiados intentos. Intenta más tarde');
      } else {
        this.notification.error('Error al iniciar sesión. Intenta nuevamente');
      }
    } finally {
      this.loading.set(false);
    }
  }

  redirectByRole(role: string) {
    // Redirigir según el rol del usuario
    /*
      case 1 -> "ADMIN";
      case 2 -> "BRANCH_OPERATOR";
      case 3 -> "BACK_OFFICE";
      case 4 -> "CLIENT";
      case 5 -> "COMPANY";
      case 6 -> "COMMERCE";
      default -> "UNKNOWN";
    */
    switch (role) {
      case 'Administrador':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Operador Sucursal':
        this.router.navigate(['/branches/dashboard']);
        break;
      case 'Operador Back Office':
        this.router.navigate(['/backoffice/dashboard']);
        break;
      case 'Cliente':
        this.router.navigate(['/client/dashboard']);
        break;
      // case 'COMPANY':
      //   this.router.navigate(['/company/dashboard']);
      //   break;
      case 'Administrador Flotilla':
        this.router.navigate(['/commerce/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  onForgotPassword() {
    this.router.navigate(['/auth/reset-password']);
  }
}
