import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlateChangeService } from './services/plate-change.service';
import { PlateChange, ReviewPlateChangeRequest } from './models/plate-change.interface';

@Component({
  standalone: true,
  selector: 'app-plate-changes',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-surface-900 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-ice-50 mb-2">
          Solicitudes de Cambio de Placa
        </h1>
        <p class="text-slatex-600">
          Gestiona y revisa las solicitudes de cambio de placas de los clientes.
        </p>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex gap-4">
        <button
          (click)="filterType.set('all')"
          [class]="filterType() === 'all' 
            ? 'bg-sun-400 text-ink-900 shadow-md' 
            : 'bg-surface-700 text-ice-50 border border-white/10 hover:bg-surface-600'"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 shadow-sm transition duration-200 font-medium">
          Todas ({{ allChanges().length }})
        </button>
        <button
          (click)="filterType.set('pending')"
          [class]="filterType() === 'pending' 
            ? 'bg-sun-400 text-ink-900 shadow-md' 
            : 'bg-surface-700 text-ice-50 border border-white/10 hover:bg-surface-600'"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 shadow-sm transition duration-200 font-medium">
          Pendientes ({{ pendingChanges().length }})
        </button>
        <button
          (click)="loadData()"
          [disabled]="loading()"
          class="ml-auto inline-flex items-center justify-center rounded-md bg-surface-700 text-ice-50 border border-white/10 px-4 py-2 shadow-sm transition duration-200 hover:bg-surface-600 disabled:opacity-50 disabled:pointer-events-none font-medium">
          <svg class="w-4 h-4 mr-2" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-sun-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-slatex-600">Cargando solicitudes...</p>
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

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && displayedChanges().length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-slatex-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-ice-50 text-lg font-semibold mb-2">No hay solicitudes</h3>
        <p class="text-slatex-600">
          {{ filterType() === 'pending' ? 'No hay solicitudes pendientes de revisión.' : 'No se encontraron solicitudes de cambio de placa.' }}
        </p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading() && !error() && displayedChanges().length > 0" class="overflow-auto rounded-lg border border-white/10 shadow-lg">
        <table class="min-w-full text-sm text-ice-50">
          <thead class="bg-surface-800 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">ID</th>
              <th class="px-4 py-3 text-left font-semibold">Usuario</th>
              <th class="px-4 py-3 text-left font-semibold">Placa Anterior</th>
              <th class="px-4 py-3 text-left font-semibold">Placa Nueva</th>
              <th class="px-4 py-3 text-left font-semibold">Razón</th>
              <th class="px-4 py-3 text-left font-semibold">Estado</th>
              <th class="px-4 py-3 text-left font-semibold">Evidencias</th>
              <th class="px-4 py-3 text-left font-semibold">Fecha</th>
              <th class="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr *ngFor="let change of displayedChanges()" class="hover:bg-white/5 transition">
              <td class="px-4 py-4 font-mono text-sun-400">#{{ change.id }}</td>
              <td class="px-4 py-4">
                <div class="font-medium">{{ change.user_name }}</div>
                <div class="text-xs text-slatex-600">ID: {{ change.user_id }}</div>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center rounded-full bg-white/10 text-ice-50 px-2.5 py-0.5 text-xs font-mono">
                  {{ change.old_license_plate }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center rounded-full bg-sun-400 text-ink-900 px-2.5 py-0.5 text-xs font-mono font-semibold">
                  {{ change.new_license_plate }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="font-medium">{{ change.reason_name }}</div>
                <div class="text-xs text-slatex-600" *ngIf="change.notes">{{ change.notes }}</div>
              </td>
              <td class="px-4 py-4">
                <span [ngClass]="{
                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': change.status_code === 'PENDING',
                  'bg-green-500/20 text-green-400 border-green-500/30': change.status_code === 'APPROVED',
                  'bg-red-500/20 text-red-400 border-red-500/30': change.status_code === 'REJECTED'
                }" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border">
                  {{ change.status_name }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <span class="inline-flex items-center text-blue-400">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  {{ change.evidence_count }}
                </span>
              </td>
              <td class="px-4 py-4 text-slatex-600 text-xs">
                {{ formatDate(change.created_at) }}
              </td>
              <td class="px-4 py-4 text-right">
                <button
                  (click)="viewDetails(change)"
                  class="inline-flex items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/20 transition">
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="selectedChange()" class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" (click)="closeDetails()">
        <div class="w-full max-w-2xl rounded-xl bg-surface-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-ice-50 mb-1">
                Solicitud #{{ selectedChange()!.id }}
              </h2>
              <p class="text-slatex-600 text-sm">
                Creada el {{ formatDate(selectedChange()!.created_at) }}
              </p>
            </div>
            <button
              (click)="closeDetails()"
              class="text-slatex-600 hover:text-ice-50 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="space-y-6">
            <!-- Usuario -->
            <div>
              <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Usuario</label>
              <div class="rounded-lg bg-surface-800 p-4">
                <div class="font-semibold text-ice-50">{{ selectedChange()!.user_name }}</div>
                <div class="text-sm text-slatex-600">ID: {{ selectedChange()!.user_id }} • Suscripción: {{ selectedChange()!.subscription_id }}</div>
              </div>
            </div>

            <!-- Placas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Placa Anterior</label>
                <div class="rounded-lg bg-surface-800 p-4 text-center">
                  <span class="inline-flex items-center rounded-full bg-white/10 text-ice-50 px-3 py-1.5 text-sm font-mono font-semibold">
                    {{ selectedChange()!.old_license_plate }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Placa Nueva</label>
                <div class="rounded-lg bg-surface-800 p-4 text-center">
                  <span class="inline-flex items-center rounded-full bg-sun-400 text-ink-900 px-3 py-1.5 text-sm font-mono font-semibold">
                    {{ selectedChange()!.new_license_plate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Razón -->
            <div>
              <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Razón del Cambio</label>
              <div class="rounded-lg bg-surface-800 p-4">
                <div class="font-semibold text-ice-50 mb-1">{{ selectedChange()!.reason_name }}</div>
                <div class="text-sm text-slatex-600" *ngIf="selectedChange()!.notes">{{ selectedChange()!.notes }}</div>
              </div>
            </div>

            <!-- Evidencias -->
            <div>
              <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Evidencias</label>
              <div class="rounded-lg bg-surface-800 p-4 text-center">
                <svg class="w-12 h-12 text-blue-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                </svg>
                <div class="text-ice-50 font-semibold">{{ selectedChange()!.evidence_count }} archivos adjuntos</div>
                <div class="text-xs text-slatex-600 mt-1">Fotografías o documentos de soporte</div>
              </div>
            </div>

            <!-- Estado y Revisión -->
            <div>
              <label class="block text-slatex-600 text-xs font-semibold uppercase mb-2">Estado</label>
              <div class="rounded-lg bg-surface-800 p-4">
                <div class="flex items-center justify-between mb-3">
                  <span [ngClass]="{
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': selectedChange()!.status_code === 'PENDING',
                    'bg-green-500/20 text-green-400 border-green-500/30': selectedChange()!.status_code === 'APPROVED',
                    'bg-red-500/20 text-red-400 border-red-500/30': selectedChange()!.status_code === 'REJECTED'
                  }" class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border">
                    {{ selectedChange()!.status_name }}
                  </span>
                </div>
                <div *ngIf="selectedChange()!.reviewed_by" class="text-sm">
                  <div class="text-slatex-600 mb-1">Revisado por: <span class="text-ice-50 font-medium">{{ selectedChange()!.reviewer_name }}</span></div>
                  <div class="text-slatex-600 mb-1">Fecha de revisión: <span class="text-ice-50">{{ formatDate(selectedChange()!.reviewed_at!) }}</span></div>
                  <div class="text-slatex-600" *ngIf="selectedChange()!.review_notes">Notas: <span class="text-ice-50">{{ selectedChange()!.review_notes }}</span></div>
                </div>
              </div>
            </div>

            <!-- Acciones (solo si está pendiente) -->
            <div *ngIf="selectedChange()!.status_code === 'PENDING'" class="flex gap-3">
              <button
                (click)="approvePlateChange(selectedChange()!.id)"
                [disabled]="processing()"
                class="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2.5 shadow-md transition duration-200 hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none font-medium">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Aprobar
              </button>
              <button
                (click)="rejectPlateChange(selectedChange()!.id)"
                [disabled]="processing()"
                class="flex-1 inline-flex items-center justify-center rounded-md bg-red-600 text-white px-4 py-2.5 shadow-md transition duration-200 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none font-medium">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Toast -->
      <div *ngIf="successMessage()" class="fixed bottom-4 right-4 z-50 pointer-events-auto rounded-md bg-green-600 text-white px-4 py-3 shadow-lg border border-green-500/20 max-w-sm animate-slide-in">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">{{ successMessage() }}</span>
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
export class PlateChangesBackofficePage implements OnInit {
  private plateChangeService = inject(PlateChangeService);

  // Signals for state management
  allChanges = signal<PlateChange[]>([]);
  pendingChanges = signal<PlateChange[]>([]);
  loading = signal<boolean>(false);
  processing = signal<boolean>(false);
  error = signal<string | null>(null);
  filterType = signal<'all' | 'pending'>('pending');
  selectedChange = signal<PlateChange | null>(null);
  successMessage = signal<string | null>(null);

  // Computed signal for displayed changes
  displayedChanges = signal<PlateChange[]>([]);

  ngOnInit(): void {
    this.loadData();
    // Update displayed changes when filter changes
    this.watchFilterChanges();
  }

  private watchFilterChanges(): void {
    // Using effect would be better, but for simplicity:
    setInterval(() => {
      if (this.filterType() === 'all') {
        this.displayedChanges.set(this.allChanges());
      } else {
        this.displayedChanges.set(this.pendingChanges());
      }
    }, 100);
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [all, pending] = await Promise.all([
        this.plateChangeService.getAllPlateChanges().toPromise(),
        this.plateChangeService.getPendingPlateChanges().toPromise()
      ]);

      this.allChanges.set(all || []);
      this.pendingChanges.set(pending || []);
      
      // Update displayed changes
      if (this.filterType() === 'all') {
        this.displayedChanges.set(all || []);
      } else {
        this.displayedChanges.set(pending || []);
      }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar las solicitudes');
      console.error('Error loading plate changes:', err);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(change: PlateChange): void {
    this.selectedChange.set(change);
  }

  closeDetails(): void {
    this.selectedChange.set(null);
  }

  async approvePlateChange(id: number): Promise<void> {
    if (!confirm('¿Está seguro que desea aprobar esta solicitud?')) {
      return;
    }

    this.processing.set(true);
    try {
      const request: ReviewPlateChangeRequest = {
        status: 'APPROVED',
        review_notes: 'Aprobado desde el panel de backoffice'
      };

      await this.plateChangeService.reviewPlateChange(id, request).toPromise();
      this.showSuccess('Solicitud aprobada exitosamente');
      this.closeDetails();
      await this.loadData();
    } catch (err: any) {
      alert(err?.error?.message || 'Error al aprobar la solicitud');
      console.error('Error approving plate change:', err);
    } finally {
      this.processing.set(false);
    }
  }

  async rejectPlateChange(id: number): Promise<void> {
    const reason = prompt('Ingrese el motivo del rechazo:');
    if (!reason) {
      return;
    }

    this.processing.set(true);
    try {
      const request: ReviewPlateChangeRequest = {
        status: 'REJECTED',
        review_notes: reason
      };

      await this.plateChangeService.reviewPlateChange(id, request).toPromise();
      this.showSuccess('Solicitud rechazada');
      this.closeDetails();
      await this.loadData();
    } catch (err: any) {
      alert(err?.error?.message || 'Error al rechazar la solicitud');
      console.error('Error rejecting plate change:', err);
    } finally {
      this.processing.set(false);
    }
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 3000);
  }
}
