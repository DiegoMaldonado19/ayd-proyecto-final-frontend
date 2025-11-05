import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api.config';
import { firstValueFrom } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// ==================== DTOs para Reportes ====================

// Reporte de Ocupación (por sucursal y tipo de vehículo)
export interface OccupancyReportItem {
  branch_id: number;
  branch_name: string;
  vehicle_type: string;          // '2R' o '4R'
  total_capacity: number;
  current_occupancy: number;
  peak_occupancy: number;
  average_occupancy: number;
  occupancy_percentage: number;
}

// Reporte de Facturación (ingresos por método de pago)
export interface BillingReportItem {
  branch_id: number;
  branch_name: string;
  total_tickets: number;
  total_revenue: number;
  average_ticket_value: number;
  payment_method: string;        // 'EFECTIVO', 'TARJETA', etc.
}

// Reporte de Suscripciones (resumen general)
export interface SubscriptionReportItem {
  active_subscriptions: number;
  expired_subscriptions: number;
  expiring_soon: number;
  total_subscriptions: number;
}

// Reporte de Beneficios (ingresos de suscripciones)
export interface CommerceBenefitReportItem {
  active_subscriptions: number;
  total_revenue_from_subscriptions: number;
  total_subscriptions_sold: number;
}

// Reporte de Incidencias (resumen de incidentes)
export interface IncidentFleetReportItem {
  pending_incidents: number;
  resolved_incidents: number;
  total_incidents: number;
}

export interface ExportReportRequest {
  report_type: 'occupancy' | 'billing' | 'subscriptions' | 'commerce-benefits' | 'incidents' | 'fleets' | 'cash-closing';
  export_format: 'PDF' | 'EXCEL' | 'PNG';
  date_from?: string;
  date_to?: string;
  filters?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);

  /**
   * Obtener reporte de ocupación (por sucursal y tipo)
   * GET /reports/occupancy
   */
  async getOccupancyReport(): Promise<OccupancyReportItem[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${API_BASE}/reports/occupancy`)
    );
    // Si el backend devuelve { data: [...] }, extraer el array
    return Array.isArray(response) ? response : (response?.data || []);
  }

  /**
   * Obtener reporte de facturación (ingresos por cobros y excedentes)
   * GET /reports/billing
   */
  async getBillingReport(): Promise<BillingReportItem[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${API_BASE}/reports/billing`)
    );
    return Array.isArray(response) ? response : (response?.data || []);
  }

  /**
   * Obtener reporte de suscripciones (activas, inactivas, consumo, saldo)
   * GET /reports/subscriptions
   */
  async getSubscriptionsReport(): Promise<SubscriptionReportItem[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${API_BASE}/reports/subscriptions`)
    );
    return Array.isArray(response) ? response : (response?.data || []);
  }

  /**
   * Obtener reporte de beneficios de comercios (horas gratis, sucursal, total a liquidar)
   * GET /reports/commerce-benefits
   */
  async getCommerceBenefitsReport(): Promise<CommerceBenefitReportItem[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${API_BASE}/reports/commerce-benefits`)
    );
    return Array.isArray(response) ? response : (response?.data || []);
  }

  /**
   * Obtener reporte de incidencias y flotas (evidencias, control descuentos, placas)
   * GET /reports/incidents
   */
  async getIncidentsReport(): Promise<IncidentFleetReportItem[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${API_BASE}/reports/incidents`)
    );
    return Array.isArray(response) ? response : (response?.data || []);
  }

  /**
   * Obtener reporte de flotillas
   * GET /reports/fleets
   */
  async getFleetsReport(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(`${API_BASE}/reports/fleets`)
    );
  }

  /**
   * Obtener reporte de cortes de caja
   * GET /reports/cash-closing
   */
  async getCashClosingReport(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(`${API_BASE}/reports/cash-closing`)
    );
  }

  /**
   * Exportar reporte como PDF usando html2canvas y jsPDF
   * Captura el contenido HTML visible y lo convierte a PDF
   */
  async exportToPDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento no encontrado para exportar');
    }

    try {
      // Capturar el elemento como imagen
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensiones para ajustar a la página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // Márgenes de 10mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Agregar la imagen al PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si la imagen es más alta que una página, agregar páginas adicionales
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte como imagen PNG usando html2canvas
   */
  async exportToPNG(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento no encontrado para exportar');
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error al generar PNG:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte como Excel usando XLSX
   * Convierte los datos de la API directamente a Excel
   */
  async exportToExcel(filename: string, reportType: string, data: any[]): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Crear hoja según el tipo de reporte
      switch (reportType) {
        case 'occupancy':
          this.exportOccupancyToExcel(workbook, data);
          break;
        case 'billing':
          this.exportBillingToExcel(workbook, data);
          break;
        case 'subscriptions':
          this.exportSubscriptionsToExcel(workbook, data);
          break;
        case 'commerce-benefits':
          this.exportCommerceBenefitsToExcel(workbook, data);
          break;
        case 'incidents':
          this.exportIncidentsToExcel(workbook, data);
          break;
        default:
          throw new Error('Tipo de reporte no soportado');
      }
      
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte de ocupación a Excel
   */
  private exportOccupancyToExcel(workbook: XLSX.WorkBook, data: OccupancyReportItem[]) {
    const worksheetData: any[][] = [
      ['Reporte de Ocupación'],
      [`Fecha de generación: ${new Date().toLocaleString('es-GT')}`],
      [],
      ['Sucursal', 'Tipo de Vehículo', 'Capacidad Total', 'Ocupación Actual', 'Pico Máximo', 'Promedio', 'Porcentaje de Ocupación']
    ];

    data.forEach(item => {
      worksheetData.push([
        item.branch_name || '-',
        item.vehicle_type === '2R' ? 'Motocicleta' : item.vehicle_type === '4R' ? 'Automóvil' : item.vehicle_type,
        item.total_capacity || 0,
        item.current_occupancy || 0,
        item.peak_occupancy || 0,
        item.average_occupancy || 0,
        `${(item.occupancy_percentage || 0).toFixed(2)}%`
      ]);
    });

    // Agregar resumen al final
    const totalCapacity = data.reduce((sum, item) => sum + (item.total_capacity || 0), 0);
    const totalOccupied = data.reduce((sum, item) => sum + (item.current_occupancy || 0), 0);
    const avgOccupancy = data.length > 0 ? data.reduce((sum, item) => sum + (item.average_occupancy || 0), 0) / data.length : 0;

    worksheetData.push([]);
    worksheetData.push(['RESUMEN']);
    worksheetData.push(['Capacidad Total', totalCapacity]);
    worksheetData.push(['Espacios Ocupados', totalOccupied]);
    worksheetData.push(['Espacios Disponibles', totalCapacity - totalOccupied]);
    worksheetData.push(['Ocupación Promedio', `${avgOccupancy.toFixed(2)}%`]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Aplicar estilos a las columnas
    worksheet['!cols'] = [
      { wch: 30 }, // Sucursal
      { wch: 20 }, // Tipo Vehículo
      { wch: 15 }, // Capacidad
      { wch: 18 }, // Ocupación Actual
      { wch: 15 }, // Pico Máximo
      { wch: 12 }, // Promedio
      { wch: 22 }  // Porcentaje
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ocupación');
  }

  /**
   * Exportar reporte de facturación a Excel
   */
  private exportBillingToExcel(workbook: XLSX.WorkBook, data: BillingReportItem[]) {
    const worksheetData: any[][] = [
      ['Reporte de Facturación'],
      [`Fecha de generación: ${new Date().toLocaleString('es-GT')}`],
      [],
      ['Sucursal', 'Método de Pago', 'Total Tickets', 'Valor Promedio', 'Total Ingresos']
    ];

    data.forEach(item => {
      worksheetData.push([
        item.branch_name || '-',
        item.payment_method || '-',
        item.total_tickets || 0,
        `Q${(item.average_ticket_value || 0).toFixed(2)}`,
        `Q${(item.total_revenue || 0).toFixed(2)}`
      ]);
    });

    // Agregar resumen al final
    const totalTickets = data.reduce((sum, item) => sum + (item.total_tickets || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
    const avgTicketValue = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    worksheetData.push([]);
    worksheetData.push(['RESUMEN']);
    worksheetData.push(['Total Tickets', totalTickets]);
    worksheetData.push(['Ingresos Totales', `Q${totalRevenue.toFixed(2)}`]);
    worksheetData.push(['Valor Promedio por Ticket', `Q${avgTicketValue.toFixed(2)}`]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 30 }, // Sucursal
      { wch: 20 }, // Método de Pago
      { wch: 15 }, // Total Tickets
      { wch: 18 }, // Valor Promedio
      { wch: 18 }  // Total Ingresos
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturación');
  }

  /**
   * Exportar reporte de suscripciones a Excel
   */
  private exportSubscriptionsToExcel(workbook: XLSX.WorkBook, data: SubscriptionReportItem[]) {
    const item = data[0] || {};
    
    const worksheetData: any[][] = [
      ['Reporte de Suscripciones'],
      [`Fecha de generación: ${new Date().toLocaleString('es-GT')}`],
      [],
      ['Métrica', 'Valor'],
      ['Suscripciones Activas', item.active_subscriptions || 0],
      ['Suscripciones Expiradas', item.expired_subscriptions || 0],
      ['Por Expirar Pronto', item.expiring_soon || 0],
      ['Total de Suscripciones', item.total_subscriptions || 0]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 30 }, // Métrica
      { wch: 20 }  // Valor
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suscripciones');
  }

  /**
   * Exportar reporte de beneficios comerciales a Excel
   */
  private exportCommerceBenefitsToExcel(workbook: XLSX.WorkBook, data: CommerceBenefitReportItem[]) {
    const item = data[0] || {};
    
    const worksheetData: any[][] = [
      ['Reporte de Beneficios - Ingresos por Suscripciones'],
      [`Fecha de generación: ${new Date().toLocaleString('es-GT')}`],
      [],
      ['Métrica', 'Valor'],
      ['Suscripciones Activas', item.active_subscriptions || 0],
      ['Total de Suscripciones Vendidas', item.total_subscriptions_sold || 0],
      ['Ingresos Totales por Suscripciones', `Q${(item.total_revenue_from_subscriptions || 0).toFixed(2)}`]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 35 }, // Métrica
      { wch: 25 }  // Valor
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficios');
  }

  /**
   * Exportar reporte de incidencias a Excel
   */
  private exportIncidentsToExcel(workbook: XLSX.WorkBook, data: IncidentFleetReportItem[]) {
    const item = data[0] || {};
    
    const worksheetData: any[][] = [
      ['Reporte de Incidencias y Flota'],
      [`Fecha de generación: ${new Date().toLocaleString('es-GT')}`],
      [],
      ['Métrica', 'Valor'],
      ['Total de Incidencias', item.total_incidents || 0],
      ['Incidencias Pendientes', item.pending_incidents || 0],
      ['Incidencias Resueltas', item.resolved_incidents || 0]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 30 }, // Métrica
      { wch: 20 }  // Valor
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidencias');
  }

  /**
   * Exportar reporte a PDF, Excel o PNG (método original del backend - ya no se usa)
   * POST /reports/export
   * Retorna el archivo como Blob para descarga
   */
  async exportReport(request: ExportReportRequest): Promise<Blob> {
    return await firstValueFrom(
      this.http.post(`${API_BASE}/reports/export`, request, {
        responseType: 'blob'
      })
    );
  }

  /**
   * Descargar archivo generado (método legacy)
   */
  downloadFile(blob: Blob, filename: string, format: 'PDF' | 'EXCEL' | 'PNG') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Determinar extensión según formato
    let extension = '.pdf';
    if (format === 'EXCEL') extension = '.xlsx';
    if (format === 'PNG') extension = '.png';
    
    link.download = `${filename}${extension}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
