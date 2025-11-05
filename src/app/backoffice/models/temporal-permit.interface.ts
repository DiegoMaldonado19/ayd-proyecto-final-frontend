/**
 * Modelo de permiso temporal según respuesta del backend
 */
export interface TemporalPermit {
  id: number;
  subscription_id: number;
  temporal_plate: string;
  start_date: string;
  end_date: string;
  max_uses: number;
  current_uses: number;
  allowed_branches: number[];
  vehicle_type: string;
  status: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
}
