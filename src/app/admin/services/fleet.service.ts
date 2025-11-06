import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../api.config';

// Request DTOs
export interface CreateFleetRequest {
  name: string;
  tax_id: string;
  contact_name?: string;
  corporate_email: string;
  phone?: string;
  corporate_discount_percentage: number;
  plate_limit: number;
  billing_period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
}

export interface UpdateFleetRequest {
  name?: string;
  contact_name?: string;
  corporate_email?: string;
  phone?: string;
  corporate_discount_percentage?: number;
  plate_limit?: number;
  billing_period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
  is_active?: boolean;
}

export interface AddVehicleToFleetRequest {
  license_plate: string;
  plan_id: number;
  vehicle_type_id: number;
  assigned_employee?: string;
}

export interface UpdateFleetDiscountsRequest {
  corporate_discount_percentage: number;
}

// Response DTOs
export interface FleetResponse {
  id: number;
  name: string;
  tax_id: string;
  contact_name: string;
  corporate_email: string;
  phone: string;
  corporate_discount_percentage: number;
  plate_limit: number;
  billing_period: string;
  months_unpaid: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_vehicles_count: number;
}

export interface FleetVehicleResponse {
  id: number;
  company_id: number;
  license_plate: string;
  plan: {
    id: number;
    name: string;
    description: string;
    price_per_hour: number;
    max_discount_percentage: number;
    hours_included: number;
    extra_hour_rate: number;
    is_active: boolean;
  };
  vehicle_type: {
    id: number;
    type: string;
    description: string;
    hourly_rate: number;
  };
  assigned_employee: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FleetDiscountsResponse {
  corporate_discount_percentage: number;
  max_total_discount: number;
}

export interface VehicleConsumptionDetail {
  license_plate: string;
  assigned_employee: string;
  entries_count: number;
  hours_consumed: number;
  amount_charged: number;
}

export interface FleetConsumptionResponse {
  company_id: number;
  company_name: string;
  period_start: string;
  period_end: string;
  total_vehicles: number;
  total_entries: number;
  total_hours_consumed: number;
  total_amount_charged: number;
  vehicle_consumption: VehicleConsumptionDetail[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FleetService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/fleets`;

  /**
   * List all fleet companies with pagination
   */
  listFleets(page: number = 0, size: number = 10, isActive?: boolean): Observable<PageResponse<FleetResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<PageResponse<FleetResponse>>(this.apiUrl, { params });
  }

  /**
   * Get fleet details by ID
   */
  getFleet(id: number): Observable<FleetResponse> {
    return this.http.get<FleetResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new fleet company
   */
  createFleet(request: CreateFleetRequest): Observable<FleetResponse> {
    return this.http.post<FleetResponse>(this.apiUrl, request);
  }

  /**
   * Update fleet company
   */
  updateFleet(id: number, request: UpdateFleetRequest): Observable<FleetResponse> {
    return this.http.put<FleetResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete fleet company
   */
  deleteFleet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * List vehicles in a fleet
   */
  listFleetVehicles(
    fleetId: number,
    page: number = 0,
    size: number = 10,
    isActive?: boolean
  ): Observable<PageResponse<FleetVehicleResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<PageResponse<FleetVehicleResponse>>(`${this.apiUrl}/${fleetId}/vehicles`, { params });
  }

  /**
   * Add vehicle to fleet
   */
  addVehicleToFleet(fleetId: number, request: AddVehicleToFleetRequest): Observable<FleetVehicleResponse> {
    return this.http.post<FleetVehicleResponse>(`${this.apiUrl}/${fleetId}/vehicles`, request);
  }

  /**
   * Remove vehicle from fleet
   */
  removeVehicleFromFleet(fleetId: number, vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${fleetId}/vehicles/${vehicleId}`);
  }

  /**
   * Get fleet discount configuration
   */
  getFleetDiscounts(fleetId: number): Observable<FleetDiscountsResponse> {
    return this.http.get<FleetDiscountsResponse>(`${this.apiUrl}/${fleetId}/discounts`);
  }

  /**
   * Update fleet discount configuration
   */
  updateFleetDiscounts(fleetId: number, request: UpdateFleetDiscountsRequest): Observable<FleetDiscountsResponse> {
    return this.http.put<FleetDiscountsResponse>(`${this.apiUrl}/${fleetId}/discounts`, request);
  }

  /**
   * Get fleet consumption statistics
   */
  getFleetConsumption(
    fleetId: number,
    startDate?: string,
    endDate?: string
  ): Observable<FleetConsumptionResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<FleetConsumptionResponse>(`${this.apiUrl}/${fleetId}/consumption`, { params });
  }
}
