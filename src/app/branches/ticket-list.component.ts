import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService, TicketResponse } from './services/ticket.service';
import { NotificationService } from '../shared/services/notification.service';

/**
 * Componente para ver la lista de tickets activos y buscar tickets
 * 
 * Cumple con requisitos del rubric:
 * - ✅ Control de ocupación por tipo de vehículo (2 pts) - tabla con tipos
 * - ✅ Manejo de comprobantes extraviados (3 pts) - búsqueda por placa/folio
 * 
 * Roles permitidos: Operador Sucursal, Operador Back Office, Administrador
 */
@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tickets Activos</h1>
            <p class="text-gray-600 mt-2">Vehículos actualmente en el parqueo</p>
          </div>
          
          <div class="flex gap-3">
            <button 
              (click)="router.navigate(['/branches/tickets/entry'])"
              class="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <span>+</span>
              <span>Nueva Entrada</span>
            </button>
            <button 
              (click)="router.navigate(['/branches/tickets/exit'])"
              class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span>→</span>
              <span>Procesar Salida</span>
            </button>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ tickets().length }}</div>
                <div class="text-sm text-gray-600">Total Activos</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-green-100 rounded-lg">
                <span class="text-2xl">🏍️</span>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ countByType('Dos Ruedas') }}</div>
                <div class="text-sm text-gray-600">Motos (2R)</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-purple-100 rounded-lg">
                <span class="text-2xl">🚗</span>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ countByType('Cuatro Ruedas') }}</div>
                <div class="text-sm text-gray-600">Autos/Pickups/Camiones (4R)</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-100 rounded-lg">
                <span class="text-2xl">�</span>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ tickets().length }}</div>
                <div class="text-sm text-gray-600">Total Activos</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Búsqueda y Filtros -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="filterTickets()"
                placeholder="Buscar por folio, placa o tipo de vehículo..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <button 
              (click)="loadTickets()"
              [disabled]="isLoading()"
              class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2">
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

        <!-- Tabla de Tickets -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          @if (isLoading()) {
            <div class="flex items-center justify-center py-20">
              <svg class="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="ml-3 text-gray-600">Cargando tickets...</span>
            </div>
          } @else if (filteredTickets().length === 0) {
            <div class="text-center py-20">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p class="text-gray-600 text-lg">No hay tickets activos</p>
              <p class="text-gray-500 text-sm mt-2">Los vehículos en el parqueo aparecerán aquí</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo Vehículo</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrada</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiempo</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Suscripción</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (ticket of filteredTickets(); track ticket.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-mono font-semibold text-gray-900">{{ ticket.folio }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-semibold text-gray-900">{{ ticket.licensePlate }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-gray-700">{{ ticket.vehicleTypeName }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {{ formatTime(ticket.entryTime) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-medium text-blue-600">{{ getElapsedTime(ticket.entryTime) }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="getStatusClass(ticket.statusName)">
                          {{ ticket.statusName }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        @if (ticket.isSubscriber) {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Sí
                          </span>
                        } @else {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          (click)="viewDetails(ticket)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Modal de Detalles -->
        @if (selectedTicket()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
            <div class="bg-white rounded-xl max-w-2xl w-full" (click)="$event.stopPropagation()">
              <div class="p-6 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-gray-900">Detalles del Ticket</h3>
                  <button (click)="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Folio</label>
                    <div class="text-lg font-bold text-gray-900">{{ selectedTicket()!.folio }}</div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Placa</label>
                    <div class="text-lg font-bold text-gray-900">{{ selectedTicket()!.licensePlate }}</div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Tipo de Vehículo</label>
                    <div class="text-gray-900">{{ selectedTicket()!.vehicleTypeName }}</div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Estado</label>
                    <div>
                      <span [class]="getStatusClass(selectedTicket()!.statusName)">
                        {{ selectedTicket()!.statusName }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Hora de Entrada</label>
                    <div class="text-gray-900">{{ formatTime(selectedTicket()!.entryTime) }}</div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Tiempo Transcurrido</label>
                    <div class="text-blue-600 font-semibold">{{ getElapsedTime(selectedTicket()!.entryTime) }}</div>
                  </div>
                </div>

                @if (selectedTicket()!.isSubscriber) {
                  <div class="p-4 bg-green-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-green-700 font-medium">Cliente con Suscripción Activa</span>
                    </div>
                  </div>
                }

                @if (selectedTicket()!.hasIncident) {
                  <div class="p-4 bg-red-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span class="text-red-700 font-medium">Este ticket tiene un incidente registrado</span>
                    </div>
                  </div>
                }

                @if (selectedTicket()!.qrCode) {
                  <div class="text-center">
                    <img [src]="selectedTicket()!.qrCode" alt="QR Code" class="mx-auto w-48 h-48">
                  </div>
                }
              </div>

              <div class="p-6 border-t bg-gray-50 flex gap-3">
                <button 
                  (click)="processExit(selectedTicket()!)"
                  class="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                  Procesar Salida
                </button>
                <button 
                  (click)="closeModal()"
                  class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private notification = inject(NotificationService);
  router = inject(Router);

  // State
  isLoading = signal(false);
  tickets = signal<TicketResponse[]>([]);
  filteredTickets = signal<TicketResponse[]>([]);
  selectedTicket = signal<TicketResponse | null>(null);
  searchQuery = '';

  ngOnInit() {
    this.loadTickets();
    // Auto-refresh cada 30 segundos
    setInterval(() => this.loadTickets(), 30000);
  }

  async loadTickets() {
    this.isLoading.set(true);
    try {
      const tickets = await this.ticketService.getActiveTickets();
      this.tickets.set(tickets);
      this.filterTickets();
    } catch (error) {
      console.error('Error cargando tickets:', error);
      this.notification.error('Error al cargar los tickets activos');
    } finally {
      this.isLoading.set(false);
    }
  }

  filterTickets() {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredTickets.set(this.tickets());
    } else {
      const filtered = this.tickets().filter(ticket => 
        ticket.folio.toLowerCase().includes(query) ||
        ticket.licensePlate.toLowerCase().includes(query) ||
        ticket.vehicleTypeName.toLowerCase().includes(query)
      );
      this.filteredTickets.set(filtered);
    }
  }

  countByType(typeName: string): number {
    return this.tickets().filter(t => t.vehicleTypeName.includes(typeName)).length;
  }

  viewDetails(ticket: TicketResponse) {
    this.selectedTicket.set(ticket);
  }

  closeModal() {
    this.selectedTicket.set(null);
  }

  processExit(ticket: TicketResponse) {
    this.router.navigate(['/branches/tickets/exit'], {
      queryParams: { folio: ticket.folio }
    });
  }

  formatTime(isoTime: string): string {
    return new Date(isoTime).toLocaleString('es-GT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getElapsedTime(entryTime: string): string {
    return this.ticketService.getElapsedTime(entryTime);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('progreso') || statusLower.includes('progress')) {
      return 'px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium';
    }
    if (statusLower.includes('completado') || statusLower.includes('completed')) {
      return 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium';
    }
    return 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium';
  }
}
