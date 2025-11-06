import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../../api.config';
import { PlateChange, ReviewPlateChangeRequest, ApprovePlateChangeRequest } from '../models/plate-change.interface';

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
 * Servicio para gestionar solicitudes de cambio de placa
 */
@Injectable({ providedIn: 'root' })
export class PlateChangeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE}/plate-changes`;

  /**
   * Obtiene todas las solicitudes de cambio de placa
   * GET /plate-changes
   */
  getAllPlateChanges(): Observable<PlateChange[]> {
    return this.http.get<ApiResponse<PlateChange[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene solo las solicitudes pendientes
   * GET /plate-changes/pending
   */
  getPendingPlateChanges(): Observable<PlateChange[]> {
    return this.http.get<ApiResponse<PlateChange[]>>(`${this.baseUrl}/pending`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene una solicitud específica por ID
   * GET /plate-changes/{id}
   */
  getPlateChangeById(id: number): Observable<PlateChange> {
    return this.http.get<ApiResponse<PlateChange>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Aprobar o rechazar una solicitud de cambio de placa
   * PUT /plate-changes/{id}/review
   */
  reviewPlateChange(id: number, request: ReviewPlateChangeRequest): Observable<PlateChange> {
    return this.http.put<ApiResponse<PlateChange>>(`${this.baseUrl}/${id}/review`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Aprobar una solicitud de cambio de placa
   * PATCH /plate-changes/{id}/approve
   */
  approvePlateChange(id: number, request: ApprovePlateChangeRequest): Observable<PlateChange> {
    return this.http.patch<ApiResponse<PlateChange>>(`${this.baseUrl}/${id}/approve`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Rechazar una solicitud de cambio de placa
   * PATCH /plate-changes/{id}/reject
   */
  rejectPlateChange(id: number, reviewNotes: string): Observable<PlateChange> {
    return this.http.patch<ApiResponse<PlateChange>>(`${this.baseUrl}/${id}/reject`, {
      review_notes: reviewNotes
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Agregar evidencia a una solicitud de cambio de placa
   * POST /plate-changes/{id}/evidence?document_type_id={documentTypeId}
   */
  addEvidence(id: number, file: File, documentTypeId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/${id}/evidence?document_type_id=${documentTypeId}`,
      formData
    ).pipe(
      map(response => response.data)
    );
  }
}
