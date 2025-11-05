import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService, TicketResponse } from './services/ticket.service';
import { NotificationService } from '../shared/services/notification.service';
import { ModalComponent } from '../shared/components/modal.component';

/**
 * Componente para ver el historial de salidas completadas
 * 
 * Roles permitidos: Operador Sucursal, Administrador, Operador Back Office
 */
@Component({
  selector: 'app-ticket-exits-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header -->
        <div class="mb-8">
          <button 
            (click)="goBack()"
            class="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2">
            ← Volver
          </button>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">📋 Historial de Salidas</h1>
              <p class="text-gray-600 mt-2">Consulte todas las salidas completadas</p>
            </div>
            <button 
              (click)="loadExits()"
              [disabled]="isLoading()"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                🔄
              }
              Actualizar
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- Search by folio or plate -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar por Folio o Placa</label>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="filterExits()"
                placeholder="Ej: ABC-1234 o folio"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase">
            </div>

            <!-- Filter by vehicle type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
              <select 
                [(ngModel)]="filterVehicleType"
                (change)="filterExits()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Todos</option>
                <option value="Dos Ruedas">🏍️ Dos Ruedas (2R)</option>
                <option value="Cuatro Ruedas">� Cuatro Ruedas (4R)</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Salidas</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ exits().length }}</p>
              </div>
              <div class="text-4xl">📋</div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Motos (2R)</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ countByType('Dos Ruedas') }}</p>
              </div>
              <div class="text-4xl">🏍️</div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Autos/Pickups (4R)</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ countByType('Cuatro Ruedas') }}</p>
              </div>
              <div class="text-4xl">�</div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          
          @if (isLoading()) {
            <div class="flex items-center justify-center py-20">
              <svg class="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          } @else if (filteredExits().length === 0) {
            <div class="text-center py-20">
              <div class="text-6xl mb-4">📭</div>
              <p class="text-gray-600 text-lg">No se encontraron salidas</p>
              @if (searchQuery || filterVehicleType) {
                <button 
                  (click)="clearFilters()"
                  class="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                  Limpiar filtros
                </button>
              }
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrada</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salida</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duración</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Suscripción</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (exit of filteredExits(); track exit.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-mono text-sm font-semibold text-gray-900">{{ exit.folio }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-medium text-gray-900">{{ exit.licensePlate }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-600">{{ getVehicleIcon(exit.vehicleTypeName) }} {{ exit.vehicleTypeName }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {{ formatTime(exit.entryTime) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {{ formatTime(exit.exitTime!) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-medium text-blue-600">{{ getDuration(exit.entryTime, exit.exitTime!) }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        @if (exit.isSubscriber) {
                          <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ Sí</span>
                        } @else {
                          <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">No</span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          (click)="viewDetails(exit)"
                          class="text-blue-600 hover:text-blue-700 font-medium">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination info -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Mostrando {{ filteredExits().length }} de {{ exits().length }} salidas
            </div>
          }

        </div>

      </div>
    </div>

    <!-- Modal de Detalles -->
    <app-modal 
      [isOpen]="!!selectedExit()"
      [title]="'Detalles de la Salida'"
      [showClose]="true"
      (closed)="selectedExit.set(null)">
      
      @if (selectedExit()) {
        <div class="space-y-4">
          
          <!-- Información del ticket -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Folio:</span>
              <span class="font-mono font-semibold">{{ selectedExit()!.folio }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Placa:</span>
              <span class="font-semibold">{{ selectedExit()!.licensePlate }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tipo de Vehículo:</span>
              <span>{{ getVehicleIcon(selectedExit()!.vehicleTypeName) }} {{ selectedExit()!.vehicleTypeName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Sucursal ID:</span>
              <span>{{ selectedExit()!.branchId }}</span>
            </div>
          </div>

          <!-- Tiempos -->
          <div class="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 class="font-semibold text-blue-900 mb-2">⏱️ Tiempos</h4>
            <div class="flex justify-between text-sm">
              <span class="text-blue-700">Entrada:</span>
              <span class="font-medium">{{ formatTimeFull(selectedExit()!.entryTime) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-blue-700">Salida:</span>
              <span class="font-medium">{{ formatTimeFull(selectedExit()!.exitTime!) }}</span>
            </div>
            <div class="flex justify-between text-sm border-t border-blue-200 pt-2">
              <span class="text-blue-700 font-semibold">Duración Total:</span>
              <span class="font-bold text-blue-900">{{ getDuration(selectedExit()!.entryTime, selectedExit()!.exitTime!) }}</span>
            </div>
          </div>

          <!-- Suscripción -->
          @if (selectedExit()!.isSubscriber) {
            <div class="bg-green-50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold text-green-900">Cliente con Suscripción</span>
              </div>
              <div class="text-sm text-green-700">
                ID Suscripción: {{ selectedExit()!.subscriptionId }}
              </div>
            </div>
          }

          <!-- Estado -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Estado:</span>
              <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {{ selectedExit()!.statusName }}
              </span>
            </div>
          </div>

          @if (selectedExit()!.hasIncident) {
            <div class="bg-red-50 rounded-lg p-4 flex items-start gap-2">
              <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <div class="font-semibold text-red-900">Incidente Reportado</div>
                <div class="text-sm text-red-700">Este ticket tiene un incidente asociado</div>
              </div>
            </div>
          }

        </div>
      }

      <div footer>
        <button 
          (click)="selectedExit.set(null)"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
          Cerrar
        </button>
      </div>
    </app-modal>
  `
})
export class TicketExitsHistoryComponent implements OnInit {
  private ticketService = inject(TicketService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // State
  exits = signal<TicketResponse[]>([]);
  filteredExits = signal<TicketResponse[]>([]);
  selectedExit = signal<TicketResponse | null>(null);
  
  isLoading = signal(false);
  searchQuery = '';
  filterVehicleType = '';

  async ngOnInit() {
    await this.loadExits();
  }

  async loadExits() {
    this.isLoading.set(true);
    try {
      // Obtener tickets de la sucursal actual
      // TODO: Obtener branchId del usuario logueado
      const branchId = 1; // Por ahora hardcodeado
      const tickets = await this.ticketService.getTicketsByBranch(branchId);
      
      // Filtrar solo los que tienen salida registrada (completados)
      const completedExits = tickets.filter(t => t.exitTime !== null);
      
      // Ordenar por fecha de salida (más recientes primero)
      completedExits.sort((a, b) => 
        new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime()
      );
      
      this.exits.set(completedExits);
      this.filteredExits.set(completedExits);
      
      this.notification.success(`Se cargaron ${completedExits.length} salidas`);
    } catch (error) {
      console.error('Error cargando historial:', error);
      this.notification.error('Error al cargar el historial de salidas');
    } finally {
      this.isLoading.set(false);
    }
  }

  filterExits() {
    let filtered = [...this.exits()];

    // Filtrar por búsqueda (folio o placa)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(exit => 
        exit.folio.toLowerCase().includes(query) ||
        exit.licensePlate.toLowerCase().includes(query)
      );
    }

    // Filtrar por tipo de vehículo
    if (this.filterVehicleType) {
      filtered = filtered.filter(exit => 
        exit.vehicleTypeName === this.filterVehicleType
      );
    }

    this.filteredExits.set(filtered);
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterVehicleType = '';
    this.filteredExits.set(this.exits());
  }

  countByType(typeName: string): number {
    return this.exits().filter(exit => exit.vehicleTypeName === typeName).length;
  }

  viewDetails(exit: TicketResponse) {
    this.selectedExit.set(exit);
  }

  goBack() {
    this.router.navigate(['/branches/tickets']);
  }

  formatTime(isoTime: string): string {
    return new Date(isoTime).toLocaleString('es-GT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimeFull(isoTime: string): string {
    return new Date(isoTime).toLocaleString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getDuration(entryTime: string, exitTime: string): string {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  getVehicleIcon(typeName: string): string {
    const lowerType = typeName.toLowerCase();
    if (lowerType.includes('moto')) return '🏍️';
    if (lowerType.includes('auto')) return '🚗';
    if (lowerType.includes('pickup')) return '🚙';
    if (lowerType.includes('camión') || lowerType.includes('camion')) return '🚚';
    return '🚗';
  }
}
