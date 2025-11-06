import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionPlan, CreateSubscriptionRequest } from './models/subscription.interface';

@Component({
  standalone: true,
  selector: 'app-purchase-subscription',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button 
            (click)="goBack()"
            class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Comprar Suscripción</h1>
          <p class="text-gray-600">Selecciona el plan que mejor se adapte a tus necesidades</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loadingPlans()" class="flex items-center justify-center py-16">
          <div class="text-center">
            <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Cargando planes disponibles...</p>
          </div>
        </div>

        <!-- Plans Grid -->
        <div *ngIf="!loadingPlans() && !selectedPlan()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            *ngFor="let plan of plans()"
            (click)="selectPlan(plan)"
            class="bg-white rounded-lg border-2 border-gray-200 p-6 cursor-pointer hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
            [ngClass]="{'border-yellow-400 shadow-lg': selectedPlan()?.id === plan.id}">
            
            <!-- Plan Header -->
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ plan.plan_type_name }}</h3>
              <p class="text-sm text-gray-600">{{ plan.description }}</p>
            </div>

            <!-- Plan Details -->
            <div class="space-y-3 mb-6">
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700"><strong>{{ plan.monthly_hours }} horas</strong> mensuales</span>
              </div>
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700"><strong>{{ plan.monthly_discount_percentage }}%</strong> descuento mensual</span>
              </div>
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700"><strong>{{ plan.annual_additional_discount_percentage }}%</strong> adicional anual</span>
              </div>
            </div>

            <!-- Select Button -->
            <button 
              type="button"
              class="w-full py-2 px-4 rounded-md font-semibold transition"
              [ngClass]="selectedPlan()?.id === plan.id ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
              {{ selectedPlan()?.id === plan.id ? 'Seleccionado ✓' : 'Seleccionar Plan' }}
            </button>
          </div>
        </div>

        <!-- Purchase Form -->
        <div *ngIf="selectedPlan() && !loadingPlans()" class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Detalles de Compra</h2>
            <button 
              (click)="clearSelection()"
              class="text-sm text-gray-600 hover:text-gray-900">
              Cambiar plan
            </button>
          </div>

          <form (ngSubmit)="handlePurchase()">
            <!-- Selected Plan Info -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div class="flex items-start">
                <svg class="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-gray-900">{{ selectedPlan()!.plan_type_name }}</h3>
                  <p class="text-sm text-gray-700 mt-1">{{ selectedPlan()!.description }}</p>
                  <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Horas mensuales:</strong> {{ selectedPlan()!.monthly_hours }}</div>
                    <div><strong>Descuento:</strong> {{ selectedPlan()!.monthly_discount_percentage }}%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- License Plate Input -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Placa del Vehículo *
              </label>
              <input 
                type="text"
                [(ngModel)]="purchaseRequest.license_plate"
                name="licensePlate"
                placeholder="Ej: ABC-123"
                required
                pattern="^[A-Z]{1,3}-?[0-9]{3,4}$|^[A-Z]{1,3}[0-9]{3,4}$|^P-[0-9]{5,6}$"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 uppercase"
                [ngClass]="{'border-red-500': purchaseRequest.license_plate && !isValidPlate()}">
              <p class="text-xs text-gray-600 mt-1">
                Formatos válidos: ABC-123, ABC123, P-12345
              </p>
              <p *ngIf="purchaseRequest.license_plate && !isValidPlate()" class="text-xs text-red-600 mt-1">
                Formato de placa inválido
              </p>
            </div>

            <!-- Payment Type -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Pago *
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  class="flex items-start p-4 border-2 rounded-md cursor-pointer hover:bg-gray-50 transition"
                  [ngClass]="{'border-yellow-400 bg-yellow-50': !purchaseRequest.is_annual, 'border-gray-200': purchaseRequest.is_annual}">
                  <input 
                    type="radio" 
                    name="paymentType"
                    [value]="false"
                    [(ngModel)]="purchaseRequest.is_annual"
                    class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 mt-0.5">
                  <div class="ml-3">
                    <span class="block text-base font-semibold text-gray-900">Pago Mensual</span>
                    <span class="block text-sm text-gray-600 mt-1">
                      Pago mes a mes. Mayor flexibilidad.
                    </span>
                  </div>
                </label>
                
                <label 
                  class="flex items-start p-4 border-2 rounded-md cursor-pointer hover:bg-gray-50 transition"
                  [ngClass]="{'border-yellow-400 bg-yellow-50': purchaseRequest.is_annual, 'border-gray-200': !purchaseRequest.is_annual}">
                  <input 
                    type="radio" 
                    name="paymentType"
                    [value]="true"
                    [(ngModel)]="purchaseRequest.is_annual"
                    class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 mt-0.5">
                  <div class="ml-3">
                    <span class="block text-base font-semibold text-gray-900">Pago Anual</span>
                    <span class="block text-sm text-gray-600 mt-1">
                      <strong class="text-green-600">{{ selectedPlan()!.annual_additional_discount_percentage }}% descuento adicional</strong>
                      <br>Ahorra pagando por adelantado.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Auto Renew -->
            <div class="mb-6">
              <label class="flex items-start cursor-pointer p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                <input 
                  type="checkbox"
                  [(ngModel)]="purchaseRequest.auto_renew_enabled"
                  name="autoRenew"
                  class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 rounded mt-0.5">
                <div class="ml-3">
                  <span class="block text-sm font-semibold text-gray-900">Activar renovación automática</span>
                  <span class="block text-xs text-gray-600 mt-1">
                    Tu suscripción se renovará automáticamente al vencimiento para que no pierdas tu acceso.
                  </span>
                </div>
              </label>
            </div>

            <!-- Error Message -->
            <div *ngIf="purchaseError()" class="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h4 class="text-sm font-semibold text-red-800">Error al procesar la compra</h4>
                  <p class="text-xs text-red-700 mt-1">{{ purchaseError() }}</p>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="purchaseSuccess()" class="mb-6 rounded-md bg-green-50 border border-green-200 p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h4 class="text-sm font-semibold text-green-800">¡Compra exitosa!</h4>
                  <p class="text-xs text-green-700 mt-1">Tu suscripción ha sido activada correctamente. Serás redirigido al dashboard...</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                type="button"
                (click)="goBack()"
                class="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="purchaseLoading() || !isFormValid()"
                class="flex-1 px-6 py-3 bg-yellow-400 text-gray-900 rounded-md font-semibold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                <span *ngIf="!purchaseLoading()">Confirmar Compra</span>
                <span *ngIf="purchaseLoading()" class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
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
export class PurchaseSubscriptionPage implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  plans = signal<SubscriptionPlan[]>([]);
  loadingPlans = signal<boolean>(false);
  selectedPlan = signal<SubscriptionPlan | null>(null);

  purchaseLoading = signal<boolean>(false);
  purchaseError = signal<string>('');
  purchaseSuccess = signal<boolean>(false);

  purchaseRequest: CreateSubscriptionRequest = {
    plan_id: 0,
    license_plate: '',
    is_annual: false,
    auto_renew_enabled: false
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  async loadPlans(): Promise<void> {
    this.loadingPlans.set(true);
    try {
      const data = await this.subscriptionService.getAvailablePlans().toPromise();
      this.plans.set(data || []);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      this.loadingPlans.set(false);
    }
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan.set(plan);
    this.purchaseRequest.plan_id = plan.id;
  }

  clearSelection(): void {
    this.selectedPlan.set(null);
    this.purchaseRequest.plan_id = 0;
  }

  isValidPlate(): boolean {
    if (!this.purchaseRequest.license_plate) return true;
    const platePattern = /^[A-Z]{1,3}-?[0-9]{3,4}$|^[A-Z]{1,3}[0-9]{3,4}$|^P-[0-9]{5,6}$/;
    return platePattern.test(this.purchaseRequest.license_plate.toUpperCase());
  }

  isFormValid(): boolean {
    return (
      this.purchaseRequest.plan_id > 0 &&
      this.purchaseRequest.license_plate.trim() !== '' &&
      this.isValidPlate()
    );
  }

  async handlePurchase(): Promise<void> {
    if (!this.isFormValid()) return;

    this.purchaseLoading.set(true);
    this.purchaseError.set('');
    this.purchaseSuccess.set(false);

    // Ensure uppercase plate
    this.purchaseRequest.license_plate = this.purchaseRequest.license_plate.toUpperCase();

    try {
      const newSubscription = await this.subscriptionService
        .createSubscription(this.purchaseRequest)
        .toPromise();

      if (newSubscription) {
        this.purchaseSuccess.set(true);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/client/dashboard']);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      this.purchaseError.set(
        err?.error?.message || 
        err?.message || 
        'Error al crear la suscripción. Por favor intente nuevamente.'
      );
    } finally {
      this.purchaseLoading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/client/dashboard']);
  }
}
