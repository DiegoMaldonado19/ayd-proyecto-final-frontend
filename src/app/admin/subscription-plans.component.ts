import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SubscriptionPlanResponse, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from './services/admin.service';
import { NotificationService } from '../shared/services/notification.service';

/**
 * Gestión de Planes de Suscripción
 * Sistema de 5 tipos de planes FIJOS que solo pueden ser EDITADOS
 * Endpoints: GET /subscription-plans, PUT /subscription-plans/{id}
 * Los planes no se pueden crear ni eliminar - son configuraciones fijas del sistema
 */
@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
          <p class="text-sm text-gray-600 mt-1">
            Gestiona los 5 tipos de planes fijos del sistema ({{ plans().length }} planes configurados)
          </p>
        </div>
        <div>
          <!-- Filtro Activo/Inactivo -->
          <select [(ngModel)]="filterActive" (change)="applyFilter()"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los planes</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>
      </div>

      <!-- Info sobre el sistema de planes -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex gap-3">
          <div class="text-blue-600 text-xl">ℹ️</div>
          <div class="flex-1">
            <h3 class="font-semibold text-blue-900 mb-1">Sistema de Planes Fijos</h3>
            <p class="text-sm text-blue-800 mb-2">
              El sistema maneja <strong>5 tipos de planes predefinidos</strong> que solo pueden ser <strong>editados</strong>. 
              Puedes modificar las horas mensuales, porcentajes de descuento y descripciones según las necesidades del negocio.
            </p>
            <div class="flex gap-2 flex-wrap text-xs">
              <span class="px-2 py-1 bg-blue-100 rounded">A - Full Access</span>
              <span class="px-2 py-1 bg-blue-100 rounded">B - Workweek</span>
              <span class="px-2 py-1 bg-blue-100 rounded">C - Office Light</span>
              <span class="px-2 py-1 bg-blue-100 rounded">D - Daily Flexible</span>
              <span class="px-2 py-1 bg-blue-100 rounded">E - Night</span>
            </div>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (plan of plans(); track plan.id) {
            <div class="bg-white rounded-lg shadow p-6 space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ plan.plan_type_name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ plan.plan_type_code }}</p>
                </div>
                <span [class]="plan.is_active ? 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded' : 'px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded'">
                  {{ plan.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="border-t pt-3">
                <p class="text-sm text-gray-600 mb-3">{{ plan.description }}</p>
                
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Horas Mensuales:</span>
                    <span class="font-semibold">{{ plan.monthly_hours }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Descuento Mensual:</span>
                    <span class="font-semibold text-green-600">{{ plan.monthly_discount_percentage }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Descuento Anual:</span>
                    <span class="font-semibold text-blue-600">{{ plan.annual_additional_discount_percentage }}%</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-center pt-3 border-t">
                <button 
                  (click)="editPlan(plan)"
                  class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
                  ✏️ Editar Plan
                </button>
              </div>
            </div>
          }
        </div>

        @if (plans().length === 0) {
          <div class="text-center py-12 text-gray-500">
            <p class="text-lg">No hay planes de suscripción configurados</p>
            <p class="text-sm mt-2">Crea el primer plan para comenzar</p>
          </div>
        }
      }

      <!-- Modal: Editar Plan -->
      @if (showPlanModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 class="text-lg font-semibold mb-4">
              Editar Plan: {{ selectedPlan()?.plan_type_name }}
            </h3>
            
            <form (ngSubmit)="savePlan()" class="space-y-4">
              <!-- Tipo de plan (solo lectura) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Plan
                </label>
                <input
                  type="text"
                  [value]="selectedPlan()?.plan_type_code + ' - ' + selectedPlan()?.plan_type_name"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed" />
                <p class="text-xs text-gray-500 mt-1">El tipo de plan no se puede cambiar</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Horas Mensuales *</label>
                <input
                  type="number"
                  [(ngModel)]="planForm.monthly_hours"
                  name="monthly_hours"
                  placeholder="60"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descuento Mensual (%) *</label>
                <input
                  type="number"
                  [(ngModel)]="planForm.monthly_discount_percentage"
                  name="monthly_discount_percentage"
                  placeholder="10.00"
                  step="0.01"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descuento Anual Adicional (%) *</label>
                <input
                  type="number"
                  [(ngModel)]="planForm.annual_additional_discount_percentage"
                  name="annual_additional_discount_percentage"
                  placeholder="5.00"
                  step="0.01"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  [(ngModel)]="planForm.description"
                  name="description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del plan..."></textarea>
              </div>

              <div class="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  (click)="closePlanModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="!isFormValid() || isSaving()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                  {{ isSaving() ? 'Guardando...' : 'Actualizar Plan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SubscriptionPlansComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  // Estado
  isLoading = signal(false);
  isSaving = signal(false);
  
  plans = signal<SubscriptionPlanResponse[]>([]);
  allPlans = signal<SubscriptionPlanResponse[]>([]); // Todos los planes sin filtrar
  selectedPlan = signal<SubscriptionPlanResponse | null>(null);
  
  // Filtro
  filterActive: 'all' | 'active' | 'inactive' = 'all';
  
  // Tipos de plan disponibles (A, B, C, D, E) - FIJOS
  readonly PLAN_TYPES = [
    { id: 1, code: 'A', name: 'Full Access' },
    { id: 2, code: 'B', name: 'Workweek' },
    { id: 3, code: 'C', name: 'Office Light' },
    { id: 4, code: 'D', name: 'Daily Flexible' },
    { id: 5, code: 'E', name: 'Night' }
  ];

  // Modal de edición
  showPlanModal = signal(false);

  // Formulario simple con validación manual
  planForm: any = {
    plan_type_id: '',
    monthly_hours: '',
    monthly_discount_percentage: '',
    annual_additional_discount_percentage: '',
    description: ''
  };

  async ngOnInit() {
    await this.loadPlans();
  }

  async loadPlans() {
    this.isLoading.set(true);
    try {
      const plans = await this.adminService.listSubscriptionPlans();
      this.allPlans.set(plans); // Guardar todos
      this.applyFilter(); // Aplicar filtro inicial
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al cargar los planes'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
  
  applyFilter() {
    const all = this.allPlans();
    
    if (this.filterActive === 'active') {
      this.plans.set(all.filter(p => p.is_active));
    } else if (this.filterActive === 'inactive') {
      this.plans.set(all.filter(p => !p.is_active));
    } else {
      this.plans.set(all); // Mostrar todos
    }
  }

  editPlan(plan: SubscriptionPlanResponse) {
    this.selectedPlan.set(plan);
    this.planForm = {
      plan_type_id: plan.plan_type_id,
      monthly_hours: plan.monthly_hours,
      monthly_discount_percentage: plan.monthly_discount_percentage,
      annual_additional_discount_percentage: plan.annual_additional_discount_percentage,
      description: plan.description || ''
    };
    this.showPlanModal.set(true);
  }

  closePlanModal() {
    this.showPlanModal.set(false);
    this.selectedPlan.set(null);
  }

  isFormValid(): boolean {
    return this.planForm.monthly_hours > 0 &&
           this.planForm.monthly_discount_percentage >= 0 &&
           this.planForm.annual_additional_discount_percentage >= 0;
  }

  async savePlan() {
    if (!this.isFormValid()) {
      this.notificationService.warning('Complete todos los campos requeridos');
      return;
    }

    const plan = this.selectedPlan();
    if (!plan) return;

    this.isSaving.set(true);
    try {
      const updateRequest: UpdateSubscriptionPlanRequest = {
        monthly_hours: Number(this.planForm.monthly_hours),
        monthly_discount_percentage: Number(this.planForm.monthly_discount_percentage),
        annual_additional_discount_percentage: Number(this.planForm.annual_additional_discount_percentage),
        description: this.planForm.description
      };
      await this.adminService.updateSubscriptionPlan(plan.id, updateRequest);
      this.notificationService.success('Plan actualizado exitosamente');
      
      this.closePlanModal();
      await this.loadPlans();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al actualizar el plan'
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}
