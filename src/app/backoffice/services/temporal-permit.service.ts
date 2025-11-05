import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../../api.config';
import { TemporalPermit } from '../models/temporal-permit.interface';

/**
 * Respuesta estándar del backend
 */
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Servicio para gestionar permisos temporales
 */
@Injectable({ providedIn: 'root' })
export class TemporalPermitService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE}/temporal-permits`;

  /**
   * Obtiene todos los permisos temporales
   * GET /temporal-permits
   */
  getAllTemporalPermits(): Observable<TemporalPermit[]> {
    return this.http.get<ApiResponse<TemporalPermit[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene solo los permisos temporales activos
   * GET /temporal-permits/active
   */
  getActiveTemporalPermits(): Observable<TemporalPermit[]> {
    return this.http.get<ApiResponse<TemporalPermit[]>>(`${this.baseUrl}/active`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene un permiso temporal específico por ID
   * GET /temporal-permits/{id}
   */
  getTemporalPermitById(id: number): Observable<TemporalPermit> {
    return this.http.get<ApiResponse<TemporalPermit>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Revoca un permiso temporal
   * PATCH /temporal-permits/{id}/revoke
   */
  revokeTemporalPermit(id: number): Observable<TemporalPermit> {
    return this.http.patch<ApiResponse<TemporalPermit>>(
      `${this.baseUrl}/${id}/revoke`,
      {}
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Actualiza un permiso temporal
   * PUT /temporal-permits/{id}
   */
  updateTemporalPermit(id: number, data: UpdateTemporalPermitRequest): Observable<TemporalPermit> {
    return this.http.put<ApiResponse<TemporalPermit>>(
      `${this.baseUrl}/${id}`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crea un nuevo permiso temporal
   * POST /temporal-permits
   */
  createTemporalPermit(data: CreateTemporalPermitRequest): Observable<TemporalPermit> {
    return this.http.post<ApiResponse<TemporalPermit>>(
      this.baseUrl,
      data
    ).pipe(
      map(response => response.data)
    );
  }
}

/**
 * Request para actualizar un permiso temporal
 */
export interface UpdateTemporalPermitRequest {
  start_date: string;
  end_date: string;
  max_uses: number;
  allowed_branches: number[];
}

/**
 * Request para crear un permiso temporal
 */
export interface CreateTemporalPermitRequest {
  subscription_id: number;
  temporal_plate: string;
  start_date: string;
  end_date: string;
  max_uses: number;
  allowed_branches: number[];
  vehicle_type_id: number;
}
