/**
 * Modelo de cambio de placa según respuesta del backend
 */
export interface PlateChange {
  id: number;
  subscription_id: number;
  user_id: number;
  user_name: string;
  old_license_plate: string;
  new_license_plate: string;
  reason_id: number;
  reason_name: string;
  notes: string;
  status_id: number;
  status_code: 'PENDING' | 'APPROVED' | 'REJECTED';
  status_name: string;
  reviewed_by: number | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  evidence_count: number;
}

/**
 * Request para aprobar/rechazar cambio de placa
 */
export interface ReviewPlateChangeRequest {
  status: 'APPROVED' | 'REJECTED';
  review_notes: string;
}
