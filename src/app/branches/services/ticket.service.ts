import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../../api.config';

// ============================================================================
// INTERFACES - del backend TicketController.java
// ============================================================================

/**
 * Request para registrar entrada de vehículo
 * Backend: RegisterEntryRequest.java
 */
export interface RegisterEntryRequest {
  branchId: number;
  licensePlate: string;       // Formato: "ABC-1234" o "P-12345"
  vehicleTypeId: number;      // 1=Moto, 2=Carro, 3=Pickup, etc.
}

/**
 * Response de ticket
 * Backend: TicketResponse.java
 */
export interface TicketResponse {
  id: number;
  branchId: number;
  folio: string;              // Folio único del ticket
  licensePlate: string;
  vehicleTypeId: number;
  vehicleTypeName: string;    // "Motocicleta", "Automóvil", etc.
  entryTime: string;          // ISO 8601
  exitTime: string | null;    // null si aún está dentro
  subscriptionId: number | null;
  isSubscriber: boolean;
  hasIncident: boolean;
  statusTypeId: number;       // 1=IN_PROGRESS, 2=COMPLETED, etc.
  statusName: string;         // "En progreso", "Completado"
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response de cálculo de cobro
 * Backend: TicketChargeResponse.java
 */
export interface TicketChargeResponse {
  ticketId: number;
  totalHours: number;
  freeHoursGranted: number;
  billableHours: number;
  rateApplied: number;
  subtotal: number;
  subscriptionHoursConsumed: number;
  subscriptionOverageHours: number;
  subscriptionOverageCharge: number;
  totalAmount: number;
}

/**
 * Request para aplicar beneficio de comercio
 */
export interface ApplyBenefitRequest {
  commerceId: number;
  hoursToGrant: number;
}

/**
 * Response de beneficio aplicado
 */
export interface BusinessFreeHoursResponse {
  id: number;
  ticketId: number;
  commerceId: number;
  commerceName: string;
  freeHoursGranted: number;
  createdAt: string;
}

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE}/tickets`;

  /**
   * POST /tickets
   * Rol requerido: Operador Sucursal, Administrador
   * 
   * Registra la entrada de un vehículo al parqueo.
   * 
   * @param request Datos del vehículo
   * @returns Promise<TicketResponse> Ticket creado
   * @throws 409 Si ya existe ticket activo para la placa
   * @throws 409 Si la sucursal está llena
   */
  async registerEntry(request: RegisterEntryRequest): Promise<TicketResponse> {
    return firstValueFrom(
      this.http.post<TicketResponse>(`${this.baseUrl}`, request)
    );
  }

  /**
   * GET /tickets/{id}
   * Rol requerido: Operador Sucursal, Operador Back Office, Administrador
   * 
   * Obtiene los detalles de un ticket por su ID.
   */
  async getTicket(id: number): Promise<TicketResponse> {
    return firstValueFrom(
      this.http.get<TicketResponse>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * PATCH /tickets/{id}/exit
   * Rol requerido: Operador Sucursal, Administrador
   * 
   * Registra la salida del vehículo y calcula automáticamente el cobro.
   * 
   * @param id ID del ticket
   * @returns Promise<TicketResponse> Ticket actualizado con hora de salida
   * @throws 400 Si el ticket no está en progreso
   * @throws 400 Si el ticket ya tiene salida registrada
   */
  async registerExit(id: number): Promise<TicketResponse> {
    return firstValueFrom(
      this.http.patch<TicketResponse>(`${this.baseUrl}/${id}/exit`, {})
    );
  }

  /**
   * GET /tickets/{id}/calculate-charge
   * Rol requerido: Operador Sucursal, Operador Back Office, Administrador
   * 
   * Calcula el cobro de un ticket sin registrar la salida.
   * Útil para mostrar al operador cuánto debe pagar el cliente.
   */
  async calculateCharge(id: number): Promise<TicketChargeResponse> {
    return firstValueFrom(
      this.http.get<TicketChargeResponse>(`${this.baseUrl}/${id}/calculate-charge`)
    );
  }

  /**
   * POST /tickets/{id}/apply-benefit
   * Rol requerido: Operador Sucursal, Administrador
   * 
   * Aplica horas gratis de un comercio afiliado a un ticket.
   */
  async applyBenefit(id: number, request: ApplyBenefitRequest): Promise<BusinessFreeHoursResponse> {
    return firstValueFrom(
      this.http.post<BusinessFreeHoursResponse>(`${this.baseUrl}/${id}/apply-benefit`, request)
    );
  }

  /**
   * GET /tickets/active
   * Rol requerido: Operador Sucursal, Operador Back Office, Administrador
   * 
   * Obtiene todos los tickets actualmente en progreso (vehículos dentro del parqueo).
   */
  async getActiveTickets(): Promise<TicketResponse[]> {
    return firstValueFrom(
      this.http.get<TicketResponse[]>(`${this.baseUrl}/active`)
    );
  }

  /**
   * GET /tickets/by-branch/{branchId}
   * Rol requerido: Operador Sucursal, Operador Back Office, Administrador
   * 
   * Obtiene todos los tickets de una sucursal específica.
   */
  async getTicketsByBranch(branchId: number): Promise<TicketResponse[]> {
    return firstValueFrom(
      this.http.get<TicketResponse[]>(`${this.baseUrl}/by-branch/${branchId}`)
    );
  }

  /**
   * GET /tickets/by-plate/{plate}
   * Rol requerido: TODOS (incluye Cliente)
   * 
   * Busca tickets por número de placa.
   * Los clientes solo ven sus propios tickets.
   */
  async getTicketsByPlate(plate: string): Promise<TicketResponse[]> {
    return firstValueFrom(
      this.http.get<TicketResponse[]>(`${this.baseUrl}/by-plate/${plate}`)
    );
  }

  /**
   * GET /tickets/by-folio/{folio}
   * Rol requerido: Operador Sucursal, Operador Back Office, Administrador
   * 
   * Busca un ticket por su número de folio.
   */
  async getTicketByFolio(folio: string): Promise<TicketResponse> {
    return firstValueFrom(
      this.http.get<TicketResponse>(`${this.baseUrl}/by-folio/${folio}`)
    );
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Valida formato de placa según backend:
   * - ABC-1234 o ABC1234 (placas normales)
   * - P-12345 o P-123456 (placas temporales)
   */
  isValidPlateFormat(plate: string): boolean {
    const regex = /^[A-Z]{1,3}-?[0-9]{3,4}$|^P-[0-9]{5,6}$/;
    return regex.test(plate);
  }

  /**
   * Formatea la placa para mostrar siempre con guión
   */
  formatPlate(plate: string): string {
    if (!plate) return '';
    
    // Si es placa temporal (P-12345)
    if (plate.startsWith('P') || plate.startsWith('p')) {
      return plate.toUpperCase().replace(/^P(\d)/, 'P-$1');
    }
    
    // Si es placa normal (ABC-1234)
    const match = plate.match(/^([A-Z]{1,3})[-]?([0-9]{3,4})$/i);
    if (match) {
      return `${match[1].toUpperCase()}-${match[2]}`;
    }
    
    return plate.toUpperCase();
  }

  /**
   * Calcula el tiempo transcurrido en formato legible
   */
  getElapsedTime(entryTime: string): string {
    const entry = new Date(entryTime);
    const now = new Date();
    const diff = now.getTime() - entry.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
