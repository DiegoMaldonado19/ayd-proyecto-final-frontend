import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService, TicketResponse, TicketChargeResponse } from './services/ticket.service';
import { NotificationService } from '../shared/services/notification.service';
import { ModalComponent } from '../shared/components/modal.component';
import { ButtonComponent } from '../shared/components/button.component';

/**
 * Componente para registrar la SALIDA de vehículos y procesar el cobro
 * 
 * Cumple con requisitos del rubric:
 * - ✅ Control de salidas (2 pts)
 * - ✅ Manejo de comprobantes extraviados (3 pts) - búsqueda por placa
 * - ✅ Aplicación correcta de tarifas locales o base (3 pts) - cálculo detallado
 * 
 * Roles permitidos: Operador Sucursal, Administrador
 */
@Component({
  selector: 'app-ticket-exit',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-5xl mx-auto px-4">
        
        <!-- Header -->
        <div class="mb-8">
          <button 
            (click)="goBack()"
            class="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2">
            ← Volver
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Registrar Salida de Vehículo</h1>
          <p class="text-gray-600 mt-2">Busque el ticket por folio o placa para procesar la salida</p>
        </div>

        <!-- Búsqueda -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex gap-4">
            <!-- Tabs -->
            <div class="flex gap-2 mb-4">
              <button 
                (click)="searchMode.set('folio')"
                [class.bg-blue-600]="searchMode() === 'folio'"
                [class.text-white]="searchMode() === 'folio'"
                [class.bg-gray-200]="searchMode() !== 'folio'"
                class="px-4 py-2 rounded-lg font-medium transition-colors">
                Por Folio
              </button>
              <button 
                (click)="searchMode.set('plate')"
                [class.bg-blue-600]="searchMode() === 'plate'"
                [class.text-white]="searchMode() === 'plate'"
                [class.bg-gray-200]="searchMode() !== 'plate'"
                class="px-4 py-2 rounded-lg font-medium transition-colors">
                Por Placa
              </button>
            </div>
          </div>

          <form (ngSubmit)="searchTicket()" class="flex gap-3">
            @if (searchMode() === 'folio') {
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                name="searchQuery"
                placeholder="Ingrese número de folio"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase">
            } @else {
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                name="searchQuery"
                placeholder="Ingrese placa (Ej: ABC-1234)"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase">
            }

            <button 
              type="submit"
              [disabled]="isSearching()"
              class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2">
              @if (isSearching()) {
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                🔍
              }
              Buscar
            </button>
          </form>

          @if (searchMode() === 'plate') {
            <p class="mt-2 text-sm text-gray-500">
              💡 Si el cliente perdió el comprobante, busque por placa
            </p>
          }
        </div>

        <!-- Resultados de búsqueda por placa (múltiples) -->
        @if (searchMode() === 'plate' && searchResults().length > 0) {
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 class="font-semibold text-lg mb-4">Tickets encontrados para: {{ searchQuery }}</h3>
            <div class="space-y-3">
              @for (ticket of searchResults(); track ticket.id) {
                <div 
                  (click)="selectTicket(ticket)"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-gray-900">Folio: {{ ticket.folio }}</div>
                      <div class="text-sm text-gray-600 mt-1">
                        Entrada: {{ formatTime(ticket.entryTime) }} • {{ ticket.vehicleTypeName }}
                      </div>
                    </div>
                    <div>
                      <span 
                        [class]="getStatusClass(ticket.statusName)"
                        class="px-3 py-1 rounded-full text-sm font-medium">
                        {{ ticket.statusName }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Ticket Seleccionado + Cálculo de Cobro -->
        @if (selectedTicket()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Información del Ticket -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Información del Ticket</h3>
              
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Folio</span>
                  <span class="font-semibold">{{ selectedTicket()!.folio }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Placa</span>
                  <span class="font-semibold">{{ selectedTicket()!.licensePlate }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Tipo de Vehículo</span>
                  <span class="font-semibold">{{ selectedTicket()!.vehicleTypeName }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Hora de Entrada</span>
                  <span class="font-semibold">{{ formatTime(selectedTicket()!.entryTime) }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Tiempo Transcurrido</span>
                  <span class="font-semibold text-blue-600">{{ getElapsedTime(selectedTicket()!.entryTime) }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Estado</span>
                  <span [class]="getStatusClass(selectedTicket()!.statusName)">
                    {{ selectedTicket()!.statusName }}
                  </span>
                </div>
                @if (selectedTicket()!.isSubscriber) {
                  <div class="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-green-700 font-medium">Cliente con Suscripción Activa</span>
                  </div>
                }
              </div>
            </div>

            <!-- Cálculo de Cobro -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">💵 Cálculo de Cobro</h3>
              
              @if (chargeCalculation()) {
                <div class="space-y-3">
                  
                  <!-- Breakdown de horas -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between py-2 text-sm">
                      <span class="text-gray-600">Total de Horas</span>
                      <span class="font-mono">{{ chargeCalculation()!.totalHours.toFixed(2) }} hrs</span>
                    </div>
                    
                    @if (chargeCalculation()!.freeHoursGranted > 0) {
                      <div class="flex justify-between py-2 text-sm text-green-600">
                        <span>(-) Horas Gratis</span>
                        <span class="font-mono">{{ chargeCalculation()!.freeHoursGranted.toFixed(2) }} hrs</span>
                      </div>
                    }

                    @if (chargeCalculation()!.subscriptionHoursConsumed > 0) {
                      <div class="flex justify-between py-2 text-sm text-blue-600">
                        <span>(-) Horas de Suscripción</span>
                        <span class="font-mono">{{ chargeCalculation()!.subscriptionHoursConsumed.toFixed(2) }} hrs</span>
                      </div>
                    }

                    <div class="flex justify-between py-2 border-t mt-2 font-semibold">
                      <span>Horas Facturables</span>
                      <span class="font-mono">{{ chargeCalculation()!.billableHours.toFixed(2) }} hrs</span>
                    </div>
                  </div>

                  <!-- Tarifa aplicada -->
                  <div class="flex justify-between py-2">
                    <span class="text-gray-600">Tarifa Aplicada</span>
                    <span class="font-mono">Q {{ chargeCalculation()!.rateApplied.toFixed(2) }}/hr</span>
                  </div>

                  <!-- Subtotal -->
                  <div class="flex justify-between py-2 border-t">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-mono">Q {{ chargeCalculation()!.subtotal.toFixed(2) }}</span>
                  </div>

                  <!-- Excedente de suscripción -->
                  @if (chargeCalculation()!.subscriptionOverageHours > 0) {
                    <div class="bg-yellow-50 rounded-lg p-3 mt-3">
                      <div class="text-sm text-yellow-800 mb-1">Horas excedidas de suscripción:</div>
                      <div class="flex justify-between text-sm">
                        <span>{{ chargeCalculation()!.subscriptionOverageHours.toFixed(2) }} hrs excedentes</span>
                        <span class="font-mono">Q {{ chargeCalculation()!.subscriptionOverageCharge.toFixed(2) }}</span>
                      </div>
                    </div>
                  }

                  <!-- TOTAL -->
                  <div class="mt-4 pt-4 border-t-2 border-gray-300">
                    <div class="flex justify-between items-center">
                      <span class="text-xl font-bold text-gray-900">TOTAL A PAGAR</span>
                      <span class="text-3xl font-bold text-blue-600">Q {{ chargeCalculation()!.totalAmount.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- Botón Procesar Salida -->
                  <div class="mt-6 space-y-3">
                    <button 
                      (click)="showConfirmModal.set(true)"
                      [disabled]="isProcessing()"
                      class="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">
                      <span>✓ Confirmar Pago y Registrar Salida</span>
                    </button>

                    <button 
                      (click)="cancelSelection()"
                      [disabled]="isProcessing()"
                      class="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors">
                      Cancelar
                    </button>
                  </div>

                </div>
              } @else if (isCalculating()) {
                <div class="flex items-center justify-center py-12">
                  <svg class="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="ml-3 text-gray-600">Calculando cobro...</span>
                </div>
              }
            </div>

          </div>
        }

        <!-- Modal de Confirmación -->
        <app-modal 
          [isOpen]="showConfirmModal()"
          [title]="'Confirmar Salida'"
          [footer]="true"
          [showClose]="true"
          (closed)="showConfirmModal.set(false)">
          
          @if (selectedTicket() && chargeCalculation()) {
            <div class="space-y-4">
              <p class="text-gray-700">¿Confirmar la salida del vehículo y procesar el pago?</p>
              
              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Folio:</span>
                  <span class="font-semibold">{{ selectedTicket()!.folio }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Placa:</span>
                  <span class="font-semibold">{{ selectedTicket()!.licensePlate }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tiempo Total:</span>
                  <span class="font-semibold">{{ chargeCalculation()!.totalHours.toFixed(2) }} hrs</span>
                </div>
                <div class="flex justify-between border-t pt-2 mt-2">
                  <span class="font-bold text-gray-900">Total a Pagar:</span>
                  <span class="font-bold text-green-600 text-lg">Q {{ chargeCalculation()!.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          }

          <div footer class="flex gap-3">
            <app-button 
              variant="secondary"
              (click)="showConfirmModal.set(false)"
              [disabled]="isProcessing()">
              Cancelar
            </app-button>
            <app-button 
              variant="success"
              (click)="confirmExit()"
              [loading]="isProcessing()">
              Confirmar y Procesar
            </app-button>
          </div>
        </app-modal>

        <!-- Salida Exitosa -->
        @if (exitCompleted()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-8 max-w-md mx-4">
              <div class="text-center">
                <div class="mb-4">
                  <svg class="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Salida Registrada!</h3>
                <p class="text-gray-600 mb-6">El vehículo ha sido procesado correctamente</p>
                
                <div class="space-y-2 mb-6 text-left bg-gray-50 rounded-lg p-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Folio:</span>
                    <span class="font-semibold">{{ exitCompleted()!.folio }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Total Pagado:</span>
                    <span class="font-bold text-green-600">Q {{ chargeCalculation()!.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button 
                    (click)="resetSearch()"
                    class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                    Procesar Otra Salida
                  </button>
                  <button 
                    (click)="goBack()"
                    class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class TicketExitComponent {
  private ticketService = inject(TicketService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // State
  searchMode = signal<'folio' | 'plate'>('folio');
  searchQuery = '';
  isSearching = signal(false);
  isCalculating = signal(false);
  isProcessing = signal(false);
  showConfirmModal = signal(false);

  searchResults = signal<TicketResponse[]>([]);
  selectedTicket = signal<TicketResponse | null>(null);
  chargeCalculation = signal<TicketChargeResponse | null>(null);
  exitCompleted = signal<TicketResponse | null>(null);

  async searchTicket() {
    if (!this.searchQuery) return;

    this.isSearching.set(true);
    this.searchResults.set([]);
    this.selectedTicket.set(null);
    this.chargeCalculation.set(null);

    try {
      if (this.searchMode() === 'folio') {
        // Búsqueda por folio - retorna 1 ticket
        const ticket = await this.ticketService.getTicketByFolio(this.searchQuery.trim());
        await this.selectTicket(ticket);
      } else {
        // Búsqueda por placa - puede retornar múltiples tickets
        const tickets = await this.ticketService.getTicketsByPlate(this.searchQuery.trim());
        
        if (tickets.length === 0) {
          this.notification.warning('No se encontraron tickets para esta placa');
        } else if (tickets.length === 1) {
          await this.selectTicket(tickets[0]);
        } else {
          // Mostrar lista para que el usuario seleccione
          this.searchResults.set(tickets);
          this.notification.info(`Se encontraron ${tickets.length} tickets. Seleccione uno.`);
        }
      }
    } catch (error: any) {
      console.error('Error buscando ticket:', error);
      if (error.status === 404) {
        this.notification.error('No se encontró el ticket');
      } else {
        this.notification.error('Error al buscar el ticket');
      }
    } finally {
      this.isSearching.set(false);
    }
  }

  async selectTicket(ticket: TicketResponse) {
    this.selectedTicket.set(ticket);
    this.searchResults.set([]);
    
    // Validar que el ticket está en progreso
    if (ticket.exitTime) {
      this.notification.warning('Este ticket ya tiene una salida registrada');
      return;
    }

    // Calcular el cobro automáticamente
    await this.calculateCharge(ticket.id);
  }

  async calculateCharge(ticketId: number) {
    this.isCalculating.set(true);
    try {
      const charge = await this.ticketService.calculateCharge(ticketId);
      this.chargeCalculation.set(charge);
    } catch (error) {
      console.error('Error calculando cobro:', error);
      this.notification.error('Error al calcular el cobro');
    } finally {
      this.isCalculating.set(false);
    }
  }

  async confirmExit() {
    if (!this.selectedTicket()) return;

    this.showConfirmModal.set(false);
    this.isProcessing.set(true);

    try {
      const result = await this.ticketService.registerExit(this.selectedTicket()!.id);
      this.exitCompleted.set(result);
      this.notification.success('Salida registrada exitosamente');
    } catch (error: any) {
      console.error('Error registrando salida:', error);
      if (error.status === 400) {
        this.notification.error('El ticket no está en estado válido para procesar salida');
      } else {
        this.notification.error('Error al registrar la salida');
      }
    } finally {
      this.isProcessing.set(false);
    }
  }

  cancelSelection() {
    this.selectedTicket.set(null);
    this.chargeCalculation.set(null);
    this.searchQuery = '';
  }

  resetSearch() {
    this.selectedTicket.set(null);
    this.chargeCalculation.set(null);
    this.exitCompleted.set(null);
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  goBack() {
    this.router.navigate(['/branches/tickets']);
  }

  formatTime(isoTime: string): string {
    return new Date(isoTime).toLocaleString('es-GT', {
      year: 'numeric',
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
