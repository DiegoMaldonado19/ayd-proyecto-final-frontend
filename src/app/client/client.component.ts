import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from './services/subscription.service';
import { Subscription, SubscriptionBalance, RenewSubscriptionRequest } from './models/subscription.interface';

@Component({
  standalone: true,
  selector: 'app-client-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mi Suscripción</h1>
        <p class="text-gray-600">Gestiona tu plan de estacionamiento</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando suscripción...</p>
        </div>
      </div>

      <!-- No Subscription State -->
      <div *ngIf="!loading() && !subscription()" class="rounded-lg bg-white border border-gray-200 p-12 shadow-sm text-center">
        <svg class="w-24 h-24 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sin Suscripción Activa</h2>
        <p class="text-gray-600 mb-6">No tienes una suscripción activa en este momento</p>
        <button
          (click)="navigateToPurchase()"
          class="inline-flex items-center rounded-md bg-yellow-400 text-gray-900 px-6 py-3 font-semibold hover:bg-yellow-500 transition shadow-md">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Comprar Suscripción
        </button>
      </div>

      <!-- Subscription Content -->
      <div *ngIf="!loading() && subscription()" class="space-y-6">
        <!-- Subscription Overview Card -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-1">{{ subscription()!.plan.plan_type_name }}</h2>
              <p class="text-sm text-gray-600">{{ subscription()!.plan.description }}</p>
            </div>
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="{
              'bg-green-100 text-green-700': subscription()!.status_name === 'Activa',
              'bg-red-100 text-red-700': subscription()!.status_name === 'Vencida',
              'bg-yellow-100 text-yellow-700': subscription()!.status_name === 'Suspendida',
              'bg-gray-100 text-gray-700': subscription()!.status_name === 'Cancelada'
            }">
              {{ subscription()!.status_name }}
            </span>
          </div>

          <!-- License Plate -->
          <div class="mb-6 bg-gray-900 rounded-lg p-4 text-center">
            <div class="text-xs text-gray-400 mb-1">PLACA REGISTRADA</div>
            <div class="text-3xl font-mono font-bold text-yellow-400">{{ subscription()!.license_plate }}</div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-md p-4">
              <div class="text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Plan</div>
              <div class="text-lg font-bold text-gray-900">
                {{ subscription()!.is_annual ? 'Anual' : 'Mensual' }}
              </div>
            </div>
            <div class="bg-gray-50 rounded-md p-4">
              <div class="text-xs font-semibold text-gray-600 uppercase mb-1">Horas Mensuales</div>
              <div class="text-lg font-bold text-gray-900">{{ subscription()!.plan.monthly_hours }} hrs</div>
            </div>
            <div class="bg-gray-50 rounded-md p-4">
              <div class="text-xs font-semibold text-gray-600 uppercase mb-1">Fecha de Inicio</div>
              <div class="text-lg font-bold text-gray-900">{{ formatDate(subscription()!.start_date) }}</div>
            </div>
            <div class="bg-gray-50 rounded-md p-4">
              <div class="text-xs font-semibold text-gray-600 uppercase mb-1">Fecha de Vencimiento</div>
              <div class="text-lg font-bold text-gray-900">{{ formatDate(subscription()!.end_date) }}</div>
            </div>
          </div>
        </div>

        <!-- Usage Card -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Consumo de Horas</h3>
          
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Horas Consumidas</span>
              <span class="text-lg font-bold text-gray-900">
                {{ getConsumedHours().toFixed(2) }} / {{ getMonthlyHours() }} hrs
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500" 
                [ngClass]="{
                  'bg-green-600': getConsumptionPercentage() < 70,
                  'bg-yellow-500': getConsumptionPercentage() >= 70 && getConsumptionPercentage() < 90,
                  'bg-red-600': getConsumptionPercentage() >= 90
                }"
                [style.width.%]="getConsumptionPercentage()">
              </div>
            </div>
            
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">{{ getConsumptionPercentage().toFixed(1) }}% utilizado</span>
              <span class="text-xs text-gray-500">
                {{ getRemainingHours().toFixed(2) }} hrs restantes
              </span>
            </div>
          </div>

          <!-- Days until expiration info -->
          <div *ngIf="balance()" class="mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span *ngIf="getDaysUntilExpiration() > 0">
                Vence en <strong>{{ getDaysUntilExpiration() }} días</strong>
              </span>
              <span *ngIf="getDaysUntilExpiration() === 0" class="text-yellow-600 font-semibold">
                Vence hoy
              </span>
              <span *ngIf="getDaysUntilExpiration() < 0" class="text-red-600 font-semibold">
                Vencida hace {{ Math.abs(getDaysUntilExpiration()) }} días
              </span>
            </div>
          </div>

          <!-- Warning if near limit -->
          <div *ngIf="getConsumptionPercentage() >= 80" class="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-semibold text-yellow-800">Límite de horas próximo</h4>
                <p class="text-xs text-yellow-700 mt-1">
                  Has consumido más del 80% de tus horas mensuales. Los excedentes se cobrarán según la tarifa vigente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Card -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Beneficios del Plan</h3>
          <div class="space-y-3">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">{{ subscription()!.plan.monthly_discount_percentage }}% de descuento mensual</div>
                <div class="text-sm text-gray-600">Sobre la tarifa base por hora</div>
              </div>
            </div>
            <div *ngIf="subscription()!.is_annual" class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">{{ subscription()!.plan.annual_additional_discount_percentage }}% de descuento adicional anual</div>
                <div class="text-sm text-gray-600">Por pago anual anticipado</div>
              </div>
            </div>
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">Tarifa congelada</div>
                <div class="text-sm text-gray-600">Q{{ subscription()!.frozen_rate_base.toFixed(2) }} por hora durante toda la suscripción</div>
              </div>
            </div>
            <div *ngIf="subscription()!.auto_renew_enabled" class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">Renovación automática activada</div>
                <div class="text-sm text-gray-600">Tu suscripción se renovará automáticamente</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="openRenewModal()"
            class="flex-1 inline-flex items-center justify-center rounded-md bg-yellow-400 text-gray-900 px-6 py-3 font-semibold hover:bg-yellow-500 transition shadow-md">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Renovar Suscripción
          </button>
          <button
            class="flex-1 inline-flex items-center justify-center rounded-md bg-white border border-gray-300 text-gray-700 px-6 py-3 font-semibold hover:bg-gray-50 transition">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Historial
          </button>
        </div>
      </div>

      <!-- Renew Subscription Modal -->
      <div *ngIf="showRenewModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Renovar Suscripción</h3>
            <button (click)="closeRenewModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="handleRenewSubscription()">
            <div class="space-y-4 mb-6">
              <!-- Current Plan Info -->
              <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
                <div class="text-sm font-semibold text-gray-600 mb-2">Plan Actual</div>
                <div class="text-lg font-bold text-gray-900">{{ subscription()!.plan.plan_type_name }}</div>
                <div class="text-sm text-gray-600 mt-1">
                  {{ subscription()!.is_annual ? 'Pago Anual' : 'Pago Mensual' }}
                </div>
              </div>

              <!-- Tipo de Pago -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <div class="space-y-2">
                  <label class="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50" 
                         [ngClass]="{'border-yellow-400 bg-yellow-50': !renewRequest.is_annual}">
                    <input 
                      type="radio" 
                      name="paymentType"
                      [value]="false"
                      [(ngModel)]="renewRequest.is_annual"
                      class="w-4 h-4 text-yellow-600 focus:ring-yellow-500">
                    <span class="ml-3">
                      <span class="block text-sm font-semibold text-gray-900">Mensual</span>
                      <span class="block text-xs text-gray-600">Pago mes a mes</span>
                    </span>
                  </label>
                  <label class="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                         [ngClass]="{'border-yellow-400 bg-yellow-50': renewRequest.is_annual}">
                    <input 
                      type="radio" 
                      name="paymentType"
                      [value]="true"
                      [(ngModel)]="renewRequest.is_annual"
                      class="w-4 h-4 text-yellow-600 focus:ring-yellow-500">
                    <span class="ml-3">
                      <span class="block text-sm font-semibold text-gray-900">Anual</span>
                      <span class="block text-xs text-gray-600">
                        Pago anticipado con {{ subscription()!.plan.annual_additional_discount_percentage }}% descuento adicional
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Auto Renovación -->
              <div>
                <label class="flex items-start cursor-pointer">
                  <input 
                    type="checkbox"
                    [(ngModel)]="renewRequest.auto_renew_enabled"
                    name="autoRenew"
                    class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 rounded mt-0.5">
                  <span class="ml-3">
                    <span class="block text-sm font-semibold text-gray-900">Activar renovación automática</span>
                    <span class="block text-xs text-gray-600 mt-1">
                      Tu suscripción se renovará automáticamente al vencimiento
                    </span>
                  </span>
                </label>
              </div>

              <!-- Error message -->
              <div *ngIf="renewError()" class="rounded-md bg-red-50 border border-red-200 p-3">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <h4 class="text-sm font-semibold text-red-800">Error al renovar</h4>
                    <p class="text-xs text-red-700 mt-1">{{ renewError() }}</p>
                  </div>
                </div>
              </div>

              <!-- Success message -->
              <div *ngIf="renewSuccess()" class="rounded-md bg-green-50 border border-green-200 p-3">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <h4 class="text-sm font-semibold text-green-800">¡Renovación exitosa!</h4>
                    <p class="text-xs text-green-700 mt-1">Tu suscripción ha sido renovada correctamente</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                (click)="closeRenewModal()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="renewLoading()"
                class="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-md font-semibold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!renewLoading()">Renovar</span>
                <span *ngIf="renewLoading()" class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Renovando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClientDashboardComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  subscription = signal<Subscription | null>(null);
  balance = signal<SubscriptionBalance | null>(null);
  loading = signal<boolean>(false);

  // Exponer Math para el template
  Math = Math;

  // Renew modal state
  showRenewModal = signal<boolean>(false);
  renewLoading = signal<boolean>(false);
  renewError = signal<string>('');
  renewSuccess = signal<boolean>(false);
  renewRequest: RenewSubscriptionRequest = {
    is_annual: false,
    auto_renew_enabled: false
  };

  ngOnInit(): void {
    this.loadSubscription();
  }

  async loadSubscription(): Promise<void> {
    this.loading.set(true);
    try {
      // Cargar suscripción
      const data = await this.subscriptionService.getMySubscription().toPromise();
      this.subscription.set(data || null);
      
      // Si hay suscripción, cargar balance
      if (data?.id) {
        await this.loadBalance(data.id);
      }
    } catch (err: any) {
      if (err?.status === 404) {
        // No tiene suscripción activa
        this.subscription.set(null);
        this.balance.set(null);
      } else {
        console.error('Error loading subscription:', err);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async loadBalance(subscriptionId: number): Promise<void> {
    try {
      const balanceData = await this.subscriptionService.getSubscriptionBalance(subscriptionId).toPromise();
      this.balance.set(balanceData || null);
    } catch (err) {
      console.error('Error loading balance:', err);
    }
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getConsumptionPercentage(): number {
    // Usar el porcentaje real del balance si está disponible
    if (this.balance()) {
      return this.balance()!.consumption_percentage;
    }
    // Fallback al cálculo local si no hay balance
    if (!this.subscription()) return 0;
    const sub = this.subscription()!;
    return (sub.consumed_hours / sub.plan.monthly_hours) * 100;
  }

  getRemainingHours(): number {
    // Usar las horas restantes reales del balance si está disponible
    if (this.balance()) {
      return this.balance()!.remaining_hours;
    }
    // Fallback al cálculo local si no hay balance
    if (!this.subscription()) return 0;
    const sub = this.subscription()!;
    return Math.max(0, sub.plan.monthly_hours - sub.consumed_hours);
  }

  getConsumedHours(): number {
    // Usar las horas consumidas reales del balance si está disponible
    if (this.balance()) {
      return this.balance()!.consumed_hours;
    }
    // Fallback a la suscripción
    return this.subscription()?.consumed_hours || 0;
  }

  getMonthlyHours(): number {
    // Usar las horas mensuales reales del balance si está disponible
    if (this.balance()) {
      return this.balance()!.monthly_hours;
    }
    // Fallback a la suscripción
    return this.subscription()?.plan.monthly_hours || 0;
  }

  getDaysUntilExpiration(): number {
    return this.balance()?.days_until_expiration || 0;
  }

  openRenewModal(): void {
    const sub = this.subscription();
    if (!sub) return;

    // Inicializar formulario con valores actuales
    this.renewRequest = {
      is_annual: sub.is_annual,
      auto_renew_enabled: sub.auto_renew_enabled
    };
    
    this.renewError.set('');
    this.renewSuccess.set(false);
    this.showRenewModal.set(true);
  }

  closeRenewModal(): void {
    this.showRenewModal.set(false);
    this.renewError.set('');
    this.renewSuccess.set(false);
    
    // Si la renovación fue exitosa, recargar datos
    if (this.renewSuccess()) {
      this.loadSubscription();
    }
  }

  async handleRenewSubscription(): Promise<void> {
    const sub = this.subscription();
    if (!sub) return;

    this.renewLoading.set(true);
    this.renewError.set('');
    this.renewSuccess.set(false);

    try {
      const updatedSub = await this.subscriptionService
        .renewSubscription(sub.id, this.renewRequest)
        .toPromise();
      
      if (updatedSub) {
        this.subscription.set(updatedSub);
        this.renewSuccess.set(true);
        
        // Recargar balance también
        await this.loadBalance(updatedSub.id);
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.closeRenewModal();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error renewing subscription:', err);
      this.renewError.set(
        err?.error?.message || 
        err?.message || 
        'Error al renovar la suscripción. Por favor intente nuevamente.'
      );
    } finally {
      this.renewLoading.set(false);
    }
  }

  navigateToPurchase(): void {
    this.router.navigate(['/client/purchase-subscription']);
  }
}
