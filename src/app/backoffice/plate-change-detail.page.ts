import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlateChangeService } from './services/plate-change.service';
import { PlateChange } from './models/plate-change.interface';

@Component({
  standalone: true,
  selector: 'app-plate-change-detail',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header with back button -->
      <div class="mb-8">
        <button
          (click)="goBack()"
          class="inline-flex items-center text-gray-700 hover:text-yellow-600 transition mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a solicitudes
        </button>

        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Solicitud #{{ plateChange()?.id || '...' }}
            </h1>
            <p class="text-gray-600" *ngIf="plateChange()">
              Creada el {{ formatDate(plateChange()!.created_at) }}
            </p>
          </div>

          <!-- Status badge -->
          <span *ngIf="plateChange()" [ngClass]="{
            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': plateChange()!.status_code === 'PENDING',
            'bg-green-500/20 text-green-400 border-green-500/30': plateChange()!.status_code === 'APPROVED',
            'bg-red-500/20 text-red-400 border-red-500/30': plateChange()!.status_code === 'REJECTED'
          }" class="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border">
            {{ plateChange()!.status_name }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando detalles...</p>
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
      <div *ngIf="!loading() && !error() && plateChange()" class="space-y-6">
        <!-- Usuario -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">Información del Usuario</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Nombre:</span>
              <span class="font-semibold text-gray-900">{{ plateChange()!.user_name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">ID Usuario:</span>
              <span class="font-mono text-yellow-600">{{ plateChange()!.user_id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">ID Suscripción:</span>
              <span class="font-mono text-yellow-600">{{ plateChange()!.subscription_id }}</span>
            </div>
          </div>
        </div>

        <!-- Placas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
            <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">Placa Anterior</h2>
            <div class="text-center py-4">
              <span class="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-4 py-2 text-lg font-mono font-semibold">
                {{ plateChange()!.old_license_plate }}
              </span>
            </div>
          </div>
          <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
            <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">Placa Nueva</h2>
            <div class="text-center py-4">
              <span class="inline-flex items-center rounded-full bg-yellow-400 text-gray-900 px-4 py-2 text-lg font-mono font-semibold">
                {{ plateChange()!.new_license_plate }}
              </span>
            </div>
          </div>
        </div>

        <!-- Razón del cambio -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">Razón del Cambio</h2>
          <div class="space-y-3">
            <div>
              <span class="text-gray-600 text-sm">Categoría:</span>
              <div class="mt-1 font-semibold text-gray-900 text-lg">{{ plateChange()!.reason_name }}</div>
            </div>
            <div *ngIf="plateChange()!.notes">
              <span class="text-gray-600 text-sm">Notas adicionales:</span>
              <div class="mt-1 text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200">
                {{ plateChange()!.notes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Evidencias -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">
            Evidencias ({{ plateChange()!.evidence_count }})
          </h2>
          
          <div *ngIf="plateChange()!.evidences && plateChange()!.evidences.length > 0" class="space-y-3">
            <div *ngFor="let evidence of plateChange()!.evidences" 
                 class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-yellow-400 transition">
              <!-- Icono según tipo de archivo -->
              <div class="flex-shrink-0">
                <div *ngIf="isImage(evidence.file_name)" class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div *ngIf="!isImage(evidence.file_name)" class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Información del archivo -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">{{ evidence.file_name }}</h3>
                    <p class="text-xs text-gray-600 mt-1">{{ evidence.document_type_name }}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-2 py-0.5 text-xs font-medium">
                    {{ formatFileSize(evidence.file_size) }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    {{ evidence.uploaded_by }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    {{ formatDate(evidence.uploaded_at) }}
                  </span>
                </div>
              </div>

              <!-- Botón de descarga/vista -->
              <div class="flex-shrink-0">
                <a [href]="evidence.file_url" 
                   target="_blank"
                   class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div *ngIf="!plateChange()!.evidences || plateChange()!.evidences.length === 0" class="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              <div class="text-gray-900 font-semibold text-lg">Sin evidencias</div>
              <div class="text-xs text-gray-600 mt-1">No se han adjuntado archivos a esta solicitud</div>
            </div>
          </div>
        </div>

        <!-- Historial de revisión -->
        <div class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <h2 class="text-gray-600 text-xs font-semibold uppercase mb-4">Historial de Revisión</h2>
          <div *ngIf="plateChange()!.reviewed_by" class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Revisado por:</span>
              <span class="text-gray-900 font-medium">{{ plateChange()!.reviewer_name }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Fecha de revisión:</span>
              <span class="text-gray-900">{{ formatDate(plateChange()!.reviewed_at!) }}</span>
            </div>
            <div *ngIf="plateChange()!.review_notes" class="py-2">
              <span class="text-gray-600 text-sm">Comentarios:</span>
              <div class="mt-2 text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200">
                {{ plateChange()!.review_notes }}
              </div>
            </div>
          </div>
          <div *ngIf="!plateChange()!.reviewed_by" class="text-center py-6 text-gray-600">
            Esta solicitud aún no ha sido revisada
          </div>
        </div>

        <!-- Acciones (solo si está pendiente) -->
        <div *ngIf="plateChange()!.status_code === 'PENDING'" class="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
          <button
            (click)="approvePlateChange()"
            [disabled]="processing()"
            class="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 text-white px-6 py-3 shadow-md transition duration-200 hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none font-semibold">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Aprobar Solicitud
          </button>
          <button
            (click)="rejectPlateChange()"
            [disabled]="processing()"
            class="flex-1 inline-flex items-center justify-center rounded-md bg-red-600 text-white px-6 py-3 shadow-md transition duration-200 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none font-semibold">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rechazar Solicitud
          </button>
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
export class PlateChangeDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private plateChangeService = inject(PlateChangeService);

  plateChange = signal<PlateChange | null>(null);
  loading = signal<boolean>(false);
  processing = signal<boolean>(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlateChange(+id);
    } else {
      this.error.set('ID de solicitud no válido');
    }
  }

  async loadPlateChange(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.plateChangeService.getPlateChangeById(id).toPromise();
      this.plateChange.set(data || null);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar los detalles de la solicitud');
      console.error('Error loading plate change:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async approvePlateChange(): Promise<void> {
    const additionalNotes = prompt('Notas adicionales (opcional):');
    
    if (additionalNotes === null) {
      // Usuario canceló
      return;
    }

    if (!confirm('¿Está seguro que desea aprobar esta solicitud?')) {
      return;
    }

    this.processing.set(true);
    try {
      const reviewNotes = additionalNotes.trim() !== '' 
        ? additionalNotes.trim()
        : 'Aprobado desde el panel de backoffice. Documentación verificada y aprobada.';
      
      const updated = await this.plateChangeService.approvePlateChange(this.plateChange()!.id, reviewNotes).toPromise();
      this.plateChange.set(updated || null);
      this.showSuccess('Solicitud aprobada exitosamente');
    } catch (err: any) {
      alert(err?.error?.message || 'Error al aprobar la solicitud');
      console.error('Error approving plate change:', err);
    } finally {
      this.processing.set(false);
    }
  }

  async rejectPlateChange(): Promise<void> {
    const reason = prompt('Ingrese el motivo del rechazo:');
    if (!reason || reason.trim() === '') {
      return;
    }

    this.processing.set(true);
    try {
      const updated = await this.plateChangeService.rejectPlateChange(this.plateChange()!.id, reason).toPromise();
      this.plateChange.set(updated || null);
      this.showSuccess('Solicitud rechazada');
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  isImage(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  goBack(): void {
    this.router.navigate(['/backoffice/plate-changes']);
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 3000);
  }
}
