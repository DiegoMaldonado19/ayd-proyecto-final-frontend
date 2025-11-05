import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemporalPermitService } from './services/temporal-permit.service';
import { TemporalPermit } from './models/temporal-permit.interface';

@Component({
  standalone: true,
  selector: 'app-temporal-permits',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Permisos Temporales
        </h1>
        <p class="text-gray-600">
          Gestiona y revisa los permisos temporales de los clientes.
        </p>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex gap-4">
        <button
          (click)="filterType.set('all')"
          [class]="filterType() === 'all' 
            ? 'bg-yellow-400 text-gray-900 shadow-md' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 shadow-sm transition duration-200 font-medium">
          Todos ({{ allPermits().length }})
        </button>
        <button
          (click)="filterType.set('active')"
          [class]="filterType() === 'active' 
            ? 'bg-yellow-400 text-gray-900 shadow-md' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 shadow-sm transition duration-200 font-medium">
          Activos ({{ activePermits().length }})
        </button>
        <button
          (click)="createNew()"
          class="ml-auto inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 shadow-sm transition duration-200 hover:bg-green-700 font-medium">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Nuevo
        </button>
        <button
          (click)="loadData()"
          [disabled]="loading()"
          class="inline-flex items-center justify-center rounded-md bg-white text-gray-700 border border-gray-300 px-4 py-2 shadow-sm transition duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none font-medium">
          <svg class="w-4 h-4 mr-2" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando permisos...</p>
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
      <div *ngIf="!loading() && !error() && displayedPermits().length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-gray-900 text-lg font-semibold mb-2">No hay permisos</h3>
        <p class="text-gray-600">
          {{ filterType() === 'active' ? 'No hay permisos temporales activos.' : 'No se encontraron permisos temporales.' }}
        </p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading() && !error() && displayedPermits().length > 0" class="overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table class="min-w-full text-sm text-gray-900">
          <thead class="bg-gray-50 sticky top-0 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">ID</th>
              <th class="px-4 py-3 text-left font-semibold">Placa Temporal</th>
              <th class="px-4 py-3 text-left font-semibold">Suscripción</th>
              <th class="px-4 py-3 text-left font-semibold">Tipo Vehículo</th>
              <th class="px-4 py-3 text-left font-semibold">Período</th>
              <th class="px-4 py-3 text-left font-semibold">Usos</th>
              <th class="px-4 py-3 text-left font-semibold">Estado</th>
              <th class="px-4 py-3 text-left font-semibold">Aprobado por</th>
              <th class="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let permit of displayedPermits()" class="hover:bg-gray-50 transition">
              <td class="px-4 py-4 font-mono text-yellow-600">#{{ permit.id }}</td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2.5 py-0.5 text-xs font-mono font-semibold">
                  {{ permit.temporal_plate }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="font-mono text-gray-600">SUB-{{ permit.subscription_id }}</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-gray-700">{{ permit.vehicle_type }}</span>
              </td>
              <td class="px-4 py-4">
                <div class="text-xs">
                  <div class="text-gray-600">{{ formatDate(permit.start_date, 'short') }}</div>
                  <div class="text-gray-400">hasta</div>
                  <div class="text-gray-600">{{ formatDate(permit.end_date, 'short') }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                    <div 
                      class="h-2 rounded-full transition-all"
                      [class]="getUsagePercentage(permit) >= 90 ? 'bg-red-500' : getUsagePercentage(permit) >= 70 ? 'bg-yellow-500' : 'bg-green-500'"
                      [style.width.%]="getUsagePercentage(permit)">
                    </div>
                  </div>
                  <span class="text-xs font-medium text-gray-600">
                    {{ permit.current_uses }}/{{ permit.max_uses }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span [ngClass]="{
                  'bg-green-100 text-green-700 border-green-300': permit.status === 'Activo',
                  'bg-red-100 text-red-700 border-red-300': permit.status === 'Vencido',
                  'bg-gray-100 text-gray-700 border-gray-300': permit.status !== 'Activo' && permit.status !== 'Vencido'
                }" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border">
                  {{ permit.status }}
                </span>
              </td>
              <td class="px-4 py-4 text-gray-700">
                {{ permit.approved_by }}
              </td>
              <td class="px-4 py-4 text-right">
                <button
                  (click)="viewDetails(permit.id)"
                  class="inline-flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 text-xs font-medium hover:bg-blue-100 transition">
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class TemporalPermitsBackofficePage implements OnInit {
  private temporalPermitService = inject(TemporalPermitService);
  private router = inject(Router);

  // Signals for state management
  allPermits = signal<TemporalPermit[]>([]);
  activePermits = signal<TemporalPermit[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  filterType = signal<'all' | 'active'>('active');

  // Computed signal for displayed permits
  displayedPermits = signal<TemporalPermit[]>([]);

  ngOnInit(): void {
    this.loadData();
    // Update displayed permits when filter changes
    this.watchFilterChanges();
  }

  private watchFilterChanges(): void {
    // Using effect would be better, but for simplicity:
    setInterval(() => {
      if (this.filterType() === 'all') {
        this.displayedPermits.set(this.allPermits());
      } else {
        this.displayedPermits.set(this.activePermits());
      }
    }, 100);
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [all, active] = await Promise.all([
        this.temporalPermitService.getAllTemporalPermits().toPromise(),
        this.temporalPermitService.getActiveTemporalPermits().toPromise()
      ]);

      this.allPermits.set(all || []);
      this.activePermits.set(active || []);
      
      // Update displayed permits
      if (this.filterType() === 'all') {
        this.displayedPermits.set(all || []);
      } else {
        this.displayedPermits.set(active || []);
      }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar los permisos temporales');
      console.error('Error loading temporal permits:', err);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/backoffice/temporal-permits', id]);
  }

  createNew(): void {
    this.router.navigate(['/backoffice/temporal-permits/new']);
  }

  getUsagePercentage(permit: TemporalPermit): number {
    if (permit.max_uses === 0) return 0;
    return (permit.current_uses / permit.max_uses) * 100;
  }

  formatDate(date: string, format: 'short' | 'long' = 'long'): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    
    if (format === 'short') {
      return d.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return d.toLocaleString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
