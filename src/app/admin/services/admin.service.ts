import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE } from '../../api.config';
import { firstValueFrom } from 'rxjs';

// ==================== DTOs para Tarifas ====================
export interface RateBaseResponse {
  id: number;
  amount_per_hour: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface CreateRateBaseRequest {
  amount_per_hour: number;
}

export interface RateBranchResponse {
  branch_id: number;
  branch_name: string;
  rate_per_hour: number;
  is_active: boolean;
}

export interface UpdateBranchRateRequest {
  rate_per_hour: number;
}

// ==================== DTOs para Usuarios ====================
export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_type_id: number;
  role_name: string;
  is_active: boolean;
  requires_password_change: boolean;
  has_2fa_enabled: boolean;
  failed_login_attempts: number;
  locked_until?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_type_id: number;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_type_id?: number;
}

export interface UpdateUserStatusRequest {
  is_active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page_number: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  is_first: boolean;
  is_last: boolean;
}

// ==================== DTOs para Comercios ====================
export interface CommerceResponse {
  id: number;
  name: string;
  tax_id: string;
  contact_name: string;
  phone: string;
  email: string;
  rate_per_hour: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCommerceRequest {
  name: string;
  tax_id: string;
  contact_name: string;
  phone: string;
  email: string;
  rate_per_hour: number;
}

export interface UpdateCommerceRequest {
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  rate_per_hour?: number;
  is_active?: boolean;
}

export interface BenefitResponse {
  id: number;
  business_id: number;
  business_name: string;
  branch_id: number;
  branch_name: string;
  benefit_type_code: string;
  benefit_type_name: string;
  settlement_period_code: string;
  settlement_period_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigureBenefitRequest {
  branch_id: number;
  benefit_type: string;
  settlement_period: string;
}

// ==================== DTOs para Planes de Suscripción ====================
export interface SubscriptionPlanResponse {
  id: number;
  plan_type_id: number;
  plan_type_name: string;
  plan_type_code: string;
  monthly_hours: number;
  monthly_discount_percentage: number;
  annual_additional_discount_percentage: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanRequest {
  plan_type_id: number;
  monthly_hours: number;
  monthly_discount_percentage: number;
  annual_additional_discount_percentage: number;
  description?: string;
}

export interface UpdateSubscriptionPlanRequest {
  monthly_hours?: number;
  monthly_discount_percentage?: number;
  annual_additional_discount_percentage?: number;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  // ==================== TARIFAS ====================
  
  /**
   * Obtener tarifa base actual
   * GET /api/v1/rates/base
   */
  async getCurrentRate(): Promise<RateBaseResponse> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<RateBaseResponse>>(`${API_BASE}/rates/base`)
    );
    return response.data;
  }

  /**
   * Obtener historial de tarifas base
   * GET /api/v1/rates/base/history
   */
  async getRateHistory(): Promise<RateBaseResponse[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<RateBaseResponse[]>>(`${API_BASE}/rates/base/history`)
    );
    return response.data;
  }

  /**
   * Crear nueva tarifa base
   * POST /api/v1/rates/base
   */
  async createBaseRate(request: CreateRateBaseRequest): Promise<RateBaseResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<RateBaseResponse>>(`${API_BASE}/rates/base`, request)
    );
    return response.data;
  }

  /**
   * Listar tarifas por sucursal
   * GET /api/v1/rates/branches
   */
  async listBranchRates(): Promise<RateBranchResponse[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<RateBranchResponse[]>>(`${API_BASE}/rates/branches`)
    );
    return response.data;
  }

  /**
   * Obtener tarifa de sucursal específica
   * GET /api/v1/rates/branches/:branchId
   */
  async getBranchRate(branchId: number): Promise<RateBranchResponse> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<RateBranchResponse>>(`${API_BASE}/rates/branches/${branchId}`)
    );
    return response.data;
  }

  /**
   * Actualizar tarifa de sucursal
   * PUT /api/v1/rates/branches/:branchId
   */
  async updateBranchRate(branchId: number, request: UpdateBranchRateRequest): Promise<RateBranchResponse> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<RateBranchResponse>>(`${API_BASE}/rates/branches/${branchId}`, request)
    );
    return response.data;
  }

  /**
   * Eliminar tarifa de sucursal (regresa a usar tarifa base)
   * DELETE /api/v1/rates/branches/:branchId
   */
  async deleteBranchRate(branchId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<void>>(`${API_BASE}/rates/branches/${branchId}`)
    );
  }

  // ==================== USUARIOS ====================
  
  /**
   * Listar usuarios con paginación
   * GET /users
   */
  async listUsers(page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc'): Promise<PageResponse<UserResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);
      
    const response = await firstValueFrom(
      this.http.get<ApiResponse<PageResponse<UserResponse>>>(`${API_BASE}/users`, { params })
    );
    return response.data;
  }

  /**
   * Crear usuario
   * POST /users
   */
  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<UserResponse>>(`${API_BASE}/users`, request)
    );
    return response.data;
  }

  /**
   * Obtener usuario por ID
   * GET /users/:id
   */
  async getUser(userId: number): Promise<UserResponse> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<UserResponse>>(`${API_BASE}/users/${userId}`)
    );
    return response.data;
  }

  /**
   * Actualizar usuario
   * PUT /users/:id
   */
  async updateUser(userId: number, request: UpdateUserRequest): Promise<UserResponse> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<UserResponse>>(`${API_BASE}/users/${userId}`, request)
    );
    return response.data;
  }

  /**
   * Actualizar estado del usuario
   * PATCH /users/:id/status
   */
  async updateUserStatus(userId: number, request: UpdateUserStatusRequest): Promise<UserResponse> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<UserResponse>>(`${API_BASE}/users/${userId}/status`, request)
    );
    return response.data;
  }

  /**
   * Eliminar usuario
   * DELETE /users/:id
   */
  async deleteUser(userId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<void>>(`${API_BASE}/users/${userId}`)
    );
  }

  // ==================== COMERCIOS AFILIADOS ====================
  
  /**
   * Listar comercios con paginación
   * GET /commerces
   */
  async listCommerces(page = 0, size = 20): Promise<PageResponse<CommerceResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    const response = await firstValueFrom(
      this.http.get<PageResponse<CommerceResponse>>(`${API_BASE}/commerces`, { params })
    );
    return response;
  }

  /**
   * Crear comercio
   * POST /commerces
   */
  async createCommerce(request: CreateCommerceRequest): Promise<CommerceResponse> {
    return await firstValueFrom(
      this.http.post<CommerceResponse>(`${API_BASE}/commerces`, request)
    );
  }

  /**
   * Obtener comercio por ID
   * GET /commerces/:id
   */
  async getCommerce(commerceId: number): Promise<CommerceResponse> {
    return await firstValueFrom(
      this.http.get<CommerceResponse>(`${API_BASE}/commerces/${commerceId}`)
    );
  }

  /**
   * Actualizar comercio
   * PUT /commerces/:id
   */
  async updateCommerce(commerceId: number, request: UpdateCommerceRequest): Promise<CommerceResponse> {
    return await firstValueFrom(
      this.http.put<CommerceResponse>(`${API_BASE}/commerces/${commerceId}`, request)
    );
  }

  /**
   * Eliminar comercio
   * DELETE /commerces/:id
   */
  async deleteCommerce(commerceId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${API_BASE}/commerces/${commerceId}`)
    );
  }

  /**
   * Configurar beneficio de comercio
   * POST /commerces/:id/benefits
   */
  async configureBenefit(commerceId: number, request: ConfigureBenefitRequest): Promise<BenefitResponse> {
    return await firstValueFrom(
      this.http.post<BenefitResponse>(`${API_BASE}/commerces/${commerceId}/benefits`, request)
    );
  }

  /**
   * Obtener beneficios de comercio
   * GET /commerces/:id/benefits
   */
  async getCommerceBenefits(commerceId: number): Promise<BenefitResponse[]> {
    return await firstValueFrom(
      this.http.get<BenefitResponse[]>(`${API_BASE}/commerces/${commerceId}/benefits`)
    );
  }

  // ==================== PLANES DE SUSCRIPCIÓN ====================
  
  /**
   * Listar planes de suscripción activos
   * GET /subscription-plans
   */
  async listSubscriptionPlans(): Promise<SubscriptionPlanResponse[]> {
    return await firstValueFrom(
      this.http.get<SubscriptionPlanResponse[]>(`${API_BASE}/subscription-plans`)
    );
  }

  /**
   * Listar planes con paginación
   * GET /subscription-plans/paginated
   */
  async listSubscriptionPlansPaginated(
    isActive: boolean = true,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<SubscriptionPlanResponse>> {
    const params = new HttpParams()
      .set('isActive', isActive.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return await firstValueFrom(
      this.http.get<PageResponse<SubscriptionPlanResponse>>(`${API_BASE}/subscription-plans/paginated`, { params })
    );
  }

  /**
   * Crear plan de suscripción
   * POST /subscription-plans
   */
  async createSubscriptionPlan(request: CreateSubscriptionPlanRequest): Promise<SubscriptionPlanResponse> {
    return await firstValueFrom(
      this.http.post<SubscriptionPlanResponse>(`${API_BASE}/subscription-plans`, request)
    );
  }

  /**
   * Obtener plan por ID
   * GET /subscription-plans/:id
   */
  async getSubscriptionPlan(planId: number): Promise<SubscriptionPlanResponse> {
    return await firstValueFrom(
      this.http.get<SubscriptionPlanResponse>(`${API_BASE}/subscription-plans/${planId}`)
    );
  }

  /**
   * Actualizar plan
   * PUT /subscription-plans/:id
   */
  async updateSubscriptionPlan(planId: number, request: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlanResponse> {
    return await firstValueFrom(
      this.http.put<SubscriptionPlanResponse>(`${API_BASE}/subscription-plans/${planId}`, request)
    );
  }

  /**
   * Eliminar plan (soft delete)
   * DELETE /subscription-plans/:id
   */
  async deleteSubscriptionPlan(planId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${API_BASE}/subscription-plans/${planId}`)
    );
  }
}
