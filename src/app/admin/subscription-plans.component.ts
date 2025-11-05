import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SubscriptionPlanResponse, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from './services/admin.service';
import { NotificationService } from '../shared/services/notification.service';

/**
 * Gestión de Planes de Suscripción
 * CRUD completo usando SOLO endpoints reales del backend
 * Endpoints: GET/POST /subscription-plans, GET/PUT/DELETE /subscription-plans/{id}
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
            Gestiona los planes de suscripción mensual disponibles
          </p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          Nuevo Plan
        </button>
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

              <div class="flex gap-2 pt-3 border-t">
                <button 
                  (click)="editPlan(plan)"
                  class="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded">
                  Editar
                </button>
                <button 
                  (click)="deletePlan(plan)"
                  class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded">
                  Eliminar
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

      <!-- Modal: Crear/Editar Plan -->
      @if (showPlanModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 class="text-lg font-semibold mb-4">
              {{ isEditing() ? 'Editar Plan' : 'Nuevo Plan' }}
            </h3>
            
            <form (ngSubmit)="savePlan()" class="space-y-4">
              @if (!isEditing()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Plan *
                  </label>
                  <select
                    [(ngModel)]="planForm.plan_type_id"
                    name="plan_type_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar tipo</option>
                    <option value="1">Plan Básico (A)</option>
                    <option value="2">Plan Estándar (B)</option>
                    <option value="3">Plan Premium (C)</option>
                    <option value="4">Plan Empresarial (D)</option>
                  </select>
                </div>
              }

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
                  {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal: Confirmar Eliminación -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 class="text-lg font-semibold mb-4 text-red-600">Eliminar Plan</h3>
            
            <p class="text-gray-700 mb-4">
              ¿Estás seguro de eliminar el plan 
              <strong>{{ selectedPlan()?.plan_type_name }}</strong>?
            </p>
            <p class="text-sm text-gray-600 mb-6">
              Esta acción desactivará el plan y no estará disponible para nuevas suscripciones.
            </p>

            <div class="flex gap-3 justify-end">
              <button 
                (click)="closeDeleteModal()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button 
                [disabled]="isDeleting()"
                (click)="confirmDelete()"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {{ isDeleting() ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
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
  isDeleting = signal(false);
  
  plans = signal<SubscriptionPlanResponse[]>([]);
  selectedPlan = signal<SubscriptionPlanResponse | null>(null);
  isEditing = signal(false);

  // Modales
  showPlanModal = signal(false);
  showDeleteModal = signal(false);

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
      this.plans.set(plans);
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al cargar los planes'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.planForm = {
      plan_type_id: '',
      monthly_hours: '',
      monthly_discount_percentage: '',
      annual_additional_discount_percentage: '',
      description: ''
    };
    this.showPlanModal.set(true);
  }

  editPlan(plan: SubscriptionPlanResponse) {
    this.isEditing.set(true);
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
    if (this.isEditing()) {
      return this.planForm.monthly_hours > 0 &&
             this.planForm.monthly_discount_percentage >= 0 &&
             this.planForm.annual_additional_discount_percentage >= 0;
    }
    
    return this.planForm.plan_type_id &&
           this.planForm.monthly_hours > 0 &&
           this.planForm.monthly_discount_percentage >= 0 &&
           this.planForm.annual_additional_discount_percentage >= 0;
  }

  async savePlan() {
    if (!this.isFormValid()) {
      this.notificationService.warning('Complete todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    try {
      if (this.isEditing() && this.selectedPlan()) {
        const updateRequest: UpdateSubscriptionPlanRequest = {
          monthly_hours: Number(this.planForm.monthly_hours),
          monthly_discount_percentage: Number(this.planForm.monthly_discount_percentage),
          annual_additional_discount_percentage: Number(this.planForm.annual_additional_discount_percentage),
          description: this.planForm.description
        };
        await this.adminService.updateSubscriptionPlan(this.selectedPlan()!.id, updateRequest);
        this.notificationService.success('Plan actualizado exitosamente');
      } else {
        const createRequest: CreateSubscriptionPlanRequest = {
          plan_type_id: Number(this.planForm.plan_type_id),
          monthly_hours: Number(this.planForm.monthly_hours),
          monthly_discount_percentage: Number(this.planForm.monthly_discount_percentage),
          annual_additional_discount_percentage: Number(this.planForm.annual_additional_discount_percentage),
          description: this.planForm.description
        };
        await this.adminService.createSubscriptionPlan(createRequest);
        this.notificationService.success('Plan creado exitosamente');
      }
      
      this.closePlanModal();
      await this.loadPlans();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al guardar el plan'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  deletePlan(plan: SubscriptionPlanResponse) {
    this.selectedPlan.set(plan);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedPlan.set(null);
  }

  async confirmDelete() {
    const plan = this.selectedPlan();
    if (!plan) return;

    this.isDeleting.set(true);
    try {
      await this.adminService.deleteSubscriptionPlan(plan.id);
      this.notificationService.success('Plan eliminado exitosamente');
      this.closeDeleteModal();
      await this.loadPlans();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al eliminar el plan'
      );
    } finally {
      this.isDeleting.set(false);
    }
  }
}
