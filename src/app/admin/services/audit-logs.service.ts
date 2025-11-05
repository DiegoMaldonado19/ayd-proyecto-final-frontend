import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../../api.config';

// ============================================================================
// INTERFACES - EXACTAS del backend
// ============================================================================

export interface AuditLogResponse {
  id: number;
  user_id: number;
  user_email: string;
  module: string;
  entity: string;
  operation_type: string;
  description: string;
  previous_values: string | null;
  new_values: string | null;
  client_ip: string | null;
  created_at: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class AuditLogsService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE}/audit-logs`;

  /**
   * GET /audit-logs
   */
  async listAuditLogs(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<AuditLogResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<PageResponse<AuditLogResponse>>>(`${this.baseUrl}`, { params })
    );
    return response.data;
  }

  /**
   * GET /audit-logs/{id}
   */
  async getAuditLog(id: number): Promise<AuditLogResponse> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AuditLogResponse>>(`${this.baseUrl}/${id}`)
    );
    return response.data;
  }

  /**
   * GET /audit-logs/by-user/{userId}
   */
  async listAuditLogsByUser(
    userId: number,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<AuditLogResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<PageResponse<AuditLogResponse>>>(`${this.baseUrl}/by-user/${userId}`, { params })
    );
    return response.data;
  }

  /**
   * GET /audit-logs/by-module/{module}
   */
  async listAuditLogsByModule(
    module: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<AuditLogResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<PageResponse<AuditLogResponse>>>(`${this.baseUrl}/by-module/${module}`, { params })
    );
    return response.data;
  }

  /**
   * GET /audit-logs/by-date-range
   * Formato: yyyy-MM-ddTHH:mm:ss
   */
  async listAuditLogsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<AuditLogResponse>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<PageResponse<AuditLogResponse>>>(`${this.baseUrl}/by-date-range`, { params })
    );
    return response.data;
  }
}
