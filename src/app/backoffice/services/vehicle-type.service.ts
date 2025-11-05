import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../api.config';

/**
 * Tipo de vehículo
 */
export interface VehicleType {
  id: number;
  code: string;
  name: string;
}

/**
 * Servicio para obtener tipos de vehículos
 */
@Injectable({ providedIn: 'root' })
export class VehicleTypeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE}/vehicles/types`;

  /**
   * Obtiene todos los tipos de vehículos
   * GET /vehicles/types
   */
  getVehicleTypes(): Observable<VehicleType[]> {
    return this.http.get<VehicleType[]>(this.baseUrl);
  }
}
