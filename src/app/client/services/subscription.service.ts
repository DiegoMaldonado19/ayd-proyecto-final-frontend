import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../api.config';
import { Subscription, SubscriptionBalance, RenewSubscriptionRequest, CreateSubscriptionRequest, SubscriptionPlan } from '../models/subscription.interface';

/**
 * Servicio para gestionar la suscripción del cliente
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE}/subscriptions`;

  /**
   * Obtiene la suscripción activa del usuario autenticado
   * GET /subscriptions/my-subscription
   * Devuelve el objeto directamente sin wrapper
   */
  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/my-subscription`);
  }

  /**
   * Obtiene el balance de una suscripción específica por ID
   * GET /subscriptions/{id}/balance
   * Devuelve el objeto directamente sin wrapper
   */
  getSubscriptionBalance(subscriptionId: number): Observable<SubscriptionBalance> {
    return this.http.get<SubscriptionBalance>(`${this.baseUrl}/${subscriptionId}/balance`);
  }

  /**
   * Obtiene el balance de la suscripción del usuario autenticado
   * GET /subscriptions/my-subscription/balance
   * Devuelve el objeto directamente sin wrapper
   */
  getMySubscriptionBalance(): Observable<SubscriptionBalance> {
    return this.http.get<SubscriptionBalance>(`${this.baseUrl}/my-subscription/balance`);
  }

  /**
   * Renueva una suscripción específica
   * PUT /subscriptions/{id}
   * @param subscriptionId ID de la suscripción a renovar
   * @param request Datos de renovación (is_annual, auto_renew_enabled)
   * Devuelve la suscripción renovada
   */
  renewSubscription(subscriptionId: number, request: RenewSubscriptionRequest): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.baseUrl}/${subscriptionId}`, request);
  }

  /**
   * Obtiene todos los planes de suscripción disponibles
   * GET /subscription-plans
   * Endpoint público - no requiere autenticación
   */
  getAvailablePlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${API_BASE}/subscription-plans`);
  }

  /**
   * Crea una nueva suscripción para el usuario autenticado
   * POST /subscriptions/my-subscription
   * @param request Datos de la nueva suscripción
   */
  createSubscription(request: CreateSubscriptionRequest): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.baseUrl}`, request);
  }
}
