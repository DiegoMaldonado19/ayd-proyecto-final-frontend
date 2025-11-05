import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogsService, AuditLogResponse, PageResponse } from './services/audit-logs.service';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-discount-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">🔍 Bitácora de Auditoría</h1>
        <p class="text-gray-600 mt-1">Historial completo de operaciones del sistema</p>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Filtros</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Módulo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Módulo</label>
            <select [(ngModel)]="filterModule" (change)="applyFilters()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Todos</option>
              <option value="Administracion">Administración</option>
              <option value="Suscripciones">Suscripciones</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Flotillas">Flotillas</option>
            </select>
          </div>

          <!-- Usuario ID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Usuario ID</label>
            <input type="number" [(ngModel)]="filterUserId" (change)="applyFilters()"
                   placeholder="Ej: 1"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Fecha Inicio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input type="datetime-local" [(ngModel)]="filterStartDate" (change)="applyFilters()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Fecha Fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input type="datetime-local" [(ngModel)]="filterEndDate" (change)="applyFilters()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button (click)="clearFilters()" 
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Tabla de Logs -->
      @if (!isLoading() && logs().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-gray-50">
                    <!-- ID -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{{ log.id }}
                    </td>

                    <!-- Fecha -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(log.created_at) }}
                    </td>

                    <!-- Usuario -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <div class="font-medium text-gray-900">ID: {{ log.user_id }}</div>
                      <div class="text-gray-500 text-xs">{{ log.user_email }}</div>
                    </td>

                    <!-- Módulo -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full"
                            [class]="getModuleClass(log.module)">
                        {{ log.module }}
                      </span>
                    </td>

                    <!-- Entidad -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ log.entity }}
                    </td>

                    <!-- Operación -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full"
                            [class]="getOperationClass(log.operation_type)">
                        {{ log.operation_type }}
                      </span>
                    </td>

                    <!-- Descripción -->
                    <td class="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div class="truncate" [title]="log.description">
                        {{ log.description }}
                      </div>
                    </td>

                    <!-- IP -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ log.client_ip || '-' }}
                    </td>

                    <!-- Acciones -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button (click)="showDetails(log)" 
                              class="text-blue-600 hover:text-blue-800">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ currentPage() * pageSize() + 1 }}</span> a 
              <span class="font-medium">{{ Math.min((currentPage() + 1) * pageSize(), totalElements()) }}</span> de 
              <span class="font-medium">{{ totalElements() }}</span> registros
            </div>

            <div class="flex gap-2">
              <button [disabled]="currentPage() === 0" (click)="previousPage()"
                      class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                ← Anterior
              </button>
              
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">Página {{ currentPage() + 1 }} de {{ totalPages() }}</span>
              </div>

              <button [disabled]="currentPage() >= totalPages() - 1" (click)="nextPage()"
                      class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && logs().length === 0) {
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-500 text-lg">No se encontraron registros de auditoría</p>
          <p class="text-gray-400 text-sm mt-2">Ajusta los filtros o intenta con otros criterios</p>
        </div>
      }

      <!-- Modal de Detalles -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
          <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold">Detalles del Registro #{{ selectedLog()?.id }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            @if (selectedLog()) {
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Usuario</label>
                    <p class="mt-1">{{ selectedLog()!.user_email }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Fecha</label>
                    <p class="mt-1">{{ formatDate(selectedLog()!.created_at) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Módulo</label>
                    <p class="mt-1">{{ selectedLog()!.module }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Operación</label>
                    <p class="mt-1">{{ selectedLog()!.operation_type }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Entidad</label>
                    <p class="mt-1">{{ selectedLog()!.entity }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">IP Cliente</label>
                    <p class="mt-1">{{ selectedLog()!.client_ip || 'N/A' }}</p>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-500">Descripción</label>
                  <p class="mt-1">{{ selectedLog()!.description }}</p>
                </div>

                @if (selectedLog()!.previous_values) {
                  <div>
                    <label class="text-sm font-medium text-gray-500">Valores Anteriores</label>
                    <pre class="mt-1 p-3 bg-red-50 rounded text-xs overflow-x-auto">{{ formatJSON(selectedLog()!.previous_values) }}</pre>
                  </div>
                }

                @if (selectedLog()!.new_values) {
                  <div>
                    <label class="text-sm font-medium text-gray-500">Valores Nuevos</label>
                    <pre class="mt-1 p-3 bg-green-50 rounded text-xs overflow-x-auto">{{ formatJSON(selectedLog()!.new_values) }}</pre>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DiscountAuditComponent implements OnInit {
  private auditService = inject(AuditLogsService);
  private notification = inject(NotificationService);

  // State
  isLoading = signal(false);
  logs = signal<AuditLogResponse[]>([]);
  
  // Pagination
  currentPage = signal(0);
  pageSize = signal(20);
  totalElements = signal(0);
  totalPages = signal(0);

  // Filters
  filterModule = '';
  filterUserId: number | null = null;
  filterStartDate = '';
  filterEndDate = '';

  // Modal
  showModal = signal(false);
  selectedLog = signal<AuditLogResponse | null>(null);

  // Utils
  Math = Math;

  async ngOnInit() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.isLoading.set(true);
    try {
      let response: PageResponse<AuditLogResponse>;

      // Aplicar filtros según lo seleccionado
      if (this.filterStartDate && this.filterEndDate) {
        // Filtro por rango de fechas - asegurar formato ISO completo
        const startISO = this.ensureISOFormat(this.filterStartDate);
        const endISO = this.ensureISOFormat(this.filterEndDate);
        
        response = await this.auditService.listAuditLogsByDateRange(
          startISO,
          endISO,
          this.currentPage(),
          this.pageSize()
        );
      } else if (this.filterUserId) {
        // Filtro por usuario
        response = await this.auditService.listAuditLogsByUser(
          this.filterUserId,
          this.currentPage(),
          this.pageSize()
        );
      } else if (this.filterModule) {
        // Filtro por módulo
        response = await this.auditService.listAuditLogsByModule(
          this.filterModule,
          this.currentPage(),
          this.pageSize()
        );
      } else {
        // Sin filtros
        response = await this.auditService.listAuditLogs(
          this.currentPage(),
          this.pageSize()
        );
      }

      this.logs.set(response.content);
      this.totalElements.set(response.totalElements);
      this.totalPages.set(response.totalPages);
      
    } catch (error: any) {
      console.error('Error cargando logs:', error);
      this.notification.error('Error al cargar los registros de auditoría');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Asegura que la fecha tenga formato ISO completo: yyyy-MM-ddTHH:mm:ss
   * El input datetime-local devuelve: yyyy-MM-ddTHH:mm (sin segundos)
   */
  private ensureISOFormat(dateStr: string): string {
    // Si ya tiene segundos, devolverlo tal cual
    if (dateStr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dateStr;
    }
    // Si solo tiene minutos, agregar :00 para segundos
    if (dateStr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return `${dateStr}:00`;
    }
    // Si es otro formato, retornar tal cual y dejar que el backend maneje el error
    return dateStr;
  }

  async applyFilters() {
    this.currentPage.set(0);
    await this.loadLogs();
  }

  clearFilters() {
    this.filterModule = '';
    this.filterUserId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.applyFilters();
  }

  async previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      await this.loadLogs();
    }
  }

  async nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      await this.loadLogs();
    }
  }

  showDetails(log: AuditLogResponse) {
    this.selectedLog.set(log);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedLog.set(null);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatJSON(jsonStr: string | null): string {
    if (!jsonStr) return 'N/A';
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch {
      return jsonStr;
    }
  }

  getModuleClass(module: string): string {
    const classes: Record<string, string> = {
      'Administracion': 'bg-purple-100 text-purple-800',
      'Suscripciones': 'bg-blue-100 text-blue-800',
      'Seguridad': 'bg-red-100 text-red-800',
      'Flotillas': 'bg-green-100 text-green-800'
    };
    return classes[module] || 'bg-gray-100 text-gray-800';
  }

  getOperationClass(operation: string): string {
    const classes: Record<string, string> = {
      'Insercion': 'bg-green-100 text-green-800',
      'Actualizacion': 'bg-yellow-100 text-yellow-800',
      'Eliminacion': 'bg-red-100 text-red-800',
      'Cierre de Sesion': 'bg-gray-100 text-gray-800',
      'Inicio de Sesion': 'bg-blue-100 text-blue-800'
    };
    return classes[operation] || 'bg-gray-100 text-gray-800';
  }
}
