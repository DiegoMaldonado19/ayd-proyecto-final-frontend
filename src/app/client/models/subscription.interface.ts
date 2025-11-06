/**
 * Plan de suscripción
 */
export interface SubscriptionPlan {
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

/**
 * Suscripción del usuario
 */
export interface Subscription {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  plan: SubscriptionPlan;
  license_plate: string;
  frozen_rate_base: number;
  purchase_date: string;
  start_date: string;
  end_date: string;
  consumed_hours: number;
  status_name: string;
  is_annual: boolean;
  auto_renew_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Balance de suscripción
 */
export interface SubscriptionBalance {
  subscription_id: number;
  monthly_hours: number;
  consumed_hours: number;
  remaining_hours: number;
  consumption_percentage: number;
  days_until_expiration: number;
}

/**
 * Request para renovar suscripción
 */
export interface RenewSubscriptionRequest {
  is_annual: boolean;
  auto_renew_enabled: boolean;
}
