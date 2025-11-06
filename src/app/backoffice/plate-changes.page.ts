import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlateChangeService } from './services/plate-change.service';
import { PlateChange } from './models/plate-change.interface';

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
                  (click)="viewDetails(change.id)"
                  class="inline-flex items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/20 transition">
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
  private router = inject(Router);

  // Signals for state management
  allChanges = signal<PlateChange[]>([]);
  pendingChanges = signal<PlateChange[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  filterType = signal<'all' | 'pending'>('pending');

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

  viewDetails(id: number): void {
    this.router.navigate(['/backoffice/plate-changes', id]);
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
}
