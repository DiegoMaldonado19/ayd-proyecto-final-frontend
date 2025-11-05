import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../shared/components/card.component';
import { ButtonComponent } from '../shared/components/button.component';
import { BadgeComponent } from '../shared/components/badge.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner.component';
import { DashboardService, DashboardOverviewResponse, SystemAlertResponse } from './services/dashboard.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, BadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      
      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ error() }}</p>
          <button 
            (click)="loadData()"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Reintentar
          </button>
        </div>
      }

      <!-- KPI Cards -->
      @if (!loading() && !error() && stats()) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <app-card title="Sucursales Activas">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-blue-600">{{ stats()?.total_branches || 0 }}</div>
            <p class="text-gray-600 mt-2 text-sm">Operando actualmente</p>
          </div>
        </app-card>

        <app-card title="Tickets Activos">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-green-600">{{ stats()?.active_tickets || 0 }}</div>
            <p class="text-gray-600 mt-2 text-sm">Vehículos en sucursales</p>
          </div>
        </app-card>

        <app-card title="Suscripciones">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-yellow-600">{{ stats()?.active_subscriptions || 0 }}</div>
            <p class="text-gray-600 mt-2 text-sm">Suscripciones activas</p>
          </div>
        </app-card>

        <app-card title="Ingresos Hoy">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-purple-600">\${{ (stats()?.revenue_today || 0).toFixed(2) }}</div>
            <p class="text-gray-600 mt-2 text-sm">{{ stats()?.total_vehicles_today || 0 }} vehículos</p>
          </div>
        </app-card>
      </div>
      }

      <!-- Metrics Summary -->
      @if (!loading() && !error() && stats()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <app-card title="Ocupación Promedio">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-indigo-600">{{ (stats()?.average_occupancy_percentage || 0).toFixed(1) }}%</div>
            <p class="text-gray-600 mt-2 text-sm">Promedio de todas las sucursales</p>
          </div>
        </app-card>

        <app-card title="Incidentes Pendientes">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-orange-600">{{ stats()?.pending_incidents || 0 }}</div>
            <p class="text-gray-600 mt-2 text-sm">Requieren atención</p>
          </div>
        </app-card>

        <app-card title="Cambios de Placa">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-pink-600">{{ stats()?.pending_plate_changes || 0 }}</div>
            <p class="text-gray-600 mt-2 text-sm">Solicitudes pendientes</p>
          </div>
        </app-card>
      </div>
      }

      <!-- System Alerts -->
      @if (!loading() && !error() && alerts() && alerts()!.length > 0) {
      <app-card title="Alertas del Sistema">
        <div class="space-y-3">
          @for (alert of alerts(); track alert.id) {
          <div class="flex items-center justify-between border-b pb-3 last:border-b-0">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ alert.message }}</p>
              <p class="text-sm text-gray-500">{{ formatTimestamp(alert.timestamp) }}</p>
            </div>
            <app-badge [variant]="getAlertBadgeVariant(alert.severity)">
              {{ alert.severity }}
            </app-badge>
          </div>
          }
        </div>
      </app-card>
      }

      <!-- Recent Activity -->
      @if (!loading() && !error() && recentActivity()) {
      <app-card title="Actividad Reciente">
        <div class="space-y-3">
          @if (recentActivity()!.length === 0) {
            <p class="text-gray-500 text-center py-4">No hay actividad reciente</p>
          }
          @for (activity of recentActivity(); track activity.id) {
          <div class="flex items-center justify-between border-b pb-3 last:border-b-0">
            <div>
              <p class="font-medium text-gray-800">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ formatTimestamp(activity.timestamp) }}</p>
            </div>
            <app-badge [variant]="getActivityBadgeVariant(activity.type)">
              {{ getActivityTypeLabel(activity.type) }}
            </app-badge>
          </div>
          }
        </div>
      </app-card>
      }

      <!-- Reports Section -->
      @if (!loading() && !error()) {
      <div class="mt-8">
        <app-card title="Reportes y Analytics">
          <div class="space-y-4">
            <p class="text-gray-600">Genera reportes detallados del sistema</p>
            <div class="flex gap-3 flex-wrap">
              <app-button variant="secondary" size="sm" [routerLink]="['/reports']">
                Reporte de Ingresos
              </app-button>
              <app-button variant="secondary" size="sm">
                Reporte de Tickets
              </app-button>
              <app-button variant="secondary" size="sm">
                Reporte de Ocupación
              </app-button>
              <app-button variant="secondary" size="sm">
                Exportar a Excel
              </app-button>
            </div>
          </div>
        </app-card>
      </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<DashboardOverviewResponse | null>(null);
  alerts = signal<SystemAlertResponse[]>([]);
  recentActivity = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Cargar overview del dashboard
      const overview = await this.dashboardService.getDashboardOverview().toPromise();
      this.stats.set(overview || null);

      // Cargar alertas del sistema
      const systemAlerts = await this.dashboardService.getSystemAlerts().toPromise();
      this.alerts.set(systemAlerts || []);

      // Mock de actividad reciente (hasta que el backend tenga este endpoint)
      this.recentActivity.set([
        {
          id: 1,
          description: 'Ticket creado en sucursal Plaza Central',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          type: 'CREATE'
        },
        {
          id: 2,
          description: 'Suscripción activada para empresa FlotaMax',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'CREATE'
        },
        {
          id: 3,
          description: 'Incidente reportado en sucursal Norte',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'UPDATE'
        }
      ]);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      this.error.set('Error al cargar los datos del dashboard. Por favor, verifica tu conexión.');
    } finally {
      this.loading.set(false);
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
  }

  getActivityBadgeVariant(type: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
    switch (type) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      case 'SYSTEM': return 'default';
      default: return 'default';
    }
  }

  getActivityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Nuevo',
      UPDATE: 'Actualización',
      DELETE: 'Eliminado',
      SYSTEM: 'Sistema'
    };
    return labels[type] || type;
  }

  getAlertBadgeVariant(severity: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  }
}
