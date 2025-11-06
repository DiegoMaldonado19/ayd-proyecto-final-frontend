import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, CommerceResponse, CreateCommerceRequest, UpdateCommerceRequest, ConfigureBenefitRequest, UpdateBenefitRequest, BenefitResponse } from './services/admin.service';
import { NotificationService } from '../shared/services/notification.service';

/**
 * Componente para gestión de comercios afiliados
 * CRUD completo usando endpoints reales del backend
 */
@Component({
  selector: 'app-commerces-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Comercios Afiliados</h1>
          <p class="text-gray-600 mt-1">Administra los comercios y sus beneficios</p>
        </div>
        
        <button
          (click)="showCreateModal.set(true)"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Comercio
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else if (commerces().length === 0) {
          <div class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p>No hay comercios registrados</p>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comercio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (commerce of commerces(); track commerce.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ commerce.name }}</div>
                      <div class="text-sm text-gray-500">NIT: {{ commerce.tax_id }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Q{{ commerce.rate_per_hour }}/hora
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm text-gray-900">{{ commerce.contact_name || 'N/A' }}</div>
                      <div class="text-sm text-gray-500">{{ commerce.phone || 'N/A' }}</div>
                      <div class="text-sm text-gray-500">{{ commerce.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (commerce.is_active) {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    } @else {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="configureBenefits(commerce)"
                      class="text-green-600 hover:text-green-900 mr-3"
                      title="Configurar beneficios"
                    >
                      Beneficios
                    </button>
                    <button
                      (click)="editCommerce(commerce)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      (click)="openDeleteModal(commerce)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Create/Edit Commerce Modal -->
      @if (showCreateModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ showCreateModal() ? 'Nuevo Comercio' : 'Editar Comercio' }}
              </h3>

              <form (ngSubmit)="saveCommerce()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Comercio *
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="commerceForm.name"
                      name="name"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Comercio XYZ"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      NIT *
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="commerceForm.tax_id"
                      name="tax_id"
                      [required]="!isEditing()"
                      [readonly]="isEditing()"
                      [class.bg-gray-100]="isEditing()"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567-8"
                    >
                    @if (isEditing()) {
                      <p class="text-xs text-gray-500 mt-1">El NIT no se puede modificar</p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tarifa por Hora (Q) *
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="commerceForm.rate_per_hour"
                      name="rate_per_hour"
                      required
                      min="0.01"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5.00"
                    >
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Persona de Contacto
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="commerceForm.contact_name"
                      name="contact_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      [(ngModel)]="commerceForm.phone"
                      name="phone"
                      pattern="[0-9]{8,15}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="22222222"
                    >
                    <p class="text-xs text-gray-500 mt-1">8-15 dígitos</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      [(ngModel)]="commerceForm.email"
                      name="email"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contacto@comercio.com"
                    >
                  </div>
                </div>

                @if (errorMessage()) {
                  <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                  </div>
                }

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="!isFormValid() || isSaving()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar' : 'Crear') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Benefits Modal -->
      @if (showBenefitsModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Configurar Beneficios
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Comercio: <span class="font-semibold">{{ selectedCommerce()?.name }}</span>
              </p>

              <!-- Beneficios Existentes -->
              @if (branches().length > 0) {
                <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-blue-900 mb-3">📋 Beneficios Configurados</h4>
                  <div class="space-y-2">
                    @for (branch of branches(); track branch.id) {
                      @if (branch.benefit) {
                        <div class="bg-white rounded border border-blue-200 p-3">
                          <div class="flex justify-between items-start gap-3">
                            <div class="flex-1">
                              <div class="font-medium text-gray-900">{{ branch.name }}</div>
                              <div class="text-sm text-gray-600 mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {{ branch.benefit.benefit_type_name }}
                                </span>
                                <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  {{ branch.benefit.settlement_period_name }}
                                </span>
                              </div>
                            </div>
                            <div class="flex items-center gap-2">
                              @if (branch.benefit.is_active) {
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Activo
                                </span>
                              } @else {
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactivo
                                </span>
                              }
                              <button
                                type="button"
                                (click)="openEditBenefitModal(branch.benefit)"
                                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar beneficio"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                (click)="openDeleteBenefitModal(branch.benefit)"
                                class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar beneficio"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }

              <h4 class="text-sm font-semibold text-gray-900 mb-3">➕ Agregar Nuevo Beneficio</h4>

              <form (ngSubmit)="saveBenefit()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal *
                  </label>
                  <select
                    [(ngModel)]="benefitForm.branch_id"
                    name="branch_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar sucursal</option>
                    @for (branch of availableBranches(); track branch.id) {
                      <option [value]="branch.id">{{ branch.name }}</option>
                    }
                  </select>
                  <p class="text-xs text-gray-500 mt-1">Sucursal donde aplica el beneficio</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Beneficio *
                  </label>
                  <select
                    [(ngModel)]="benefitForm.benefit_type"
                    name="benefit_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="NO_CONSUME_HOURS">No Descontar Horas (Suscriptores)</option>
                    <option value="DIRECT_DISCOUNT">Descuento Directo (No Suscriptores)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    No Descontar Horas: No consume del bolsón de clientes con suscripción<br>
                    Descuento Directo: Reduce tiempo facturable a clientes sin suscripción
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Período de Liquidación *
                  </label>
                  <select
                    [(ngModel)]="benefitForm.settlement_period"
                    name="settlement_period"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar período</option>
                    <option value="DAILY">Diario</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensual</option>
                    <option value="ANNUAL">Anual</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Diario: Liquidar cada día | Semanal: Cada semana | Mensual: Cada mes | Anual: Una vez al año
                  </p>
                </div>

                @if (errorMessage()) {
                  <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                  </div>
                }

                <div class="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    (click)="closeBenefitsModal()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="!isBenefitFormValid() || isSaving()"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSaving() ? 'Guardando...' : 'Guardar Beneficio' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-red-600 mb-4">
                Eliminar Comercio
              </h3>

              <p class="text-gray-700 mb-2">
                ¿Estás seguro de eliminar el comercio 
                <strong>{{ selectedCommerce()?.name }}</strong>?
              </p>
              <p class="text-sm text-gray-600 mb-6">
                NIT: <strong>{{ selectedCommerce()?.tax_id }}</strong><br>
                Esta acción no se puede deshacer.
              </p>

              @if (errorMessage()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                </div>
              }

              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeDeleteModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmDelete()"
                  [disabled]="isSaving()"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving() ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Edit Benefit Modal -->
      @if (showEditBenefitModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Editar Beneficio
              </h3>

              <p class="text-sm text-gray-600 mb-4">
                Sucursal: <span class="font-semibold">{{ selectedBenefit()?.branch_name }}</span>
              </p>

              <form (submit)="updateBenefit(); $event.preventDefault()">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Beneficio *
                    </label>
                    <select
                      [(ngModel)]="benefitForm.benefit_type"
                      name="benefit_type"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="NO_CONSUME_HOURS">No Descontar Horas (Suscriptores)</option>
                      <option value="DIRECT_DISCOUNT">Descuento Directo (No Suscriptores)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Período de Liquidación *
                    </label>
                    <select
                      [(ngModel)]="benefitForm.settlement_period"
                      name="settlement_period"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar período</option>
                      <option value="DAILY">Diario</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="MONTHLY">Mensual</option>
                      <option value="ANNUAL">Anual</option>
                    </select>
                  </div>

                  @if (errorMessage()) {
                    <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                    </div>
                  }
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    (click)="closeEditBenefitModal()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="!isEditBenefitFormValid() || isSaving()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSaving() ? 'Actualizando...' : 'Actualizar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Benefit Confirmation Modal -->
      @if (showDeleteBenefitModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-red-600 mb-4">
                Eliminar Beneficio
              </h3>

              <p class="text-gray-700 mb-4">
                ¿Estás seguro de eliminar el beneficio de la sucursal 
                <strong>{{ selectedBenefit()?.branch_name }}</strong>?
              </p>

              <div class="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm text-gray-700">
                  <strong>Tipo:</strong> {{ selectedBenefit()?.benefit_type_name }}<br>
                  <strong>Período:</strong> {{ selectedBenefit()?.settlement_period_name }}
                </p>
              </div>

              <p class="text-sm text-red-600 mb-6">
                ⚠️ Esta acción no se puede deshacer.
              </p>

              @if (errorMessage()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                </div>
              }

              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeDeleteBenefitModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmDeleteBenefit()"
                  [disabled]="isSaving()"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving() ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CommercesManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  // Estado
  isLoading = signal(false);
  isSaving = signal(false);
  isEditing = signal(false);
  errorMessage = signal('');

  commerces = signal<CommerceResponse[]>([]);
  branches = signal<Array<{ id: number; name: string; benefit?: BenefitResponse }>>([]);
  selectedCommerce = signal<CommerceResponse | null>(null);

  // Modales
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showBenefitsModal = signal(false);
  showDeleteModal = signal(false);
  showEditBenefitModal = signal(false);
  showDeleteBenefitModal = signal(false);

  // Beneficio seleccionado para editar/eliminar
  selectedBenefit = signal<BenefitResponse | null>(null);

  // Formularios
  commerceForm: any = {
    name: '',
    tax_id: '',
    contact_name: '',
    phone: '',
    email: '',
    rate_per_hour: 0
  };

  benefitForm: any = {
    branch_id: '',
    benefit_type: '',
    settlement_period: ''
  };

  async ngOnInit() {
    await this.loadCommerces();
    await this.loadBranches();
  }

  // Computed para filtrar sucursales que no tienen beneficio configurado
  availableBranches = signal<Array<{ id: number; name: string }>>([]);

  async loadCommerces() {
    this.isLoading.set(true);
    try {
      const response = await this.adminService.listCommerces();
      this.commerces.set(response.content);
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al cargar comercios'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadBranches() {
    try {
      // Cargar todas las sucursales del sistema
      // TODO: Implementar endpoint GET /branches cuando exista
      this.availableBranches.set([
        { id: 1, name: 'Sucursal Central' },
        { id: 2, name: 'Sucursal Norte' },
        { id: 3, name: 'Sucursal Sur' }
      ]);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.commerceForm = {
      name: '',
      tax_id: '',
      contact_name: '',
      phone: '',
      email: '',
      rate_per_hour: 0
    };
    this.showCreateModal.set(true);
  }

  editCommerce(commerce: CommerceResponse) {
    this.isEditing.set(true);
    this.selectedCommerce.set(commerce);
    this.commerceForm = {
      name: commerce.name,
      tax_id: commerce.tax_id,
      contact_name: commerce.contact_name || '',
      phone: commerce.phone || '',
      email: commerce.email || '',
      rate_per_hour: commerce.rate_per_hour
    };
    this.showEditModal.set(true);
  }

  openDeleteModal(commerce: CommerceResponse) {
    this.selectedCommerce.set(commerce);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedCommerce.set(null);
    this.errorMessage.set('');
  }

  async confirmDelete() {
    const commerce = this.selectedCommerce();
    if (!commerce) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    try {
      await this.adminService.deleteCommerce(commerce.id);
      this.notificationService.success('Comercio eliminado exitosamente');
      this.closeDeleteModal();
      await this.loadCommerces();
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Error al eliminar comercio'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  async configureBenefits(commerce: CommerceResponse) {
    this.selectedCommerce.set(commerce);
    this.benefitForm = {
      branch_id: '',
      benefit_type: '',
      settlement_period: ''
    };
    
    // Cargar beneficios existentes del comercio
    await this.loadCommerceBenefits(commerce.id);
    
    this.showBenefitsModal.set(true);
  }

  async loadCommerceBenefits(commerceId: number) {
    try {
      const benefits = await this.adminService.getCommerceBenefits(commerceId);
      // Mapear beneficios con información de sucursales
      const branchesWithBenefits = benefits.map(b => ({
        id: b.branch_id,
        name: b.branch_name,
        benefit: b
      }));
      this.branches.set(branchesWithBenefits);
    } catch (error) {
      console.error('Error loading benefits:', error);
      this.branches.set([]);
    }
  }

  isFormValid(): boolean {
    const form = this.commerceForm;
    
    if (!form.name || !form.rate_per_hour || form.rate_per_hour <= 0) {
      return false;
    }
    
    if (!this.isEditing() && !form.tax_id) {
      return false;
    }
    
    if (form.phone && !/^[0-9]{8,15}$/.test(form.phone)) {
      return false;
    }
    
    return true;
  }

  isBenefitFormValid(): boolean {
    const form = this.benefitForm;
    return form.branch_id && form.benefit_type && form.settlement_period;
  }

  isEditBenefitFormValid(): boolean {
    const form = this.benefitForm;
    return form.benefit_type && form.settlement_period;
  }

  async saveCommerce() {
    if (!this.isFormValid()) {
      this.notificationService.warning('Complete todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      // Limpiar campos opcionales vacíos
      const payload: any = {
        name: this.commerceForm.name,
        rate_per_hour: Number(this.commerceForm.rate_per_hour)
      };

      if (this.commerceForm.contact_name) payload.contact_name = this.commerceForm.contact_name;
      if (this.commerceForm.phone) payload.phone = this.commerceForm.phone;
      if (this.commerceForm.email) payload.email = this.commerceForm.email;

      if (this.isEditing() && this.selectedCommerce()) {
        await this.adminService.updateCommerce(this.selectedCommerce()!.id, payload);
        this.notificationService.success('Comercio actualizado exitosamente');
      } else {
        payload.tax_id = this.commerceForm.tax_id;
        await this.adminService.createCommerce(payload);
        this.notificationService.success('Comercio creado exitosamente');
      }

      this.closeModal();
      await this.loadCommerces();
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Error al guardar comercio'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  async saveBenefit() {
    if (!this.isBenefitFormValid() || !this.selectedCommerce()) {
      this.notificationService.warning('Complete todos los campos');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      await this.adminService.configureBenefit(
        this.selectedCommerce()!.id,
        {
          branch_id: Number(this.benefitForm.branch_id),
          benefit_type: this.benefitForm.benefit_type,
          settlement_period: this.benefitForm.settlement_period
        }
      );

      this.notificationService.success('Beneficio configurado exitosamente');
      this.closeBenefitsModal();
      // Recargar beneficios del comercio
      if (this.selectedCommerce()) {
        await this.loadCommerceBenefits(this.selectedCommerce()!.id);
      }
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Error al configurar beneficio'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.selectedCommerce.set(null);
    this.isEditing.set(false);
    this.commerceForm = {
      name: '',
      tax_id: '',
      contact_name: '',
      phone: '',
      email: '',
      rate_per_hour: 0
    };
    this.errorMessage.set('');
  }

  closeBenefitsModal() {
    this.showBenefitsModal.set(false);
    this.selectedCommerce.set(null);
    this.benefitForm = {
      branch_id: '',
      benefit_type: '',
      settlement_period: ''
    };
    this.errorMessage.set('');
  }

  openEditBenefitModal(benefit: BenefitResponse) {
    this.selectedBenefit.set(benefit);
    this.benefitForm = {
      branch_id: benefit.branch_id.toString(),
      benefit_type: benefit.benefit_type_code,
      settlement_period: benefit.settlement_period_code
    };
    this.showEditBenefitModal.set(true);
  }

  closeEditBenefitModal() {
    this.showEditBenefitModal.set(false);
    this.selectedBenefit.set(null);
    this.benefitForm = {
      branch_id: '',
      benefit_type: '',
      settlement_period: ''
    };
    this.errorMessage.set('');
  }

  async updateBenefit() {
    if (!this.isEditBenefitFormValid() || !this.selectedCommerce() || !this.selectedBenefit()) {
      this.notificationService.warning('Complete todos los campos');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      await this.adminService.updateBenefit(
        this.selectedCommerce()!.id,
        this.selectedBenefit()!.id,
        {
          benefit_type: this.benefitForm.benefit_type,
          settlement_period: this.benefitForm.settlement_period
        }
      );

      this.notificationService.success('Beneficio actualizado exitosamente');
      this.closeEditBenefitModal();
      
      // Recargar beneficios del comercio
      if (this.selectedCommerce()) {
        await this.loadCommerceBenefits(this.selectedCommerce()!.id);
      }
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Error al actualizar beneficio'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  openDeleteBenefitModal(benefit: BenefitResponse) {
    this.selectedBenefit.set(benefit);
    this.showDeleteBenefitModal.set(true);
  }

  closeDeleteBenefitModal() {
    this.showDeleteBenefitModal.set(false);
    this.selectedBenefit.set(null);
    this.errorMessage.set('');
  }

  async confirmDeleteBenefit() {
    if (!this.selectedCommerce() || !this.selectedBenefit()) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      await this.adminService.deleteBenefit(
        this.selectedCommerce()!.id,
        this.selectedBenefit()!.id
      );

      this.notificationService.success('Beneficio eliminado exitosamente');
      this.closeDeleteBenefitModal();
      
      // Recargar beneficios del comercio
      if (this.selectedCommerce()) {
        await this.loadCommerceBenefits(this.selectedCommerce()!.id);
      }
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Error al eliminar beneficio'
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}

