import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReportService, 
  OccupancyReportItem, 
  BillingReportItem, 
  SubscriptionReportItem,
  CommerceBenefitReportItem,
  IncidentFleetReportItem
} from './services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReportsComponent {
  private reportService = inject(ReportService);
  
  activeTab = signal<string>('occupancy');
  loading = signal(false);
  exporting = signal(false);
  
  occupancyData = signal<OccupancyReportItem[]>([]);
  billingData = signal<BillingReportItem[]>([]);
  subscriptionData = signal<SubscriptionReportItem[]>([]);
  commerceBenefitsData = signal<CommerceBenefitReportItem[]>([]);
  incidentsData = signal<IncidentFleetReportItem[]>([]);

  tabs = [
    { id: 'occupancy', label: 'Ocupacion', icon: '🚗' },
    { id: 'billing', label: 'Facturacion', icon: '💰' },
    { id: 'subscriptions', label: 'Suscripciones', icon: '💳' },
    { id: 'commerce-benefits', label: 'Beneficios', icon: '🏪' },
    { id: 'incidents', label: 'Incidencias', icon: '⚠️' }
  ];

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      this.loadDataForTab(tab);
    });
  }

  async loadDataForTab(tab: string) {
    this.loading.set(true);
    try {
      switch (tab) {
        case 'occupancy':
          if (this.occupancyData().length === 0) {
            const data = await this.reportService.getOccupancyReport();
            console.log('Occupancy data received:', data);
            this.occupancyData.set(Array.isArray(data) ? data : []);
          }
          break;
        case 'billing':
          if (this.billingData().length === 0) {
            const data = await this.reportService.getBillingReport();
            console.log('Billing data received:', data);
            this.billingData.set(Array.isArray(data) ? data : []);
          }
          break;
        case 'subscriptions':
          if (this.subscriptionData().length === 0) {
            const data = await this.reportService.getSubscriptionsReport();
            console.log('Subscription data received:', data);
            this.subscriptionData.set(Array.isArray(data) ? data : []);
          }
          break;
        case 'commerce-benefits':
          if (this.commerceBenefitsData().length === 0) {
            const data = await this.reportService.getCommerceBenefitsReport();
            console.log('Commerce benefits data received:', data);
            this.commerceBenefitsData.set(Array.isArray(data) ? data : []);
          }
          break;
        case 'incidents':
          if (this.incidentsData().length === 0) {
            const data = await this.reportService.getIncidentsReport();
            console.log('Incidents data received:', data);
            this.incidentsData.set(Array.isArray(data) ? data : []);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos del reporte');
    } finally {
      this.loading.set(false);
    }
  }

  async exportReport(format: 'PDF' | 'EXCEL' | 'PNG') {
    this.exporting.set(true);
    
    const currentTab = this.activeTab();
    
    const reportTitles: Record<string, string> = {
      'occupancy': 'Reporte_Ocupacion',
      'billing': 'Reporte_Facturacion',
      'subscriptions': 'Reporte_Suscripciones',
      'commerce-benefits': 'Reporte_Beneficios',
      'incidents': 'Reporte_Incidencias'
    };

    const filename = `${reportTitles[currentTab] || 'Reporte'}_${new Date().toISOString().split('T')[0]}`;
    const elementId = `report-content-${currentTab}`;

    try {
      // Usar el método apropiado según el formato
      switch (format) {
        case 'PDF':
          await this.reportService.exportToPDF(elementId, filename);
          break;
        case 'EXCEL':
          // Para Excel, pasamos los datos reales de la API
          const data = this.getCurrentReportData();
          await this.reportService.exportToExcel(filename, currentTab, data);
          break;
        case 'PNG':
          await this.reportService.exportToPNG(elementId, filename);
          break;
      }
      console.log('✅ Reporte exportado exitosamente:', filename);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar el reporte');
    } finally {
      this.exporting.set(false);
    }
  }

  /**
   * Obtener los datos del reporte activo
   */
  private getCurrentReportData(): any[] {
    switch (this.activeTab()) {
      case 'occupancy':
        return this.occupancyData();
      case 'billing':
        return this.billingData();
      case 'subscriptions':
        return this.subscriptionData();
      case 'commerce-benefits':
        return this.commerceBenefitsData();
      case 'incidents':
        return this.incidentsData();
      default:
        return [];
    }
  }

  // Occupancy helpers
  getTotalSpots(): number {
    return this.occupancyData().reduce((sum, item) => sum + item.total_capacity, 0);
  }

  getOccupiedSpots(): number {
    return this.occupancyData().reduce((sum, item) => sum + item.current_occupancy, 0);
  }

  getAvailableSpots(): number {
    return this.occupancyData().reduce((sum, item) => sum + (item.total_capacity - item.current_occupancy), 0);
  }

  getAverageOccupancy(): string {
    const data = this.occupancyData();
    if (data.length === 0) return '0.0';
    const avg = data.reduce((sum, item) => sum + item.occupancy_percentage, 0) / data.length;
    return avg.toFixed(1);
  }

  getVehicleTypeBadge(type: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (type) {
      case '2R': return `${baseClasses} bg-orange-100 text-orange-800`;
      case '4R': return `${baseClasses} bg-blue-100 text-blue-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getVehicleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      '2R': 'Motocicleta (2R)',
      '4R': 'Automóvil (4R)'
    };
    return labels[type] || type;
  }

  // Billing helpers
  getTotalRevenue(): number {
    return this.billingData().reduce((sum, item) => sum + item.total_revenue, 0);
  }

  getTotalTickets(): number {
    return this.billingData().reduce((sum, item) => sum + item.total_tickets, 0);
  }

  getAverageTicketValue(): number {
    const data = this.billingData();
    if (data.length === 0) return 0;
    const totalValue = data.reduce((sum, item) => sum + item.average_ticket_value, 0);
    return totalValue / data.length;
  }

  getPaymentMethodBadge(method: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (method) {
      case 'EFECTIVO': return `${baseClasses} bg-green-100 text-green-800`;
      case 'TARJETA': return `${baseClasses} bg-blue-100 text-blue-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  // Subscription helpers
  getTotalActiveSubs(): number {
    const data = this.subscriptionData();
    return data.length > 0 ? data[0].active_subscriptions : 0;
  }

  getTotalExpiredSubs(): number {
    const data = this.subscriptionData();
    return data.length > 0 ? data[0].expired_subscriptions : 0;
  }

  getTotalExpiringSoon(): number {
    const data = this.subscriptionData();
    return data.length > 0 ? data[0].expiring_soon : 0;
  }

  getTotalSubs(): number {
    const data = this.subscriptionData();
    return data.length > 0 ? data[0].total_subscriptions : 0;
  }

  // Commerce benefits helpers
  getActiveSubsFromBenefits(): number {
    const data = this.commerceBenefitsData();
    return data.length > 0 ? data[0].active_subscriptions : 0;
  }

  getTotalRevenueFromSubs(): number {
    const data = this.commerceBenefitsData();
    return data.length > 0 ? data[0].total_revenue_from_subscriptions : 0;
  }

  getTotalSubsSold(): number {
    const data = this.commerceBenefitsData();
    return data.length > 0 ? data[0].total_subscriptions_sold : 0;
  }

  // Incidents helpers
  getPendingIncidents(): number {
    const data = this.incidentsData();
    return data.length > 0 ? data[0].pending_incidents : 0;
  }

  getResolvedIncidents(): number {
    const data = this.incidentsData();
    return data.length > 0 ? data[0].resolved_incidents : 0;
  }

  getTotalIncidents(): number {
    const data = this.incidentsData();
    return data.length > 0 ? data[0].total_incidents : 0;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (error) {
      return dateString;
    }
  }
}
