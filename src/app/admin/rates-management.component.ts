import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, RateBaseResponse, RateBranchResponse, CreateRateBaseRequest, UpdateBranchRateRequest } from './services/admin.service';
import { NotificationService } from '../shared/services/notification.service';
import { ButtonComponent } from '../shared/components/button.component';
import { InputComponent } from '../shared/components/input.component';
import { CardComponent } from '../shared/components/card.component';
import { TableComponent, TableColumn } from '../shared/components/table.component';
import { ModalComponent } from '../shared/components/modal.component';
import { BadgeComponent } from '../shared/components/badge.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner.component';

@Component({
  selector: 'app-rates-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    TableComponent,
    ModalComponent,
    BadgeComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Tarifas</h1>
          <p class="text-sm text-gray-600 mt-1">
            Administra las tarifas base y personalizadas por sucursal
          </p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- Tarifa Base Actual -->
        <app-card>
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 mb-1">Tarifa Base Actual</h2>
              <p class="text-sm text-gray-600">
                Esta tarifa se aplica a todas las sucursales que no tengan una tarifa personalizada
              </p>
            </div>
            <app-button 
              variant="primary" 
              size="sm"
              (click)="openCreateBaseRateModal()">
              Nueva Tarifa Base
            </app-button>
          </div>

          @if (currentBaseRate()) {
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
              <div>
                <p class="text-xs text-gray-600 mb-1">Tarifa por Hora</p>
                <p class="text-2xl font-bold text-blue-600">
                  Q{{ currentBaseRate()!.amount_per_hour | number:'1.2-2' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Fecha de Inicio</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(currentBaseRate()!.start_date) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Estado</p>
                <app-badge 
                  [variant]="currentBaseRate()!.is_active ? 'success' : 'default'">
                  {{ currentBaseRate()!.is_active ? 'Activa' : 'Inactiva' }}
                </app-badge>
              </div>
              <div>
                <app-button 
                  variant="ghost" 
                  size="sm"
                  (click)="openRateHistoryModal()">
                  Ver Historial
                </app-button>
              </div>
            </div>
          } @else {
            <div class="text-center py-8 text-gray-500">
              No hay tarifa base configurada
            </div>
          }
        </app-card>

        <!-- Tarifas por Sucursal -->
        <app-card>
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Tarifas por Sucursal</h2>
            <p class="text-sm text-gray-600">
              Configura tarifas personalizadas para sucursales específicas
            </p>
          </div>

          @if (branchRates().length > 0) {
            <app-table
              [data]="branchRates()"
              [columns]="branchRateColumns">
              <ng-template #actions let-row>
                <div class="flex gap-2">
                  <app-button 
                    variant="ghost" 
                    size="sm"
                    (click)="editBranchRate(row)">
                    Editar
                  </app-button>
                  <app-button 
                    variant="danger" 
                    size="sm"
                    (click)="deleteBranchRate(row)">
                    Eliminar
                  </app-button>
                </div>
              </ng-template>
            </app-table>
          } @else {
            <div class="text-center py-8 text-gray-500">
              Todas las sucursales usan la tarifa base
            </div>
          }
        </app-card>
      }

      <!-- Modal: Crear Tarifa Base -->
      <app-modal 
        [isOpen]="showCreateBaseRateModal()" 
        (close)="closeCreateBaseRateModal()">
        <h3 class="text-lg font-semibold mb-4">Crear Nueva Tarifa Base</h3>
        
        <form (ngSubmit)="createBaseRate()" class="space-y-4">
          <div>
            <app-input
              label="Tarifa por Hora (Q)"
              type="number"
              [(value)]="newBaseRate.amount_per_hour"
              placeholder="0.00"
              [required]="true" />
            <p class="text-xs text-gray-500 mt-1">
              Esta tarifa reemplazará la tarifa base actual y se aplicará a todas las sucursales sin tarifa personalizada
            </p>
          </div>

          <div class="flex gap-3 justify-end pt-4">
            <app-button 
              type="button"
              variant="ghost"
              (click)="closeCreateBaseRateModal()">
              Cancelar
            </app-button>
            <app-button 
              type="submit"
              variant="primary"
              [loading]="isSaving()"
              [disabled]="!newBaseRate.amount_per_hour || parseFloat(newBaseRate.amount_per_hour) <= 0">
              Crear Tarifa
            </app-button>
          </div>
        </form>
      </app-modal>

      <!-- Modal: Historial de Tarifas Base -->
      <app-modal 
        [isOpen]="showRateHistoryModal()" 
        (close)="closeRateHistoryModal()">
        <h3 class="text-lg font-semibold mb-4">Historial de Tarifas Base</h3>
        
        @if (isLoadingHistory()) {
          <div class="flex justify-center py-8">
            <app-loading-spinner />
          </div>
        } @else if (rateHistory().length > 0) {
          <div class="space-y-3 max-h-96 overflow-y-auto">
            @for (rate of rateHistory(); track rate.id) {
              <div class="border rounded-lg p-4 hover:bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-semibold text-lg text-gray-900">
                      Q{{ rate.amount_per_hour | number:'1.2-2' }} / hora
                    </p>
                    <p class="text-xs text-gray-600">
                      Inicio: {{ formatDate(rate.start_date) }}
                    </p>
                    @if (rate.end_date) {
                      <p class="text-xs text-gray-600">
                        Fin: {{ formatDate(rate.end_date) }}
                      </p>
                    }
                  </div>
                  <app-badge 
                    [variant]="rate.is_active ? 'success' : 'default'">
                    {{ rate.is_active ? 'Activa' : 'Histórica' }}
                  </app-badge>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-center text-gray-500 py-8">No hay historial disponible</p>
        }

        <div class="flex justify-end pt-4 mt-4 border-t">
          <app-button 
            variant="ghost"
            (click)="closeRateHistoryModal()">
            Cerrar
          </app-button>
        </div>
      </app-modal>

      <!-- Modal: Editar Tarifa de Sucursal -->
      <app-modal 
        [isOpen]="showEditBranchRateModal()" 
        (close)="closeEditBranchRateModal()">
        <h3 class="text-lg font-semibold mb-4">
          Editar Tarifa - {{ selectedBranchRate()?.branch_name }}
        </h3>
        
        <form (ngSubmit)="updateBranchRate()" class="space-y-4">
          <div>
            <app-input
              label="Tarifa por Hora (Q)"
              type="number"
              [(value)]="editBranchRateData.rate_per_hour"
              placeholder="0.00"
              [required]="true" />
            <p class="text-xs text-gray-500 mt-1">
              Esta tarifa solo se aplicará a la sucursal {{ selectedBranchRate()?.branch_name }}
            </p>
          </div>

          <div class="flex gap-3 justify-end pt-4">
            <app-button 
              type="button"
              variant="ghost"
              (click)="closeEditBranchRateModal()">
              Cancelar
            </app-button>
            <app-button 
              type="submit"
              variant="primary"
              [loading]="isSaving()"
              [disabled]="!editBranchRateData.rate_per_hour || parseFloat(editBranchRateData.rate_per_hour) <= 0">
              Actualizar Tarifa
            </app-button>
          </div>
        </form>
      </app-modal>

      <!-- Modal: Confirmar Eliminación -->
      <app-modal 
        [isOpen]="showDeleteConfirmModal()" 
        (close)="closeDeleteConfirmModal()">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Eliminar Tarifa Personalizada</h3>
        
        <p class="text-gray-700 mb-4">
          ¿Estás seguro de eliminar la tarifa personalizada de 
          <strong>{{ selectedBranchRate()?.branch_name }}</strong>?
        </p>
        <p class="text-sm text-gray-600 mb-6">
          La sucursal volverá a usar la tarifa base actual 
          (Q{{ currentBaseRate()?.amount_per_hour | number:'1.2-2' }} / hora).
        </p>

        <div class="flex gap-3 justify-end">
          <app-button 
            variant="ghost"
            (click)="closeDeleteConfirmModal()">
            Cancelar
          </app-button>
          <app-button 
            variant="danger"
            [loading]="isDeleting()"
            (click)="confirmDeleteBranchRate()">
            Eliminar
          </app-button>
        </div>
      </app-modal>
    </div>
  `
})
export class RatesManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  // Helper para templates
  parseFloat = parseFloat;

  // Estado
  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  isLoadingHistory = signal(false);
  
  currentBaseRate = signal<RateBaseResponse | null>(null);
  branchRates = signal<RateBranchResponse[]>([]);
  rateHistory = signal<RateBaseResponse[]>([]);
  selectedBranchRate = signal<RateBranchResponse | null>(null);

  // Modales
  showCreateBaseRateModal = signal(false);
  showRateHistoryModal = signal(false);
  showEditBranchRateModal = signal(false);
  showDeleteConfirmModal = signal(false);

  // Formularios
  newBaseRate: { amount_per_hour: string } = {
    amount_per_hour: ''
  };

  editBranchRateData: { rate_per_hour: string } = {
    rate_per_hour: ''
  };

  // Columnas de tabla
  branchRateColumns: TableColumn[] = [
    { key: 'branch_id', label: 'ID', sortable: true },
    { key: 'branch_name', label: 'Sucursal', sortable: true },
    { key: 'rate_per_hour', label: 'Tarifa/Hora', sortable: true },
    { key: 'is_active', label: 'Estado', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false }
  ];

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      const [currentRate, branches] = await Promise.all([
        this.adminService.getCurrentRate(),
        this.adminService.listBranchRates()
      ]);
      
      this.currentBaseRate.set(currentRate);
      this.branchRates.set(branches);
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al cargar las tarifas'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  // ==================== Tarifa Base ====================

  openCreateBaseRateModal() {
    this.newBaseRate = { amount_per_hour: '' };
    this.showCreateBaseRateModal.set(true);
  }

  closeCreateBaseRateModal() {
    this.showCreateBaseRateModal.set(false);
  }

  async createBaseRate() {
    const amount = parseFloat(this.newBaseRate.amount_per_hour);
    if (!amount || amount <= 0) {
      this.notificationService.warning('Ingresa una tarifa válida');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.adminService.createBaseRate({ amount_per_hour: amount });
      this.notificationService.success('Tarifa base creada exitosamente');
      this.closeCreateBaseRateModal();
      await this.loadData();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al crear la tarifa base'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  async openRateHistoryModal() {
    this.showRateHistoryModal.set(true);
    this.isLoadingHistory.set(true);
    try {
      const history = await this.adminService.getRateHistory();
      this.rateHistory.set(history);
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al cargar el historial'
      );
    } finally {
      this.isLoadingHistory.set(false);
    }
  }

  closeRateHistoryModal() {
    this.showRateHistoryModal.set(false);
  }

  // ==================== Tarifas por Sucursal ====================

  editBranchRate(branch: RateBranchResponse) {
    this.selectedBranchRate.set(branch);
    this.editBranchRateData = {
      rate_per_hour: branch.rate_per_hour.toString()
    };
    this.showEditBranchRateModal.set(true);
  }

  closeEditBranchRateModal() {
    this.showEditBranchRateModal.set(false);
    this.selectedBranchRate.set(null);
  }

  async updateBranchRate() {
    const branch = this.selectedBranchRate();
    const rate = parseFloat(this.editBranchRateData.rate_per_hour);
    if (!branch || !rate || rate <= 0) {
      this.notificationService.warning('Ingresa una tarifa válida');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.adminService.updateBranchRate(
        branch.branch_id, 
        { rate_per_hour: rate }
      );
      this.notificationService.success('Tarifa actualizada exitosamente');
      this.closeEditBranchRateModal();
      await this.loadData();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al actualizar la tarifa'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteBranchRate(branch: RateBranchResponse) {
    this.selectedBranchRate.set(branch);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal.set(false);
    this.selectedBranchRate.set(null);
  }

  async confirmDeleteBranchRate() {
    const branch = this.selectedBranchRate();
    if (!branch) return;

    this.isDeleting.set(true);
    try {
      await this.adminService.deleteBranchRate(branch.branch_id);
      this.notificationService.success('Tarifa eliminada. La sucursal usará la tarifa base.');
      this.closeDeleteConfirmModal();
      await this.loadData();
    } catch (error: any) {
      this.notificationService.error(
        error.error?.message || 'Error al eliminar la tarifa'
      );
    } finally {
      this.isDeleting.set(false);
    }
  }

  // Helpers
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
