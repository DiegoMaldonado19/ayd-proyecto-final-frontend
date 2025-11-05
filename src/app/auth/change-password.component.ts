import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h1>
          <p class="text-gray-600">
            @if (isFirstLogin()) {
              Por seguridad, debes cambiar tu contraseña antes de continuar
            } @else if (!codeRequested()) {
              Para cambiar tu contraseña, primero validaremos tu identidad
            } @else {
              Ingresa el código enviado a tu correo y tu nueva contraseña
            }
          </p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            
            <!-- Current Password -->
            @if (!isFirstLogin()) {
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <div class="relative">
                  <input
                    [type]="showCurrentPassword() ? 'text' : 'password'"
                    formControlName="current_password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    [class.border-red-500]="passwordForm.get('current_password')?.invalid && passwordForm.get('current_password')?.touched"
                    placeholder="Ingresa tu contraseña actual"
                  >
                  <button
                    type="button"
                    (click)="showCurrentPassword.set(!showCurrentPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      @if (showCurrentPassword()) {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      }
                    </svg>
                  </button>
                </div>
                @if (passwordForm.get('current_password')?.invalid && passwordForm.get('current_password')?.touched) {
                  <p class="mt-1 text-sm text-red-600">La contraseña actual es requerida</p>
                }
              </div>
            }

            <!-- New Password -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div class="relative">
                <input
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="new_password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  [class.border-red-500]="passwordForm.get('new_password')?.invalid && passwordForm.get('new_password')?.touched"
                  placeholder="Mínimo 8 caracteres"
                >
                <button
                  type="button"
                  (click)="showNewPassword.set(!showNewPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showNewPassword()) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              
              <!-- Password strength indicator -->
              @if (passwordForm.get('new_password')?.value) {
                <div class="mt-2">
                  <div class="flex gap-1 mb-1">
                    @for (item of [1,2,3,4]; track item) {
                      <div class="flex-1 h-1 rounded-full transition-all"
                           [class]="item <= passwordStrength() ? getStrengthColor() : 'bg-gray-200'">
                      </div>
                    }
                  </div>
                  <p class="text-xs" [class]="getStrengthTextColor()">
                    {{ getStrengthLabel() }}
                  </p>
                </div>
              }

              @if (passwordForm.get('new_password')?.invalid && passwordForm.get('new_password')?.touched) {
                <p class="mt-1 text-sm text-red-600">La contraseña debe tener al menos 8 caracteres</p>
              }
            </div>

            <!-- Confirm Password -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div class="relative">
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirm_password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  [class.border-red-500]="passwordForm.get('confirm_password')?.invalid && passwordForm.get('confirm_password')?.touched"
                  placeholder="Confirma tu nueva contraseña"
                >
                <button
                  type="button"
                  (click)="showConfirmPassword.set(!showConfirmPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showConfirmPassword()) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirm_password')?.touched) {
                <p class="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
              }
            </div>

            <!-- 2FA Code (se muestra cuando se solicita) -->
            @if (showCodeField()) {
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Código 2FA
                </label>
                <div class="relative">
                  <input
                    type="text"
                    formControlName="code"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                    [class.border-red-500]="passwordForm.get('code')?.invalid && passwordForm.get('code')?.touched"
                    placeholder="000000"
                    maxlength="6"
                    inputmode="numeric"
                    pattern="[0-9]*"
                  >
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                @if (passwordForm.get('code')?.invalid && passwordForm.get('code')?.touched) {
                  <p class="mt-1 text-sm text-red-600">El código 2FA debe ser de 6 dígitos</p>
                }
                <p class="mt-1 text-xs text-green-600">
                  ✓ Código enviado a tu correo electrónico
                </p>
              </div>
            }

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-red-800">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-green-800">{{ successMessage() }}</p>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              @if (loading()) {
                <div class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>
                    @if (isFirstLogin()) {
                      Cambiando contraseña...
                    } @else if (codeRequested()) {
                      Cambiando contraseña...
                    } @else {
                      Solicitando código...
                    }
                  </span>
                </div>
              } @else {
                @if (isFirstLogin()) {
                  Cambiar Contraseña
                } @else if (codeRequested()) {
                  Cambiar Contraseña
                } @else {
                  Solicitar Código 2FA
                }
              }
            </button>

            <!-- Skip button only for non-first login -->
            @if (!isFirstLogin()) {
              <button
                type="button"
                (click)="cancel()"
                class="w-full mt-3 text-gray-600 hover:text-gray-900 font-medium py-3 transition-colors"
              >
                Cancelar
              </button>
            }
          </form>
        </div>

        <!-- Security tips -->
        <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Consejos de seguridad
          </h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Usa al menos 8 caracteres</li>
            <li>• Combina mayúsculas, minúsculas y números</li>
            <li>• Incluye caracteres especiales (!&#64;#$%)</li>
            <li>• No uses información personal</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  passwordForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  isFirstLogin = signal(false);
  passwordStrength = signal(0);
  showCodeField = signal(false);
  codeRequested = signal(false);
  tempPassword = ''; // Contraseña temporal guardada del login

  constructor() {
    // Check if user requires password change
    const user = this.authService.currentUser();
    this.isFirstLogin.set(user?.requires_password_change || false);
    
    // Si es primer login, recuperar la contraseña temporal de sessionStorage
    if (this.isFirstLogin()) {
      this.tempPassword = sessionStorage.getItem('parkcontrol_temp_password') || '';
    }
    
    // Initialize form basado en el tipo de flujo
    if (this.isFirstLogin()) {
      // FLUJO 1: Primer cambio (sin mostrar campo de contraseña actual, pero la enviaremos)
      this.passwordForm = this.fb.group({
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator });
    } else {
      // FLUJO 2: Cambio regular (con contraseña actual y código)
      this.passwordForm = this.fb.group({
        current_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]],
        code: [''] // Se activará cuando se solicite
      }, { validators: this.passwordMatchValidator });
    }

    // Calculate password strength
    this.passwordForm.get('new_password')?.valueChanges.subscribe(value => {
      this.calculatePasswordStrength(value);
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    this.passwordStrength.set(Math.min(strength, 4));
  }

  getStrengthColor(): string {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getStrengthTextColor(): string {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'text-red-600';
    if (strength === 2) return 'text-yellow-600';
    if (strength === 3) return 'text-blue-600';
    return 'text-green-600';
  }

  getStrengthLabel(): string {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'Contraseña débil';
    if (strength === 2) return 'Contraseña media';
    if (strength === 3) return 'Contraseña buena';
    return 'Contraseña fuerte';
  }

  async requestCode() {
    // Solo para cambio regular, no para primer login
    if (this.isFirstLogin()) return;

    // Validar que se ingresó la contraseña actual
    const currentPassword = this.passwordForm.get('current_password')?.value;
    if (!currentPassword) {
      this.errorMessage.set('Debes ingresar tu contraseña actual');
      return;
    }

    try {
      this.loading.set(true);
      this.errorMessage.set('');
      
      // FLUJO 2a: Solicitar código con contraseña actual
      await this.authService.requestPasswordChangeCode(currentPassword);
      
      this.showCodeField.set(true);
      this.codeRequested.set(true);
      
      // Agregar validación al campo de código
      this.passwordForm.get('code')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
      this.passwordForm.get('code')?.updateValueAndValidity();
      
      this.successMessage.set('Se ha enviado un código de verificación a tu correo electrónico');
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || 'Error al solicitar código de verificación. Verifica tu contraseña actual.');
      console.error('Error requesting code:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formValue = this.passwordForm.value;
      
      if (this.isFirstLogin()) {
        // FLUJO 1: Primer cambio de contraseña (sin 2FA)
        // Verificar que tenemos la contraseña temporal
        if (!this.tempPassword) {
          this.errorMessage.set('No se encontró la contraseña temporal. Por favor, vuelve a iniciar sesión.');
          return;
        }
        
        await this.authService.firstPasswordChange(
          this.tempPassword,           // current_password (temporal del login)
          formValue.new_password,       // new_password
          formValue.confirm_password    // confirm_password
        );
        
        // Limpiar la contraseña temporal de sessionStorage
        sessionStorage.removeItem('parkcontrol_temp_password');
      } else {
        // FLUJO 2: Cambio regular (con 2FA)
        // Si no se ha solicitado el código, solicitarlo primero
        if (!this.codeRequested()) {
          await this.requestCode();
          return;
        }

        // Cambiar contraseña con código 2FA
        await this.authService.changePassword(
          formValue.current_password,
          formValue.new_password,
          formValue.confirm_password,
          formValue.code
        );
      }

      this.successMessage.set('Contraseña cambiada exitosamente');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        const user = this.authService.currentUser();
        if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user?.role) {
          this.router.navigate([`/${user.role.toLowerCase()}/dashboard`]);
        } else {
          this.router.navigate(['/login']);
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error changing password:', error);
      this.errorMessage.set(error.error?.message || 'Error al cambiar la contraseña. Verifica los datos e intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/admin/dashboard']);
  }
}
