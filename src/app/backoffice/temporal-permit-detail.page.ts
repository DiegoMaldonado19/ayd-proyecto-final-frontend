import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemporalPermitService } from './services/temporal-permit.service';
import { TemporalPermit } from './models/temporal-permit.interface';

@Component({
  standalone: true,
  selector: 'app-temporal-permit-detail',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-6">
        <button
          (click)="goBack()"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          Detalle del Permiso Temporal
        </h1>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando permiso...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-6">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-red-500 font-semibold mb-1">Error al cargar</h3>
            <p class="text-red-400 text-sm">{{ error() }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="permit() && !loading() && !error()" class="max-w-5xl">
        <!-- Status and ID Header -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div>
                <div class="text-sm text-gray-600 mb-1">Permiso ID</div>
                <div class="text-2xl font-bold text-yellow-600 font-mono">#{{ permit()?.id }}</div>
              </div>
              <div class="h-12 w-px bg-gray-200"></div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Estado</div>
                <span [ngClass]="{
                  'bg-green-100 text-green-700 border-green-300': permit()?.status === 'Activo',
                  'bg-red-100 text-red-700 border-red-300': permit()?.status === 'Vencido',
                  'bg-gray-100 text-gray-700 border-gray-300': permit()?.status !== 'Activo' && permit()?.status !== 'Vencido'
                }" class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border">
                  {{ permit()?.status }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600 mb-1">Fecha de creación</div>
              <div class="text-gray-900 font-medium">{{ formatDate(permit()?.created_at || '') }}</div>
            </div>
          </div>
        </div>

        <!-- Main Info Grid -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <!-- Placa Temporal -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Placa Temporal
            </h2>
            <div class="space-y-3">
              <div>
                <div class="text-sm text-gray-600 mb-1">Placa</div>
                <span class="inline-flex items-center rounded-md bg-yellow-100 text-yellow-800 px-3 py-1.5 text-lg font-mono font-bold">
                  {{ permit()?.temporal_plate }}
                </span>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Tipo de Vehículo</div>
                <div class="text-gray-900 font-medium">{{ permit()?.vehicle_type }}</div>
              </div>
            </div>
          </div>

          <!-- Suscripción -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Suscripción
            </h2>
            <div class="space-y-3">
              <div>
                <div class="text-sm text-gray-600 mb-1">ID de Suscripción</div>
                <div class="text-gray-900 font-mono font-medium">SUB-{{ permit()?.subscription_id }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Período y Validez -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Período de Validez
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <div class="text-sm text-gray-600 mb-1">Fecha de Inicio</div>
              <div class="text-gray-900 font-medium">{{ formatDate(permit()?.start_date || '') }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-1">Fecha de Vencimiento</div>
              <div class="text-gray-900 font-medium">{{ formatDate(permit()?.end_date || '') }}</div>
            </div>
          </div>
        </div>

        <!-- Usos -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Uso del Permiso
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">Usos actuales</span>
              <span class="text-2xl font-bold text-gray-900">{{ permit()?.current_uses }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700">Usos máximos permitidos</span>
              <span class="text-2xl font-bold text-gray-900">{{ permit()?.max_uses }}</span>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Progreso</span>
                <span class="text-sm font-medium text-gray-700">{{ getUsagePercentage() }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div 
                  class="h-4 rounded-full transition-all"
                  [class]="getUsagePercentage() >= 90 ? 'bg-red-500' : getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'"
                  [style.width.%]="getUsagePercentage()">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sucursales Permitidas -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Sucursales Permitidas
          </h2>
          <div *ngIf="permit()?.allowed_branches && permit()!.allowed_branches.length > 0" class="flex flex-wrap gap-2">
            <span 
              *ngFor="let branch of permit()?.allowed_branches"
              class="inline-flex items-center rounded-md bg-indigo-100 text-indigo-700 border border-indigo-300 px-3 py-1.5 text-sm font-medium">
              {{ branch }}
            </span>
          </div>
          <div *ngIf="!permit()?.allowed_branches || permit()!.allowed_branches.length === 0" class="text-gray-500 text-sm">
            No hay sucursales especificadas
          </div>
        </div>

        <!-- Información de Aprobación -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de Aprobación
          </h2>
          <div class="space-y-3">
            <div>
              <div class="text-sm text-gray-600 mb-1">Aprobado por</div>
              <div class="text-gray-900 font-medium">{{ permit()?.approved_by || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-1">Última actualización</div>
              <div class="text-gray-900 font-medium">{{ formatDate(permit()?.updated_at || '') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage()" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage() }}
      </div>

      <!-- Sticky Action Bar (solo si está activo) -->
      <div *ngIf="permit() && permit()?.status === 'Activo' && !loading() && !error()" 
           class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <strong class="text-gray-900">Permiso #{{ permit()?.id }}</strong> - {{ permit()?.temporal_plate }}
          </div>
          <div class="flex gap-3">
            <button
              (click)="editPermit()"
              class="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-6 py-2.5 font-medium hover:bg-blue-700 transition shadow-sm">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              (click)="showRevokeConfirmation()"
              [disabled]="revokingPermit()"
              class="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-6 py-2.5 font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:pointer-events-none shadow-sm">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ revokingPermit() ? 'Revocando...' : 'Revocar Permiso' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div *ngIf="showConfirmModal()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-start mb-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Revocación</h3>
              <p class="text-gray-600 text-sm">
                ¿Estás seguro que deseas revocar el permiso temporal <strong class="font-mono">{{ permit()?.temporal_plate }}</strong>? 
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <button
              (click)="closeConfirmModal()"
              [disabled]="revokingPermit()"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50">
              Cancelar
            </button>
            <button
              (click)="confirmRevoke()"
              [disabled]="revokingPermit()"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:pointer-events-none">
              {{ revokingPermit() ? 'Revocando...' : 'Sí, Revocar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class TemporalPermitDetailPage implements OnInit {
  private temporalPermitService = inject(TemporalPermitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  permit = signal<TemporalPermit | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Revoke functionality
  showConfirmModal = signal<boolean>(false);
  revokingPermit = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPermit(parseInt(id, 10));
    } else {
      this.error.set('ID de permiso no válido');
    }
  }

  async loadPermit(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const permit = await this.temporalPermitService.getTemporalPermitById(id).toPromise();
      this.permit.set(permit || null);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar el permiso temporal');
      console.error('Error loading temporal permit:', err);
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/backoffice/temporal-permits']);
  }

  editPermit(): void {
    const permitId = this.permit()?.id;
    if (permitId) {
      this.router.navigate(['/backoffice/temporal-permits', permitId, 'edit']);
    }
  }

  showRevokeConfirmation(): void {
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  async confirmRevoke(): Promise<void> {
    const permitId = this.permit()?.id;
    if (!permitId) return;

    this.revokingPermit.set(true);

    try {
      const updatedPermit = await this.temporalPermitService
        .revokeTemporalPermit(permitId)
        .toPromise();

      // Update the permit with the new data
      this.permit.set(updatedPermit || null);
      
      // Close modal and show success message
      this.closeConfirmModal();
      this.successMessage.set('Permiso revocado exitosamente');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set(null);
      }, 3000);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al revocar el permiso temporal');
      console.error('Error revoking temporal permit:', err);
      this.closeConfirmModal();
    } finally {
      this.revokingPermit.set(false);
    }
  }

  getUsagePercentage(): number {
    const p = this.permit();
    if (!p || p.max_uses === 0) return 0;
    return Math.round((p.current_uses / p.max_uses) * 100);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
