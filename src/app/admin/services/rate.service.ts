import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../api.config';

// ==================== DTOs ====================

// Base Rate DTOs
export interface RateBaseResponse {
  id: number;
  amount_per_hour: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface UpdateRateBaseRequest {
  amount_per_hour: number;
}

// Branch Rate DTOs
export interface BranchRateResponse {
  branch_id: number;
  branch_name: string;
  rate_per_hour: number | null;
  is_active: boolean;
}

export interface UpdateBranchRateRequest {
  rate_per_hour: number;
}

// Generic API Response
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RateService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE}/rates`;

  // ==================== A. TARIFA BASE (Global) ====================

  /**
   * 1. Obtener tarifa base actual
   * GET /rates/base
   */
  getCurrentBaseRate(): Observable<ApiResponse<RateBaseResponse>> {
    return this.http.get<ApiResponse<RateBaseResponse>>(`${this.baseUrl}/base`);
  }

  /**
   * 2. Actualizar tarifa base actual
   * PUT /rates/base
   * LÓGICA: Desactiva la tarifa actual y crea una nueva
   */
  updateBaseRate(request: UpdateRateBaseRequest): Observable<ApiResponse<RateBaseResponse>> {
    return this.http.put<ApiResponse<RateBaseResponse>>(`${this.baseUrl}/base`, request);
  }

  /**
   * 3. Obtener historial de tarifas base
   * GET /rates/base/history
   */
  getBaseRateHistory(): Observable<ApiResponse<RateBaseResponse[]>> {
    return this.http.get<ApiResponse<RateBaseResponse[]>>(`${this.baseUrl}/base/history`);
  }

  // ==================== B. TARIFAS POR SUCURSAL (Opcional) ====================

  /**
   * 4. Listar tarifas de todas las sucursales
   * GET /rates/branches
   * NOTA: Si rate_per_hour es null, la sucursal usa la tarifa base
   */
  getAllBranchRates(): Observable<ApiResponse<BranchRateResponse[]>> {
    return this.http.get<ApiResponse<BranchRateResponse[]>>(`${this.baseUrl}/branches`);
  }

  /**
   * 5. Obtener tarifa de una sucursal específica
   * GET /rates/branches/{branchId}
   */
  getBranchRate(branchId: number): Observable<ApiResponse<BranchRateResponse>> {
    return this.http.get<ApiResponse<BranchRateResponse>>(`${this.baseUrl}/branches/${branchId}`);
  }

  /**
   * 6. Asignar/Actualizar tarifa a una sucursal
   * PUT /rates/branches/{branchId}
   * USO: 
   * - Si la sucursal NO tiene tarifa → Este endpoint le ASIGNA una
   * - Si la sucursal YA tiene tarifa → Este endpoint la ACTUALIZA
   * - La tarifa de sucursal SOBRESCRIBE la tarifa base
   */
  updateBranchRate(branchId: number, request: UpdateBranchRateRequest): Observable<ApiResponse<BranchRateResponse>> {
    return this.http.put<ApiResponse<BranchRateResponse>>(`${this.baseUrl}/branches/${branchId}`, request);
  }

  /**
   * 7. Eliminar tarifa de sucursal (volver a usar tarifa base)
   * DELETE /rates/branches/{branchId}
   * EFECTO: La sucursal vuelve a usar la TARIFA BASE GLOBAL
   */
  deleteBranchRate(branchId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/branches/${branchId}`);
  }
}
