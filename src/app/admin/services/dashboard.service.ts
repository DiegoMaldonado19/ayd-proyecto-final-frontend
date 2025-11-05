import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// DTOs según el backend real
export interface DashboardOverviewResponse {
  total_branches: number;
  active_tickets: number;
  active_subscriptions: number;
  total_vehicles_today: number;
  revenue_today: number;
  average_occupancy_percentage: number;
  pending_incidents: number;
  pending_plate_changes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OccupancyDetailResponse {
  branch_id: number;
  branch_name: string;
  total_capacity: number;
  occupied_spaces: number;
  available_spaces: number;
  occupancy_percentage: number;
}

export interface RevenueTodayResponse {
  total_revenue: number;
  total_transactions: number;
  average_transaction: number;
}

export interface SystemAlertResponse {
  id: number;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardOverview(): Observable<DashboardOverviewResponse> {
    return this.http.get<ApiResponse<DashboardOverviewResponse>>(`${this.apiUrl}/overview`)
      .pipe(map(response => response.data));
  }

  getOccupancyDetails(): Observable<OccupancyDetailResponse[]> {
    return this.http.get<ApiResponse<OccupancyDetailResponse[]>>(`${this.apiUrl}/occupancy`)
      .pipe(map(response => response.data));
  }

  getRevenueToday(): Observable<RevenueTodayResponse> {
    return this.http.get<ApiResponse<RevenueTodayResponse>>(`${this.apiUrl}/revenue`)
      .pipe(map(response => response.data));
  }

  getActiveSubscriptionsCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/active-subscriptions`)
      .pipe(map(response => response.data));
  }

  getSystemAlerts(): Observable<SystemAlertResponse[]> {
    return this.http.get<ApiResponse<SystemAlertResponse[]>>(`${this.apiUrl}/alerts`)
      .pipe(map(response => response.data));
  }

  getDashboardByBranch(branchId: number): Observable<DashboardOverviewResponse> {
    return this.http.get<ApiResponse<DashboardOverviewResponse>>(`${this.apiUrl}/by-branch/${branchId}`)
      .pipe(map(response => response.data));
  }
}
