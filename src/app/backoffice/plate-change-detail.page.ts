import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlateChangeService } from './services/plate-change.service';
import { PlateChange } from './models/plate-change.interface';

interface DocumentType {
  id: number;
  code: string;
  name: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-plate-change-detail',
  imports: [CommonModule, FormsModule],
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
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-gray-600 text-xs font-semibold uppercase">
              Evidencias ({{ plateChange()!.evidence_count }})
            </h2>
            <button
              *ngIf="plateChange()!.status_code === 'PENDING'"
              (click)="toggleUploadForm()"
              class="inline-flex items-center rounded-md bg-yellow-400 text-gray-900 px-3 py-1.5 text-sm font-medium hover:bg-yellow-500 transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Evidencia
            </button>
          </div>

          <!-- Formulario de subida -->
          <div *ngIf="showUploadForm()" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Subir Nueva Evidencia</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                <select 
                  [(ngModel)]="selectedDocumentType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <option [value]="null">Seleccionar tipo...</option>
                  <option *ngFor="let docType of documentTypes" [value]="docType.id">
                    {{ docType.name }} - {{ docType.description }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input 
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*,.pdf"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm">
                <p class="mt-1 text-xs text-gray-500">Formatos aceptados: imágenes y PDF. Tamaño máximo: 5MB</p>
              </div>
              <div *ngIf="selectedFile()" class="p-3 bg-white border border-gray-200 rounded-md">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-gray-900 font-medium">{{ selectedFile()!.name }}</span>
                    <span class="text-xs text-gray-500">({{ formatFileSize(selectedFile()!.size) }})</span>
                  </div>
                  <button
                    (click)="clearFile()"
                    class="text-red-600 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="uploadEvidence()"
                  [disabled]="!canUpload() || uploading()"
                  class="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none transition">
                  <svg *ngIf="!uploading()" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <svg *ngIf="uploading()" class="animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ uploading() ? 'Subiendo...' : 'Subir Archivo' }}
                </button>
                <button
                  (click)="toggleUploadForm()"
                  [disabled]="uploading()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          
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
            (click)="openApprovalForm()"
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

      <!-- Modal de Aprobación -->
      <div *ngIf="showApprovalForm()" class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Aprobar Cambio de Placa</h2>
              <button
                (click)="closeApprovalForm()"
                [disabled]="processing()"
                class="text-gray-400 hover:text-gray-600 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <!-- Notas de revisión -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Notas de Revisión
                <span class="text-gray-500 font-normal">(opcional)</span>
              </label>
              <textarea
                [(ngModel)]="approvalForm().review_notes"
                rows="3"
                maxlength="500"
                placeholder="Ej: Documentación verificada y aprobada"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"></textarea>
              <p class="mt-1 text-xs text-gray-500">{{ approvalForm().review_notes.length }}/500 caracteres</p>
            </div>

            <!-- Cargo Administrativo -->
            <div class="border-t border-gray-200 pt-6">
              <div class="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="applyCharge"
                  [(ngModel)]="approvalForm().apply_administrative_charge"
                  class="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500">
                <label for="applyCharge" class="ml-3">
                  <span class="block text-sm font-medium text-gray-900">Aplicar cargo administrativo manualmente</span>
                  <span class="block text-xs text-gray-500 mt-1">
                    Activa esta opción para establecer un monto personalizado de cargo administrativo
                  </span>
                </label>
              </div>

              <!-- Campos de cargo (solo si está activado) -->
              <div *ngIf="approvalForm().apply_administrative_charge" class="ml-7 space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Monto del Cargo <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">Q</span>
                    <input
                      type="number"
                      [(ngModel)]="approvalForm().administrative_charge_amount"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Razón del Cargo <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    [(ngModel)]="approvalForm().administrative_charge_reason"
                    rows="2"
                    maxlength="500"
                    placeholder="Ej: Procesamiento urgente, cambio fuera de horario, etc."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"></textarea>
                  <p class="mt-1 text-xs text-gray-500">{{ approvalForm().administrative_charge_reason.length }}/500 caracteres</p>
                </div>
              </div>
            </div>

            <!-- Resumen -->
            <div class="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 class="text-sm font-semibold text-green-900 mb-2">Resumen de Aprobación</h3>
              <div class="space-y-1 text-sm text-green-800">
                <div class="flex justify-between">
                  <span>Solicitud:</span>
                  <span class="font-mono">#{{ plateChange()!.id }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Cambio:</span>
                  <span class="font-mono">{{ plateChange()!.old_license_plate }} → {{ plateChange()!.new_license_plate }}</span>
                </div>
                <div *ngIf="approvalForm().apply_administrative_charge" class="flex justify-between border-t border-green-300 pt-2 mt-2">
                  <span class="font-semibold">Cargo administrativo:</span>
                  <span class="font-semibold">Q {{ approvalForm().administrative_charge_amount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              (click)="closeApprovalForm()"
              [disabled]="processing()"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 transition">
              Cancelar
            </button>
            <button
              (click)="confirmApproval()"
              [disabled]="processing() || !isApprovalFormValid()"
              class="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none transition">
              <svg *ngIf="!processing()" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg *ngIf="processing()" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ processing() ? 'Procesando...' : 'Aprobar Cambio' }}
            </button>
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
export class PlateChangeDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private plateChangeService = inject(PlateChangeService);

  plateChange = signal<PlateChange | null>(null);
  loading = signal<boolean>(false);
  processing = signal<boolean>(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showUploadForm = signal<boolean>(false);
  uploading = signal<boolean>(false);
  selectedFile = signal<File | null>(null);
  selectedDocumentType = signal<number | null>(null);
  
  // Formulario de aprobación
  showApprovalForm = signal<boolean>(false);
  approvalForm = signal({
    review_notes: '',
    apply_administrative_charge: false,
    administrative_charge_amount: 0,
    administrative_charge_reason: ''
  });

  // Tipos de documentos según la base de datos
  documentTypes: DocumentType[] = [
    { id: 1, code: 'IDENTIFICATION', name: 'Identificación Personal', description: 'DPI, Pasaporte, Licencia' },
    { id: 2, code: 'VEHICLE_CARD', name: 'Tarjeta de Circulación', description: 'Documento del vehículo' },
    { id: 3, code: 'POLICE_REPORT', name: 'Denuncia Policial', description: 'Reporte oficial de robo' },
    { id: 4, code: 'TRANSFER_DOCUMENT', name: 'Documento de Traspaso', description: 'Compra-venta de vehículo' },
    { id: 5, code: 'INSURANCE_REPORT', name: 'Reporte de Seguro', description: 'Documento de siniestro' },
    { id: 6, code: 'VEHICLE_PHOTO', name: 'Foto de Vehículo', description: 'Fotografía de placa o vehículo' },
    { id: 7, code: 'OTHER', name: 'Otro Documento', description: 'Documentación adicional' }
  ];

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

  openApprovalForm(): void {
    this.approvalForm.set({
      review_notes: '',
      apply_administrative_charge: false,
      administrative_charge_amount: 0,
      administrative_charge_reason: ''
    });
    this.showApprovalForm.set(true);
  }

  closeApprovalForm(): void {
    if (!this.processing()) {
      this.showApprovalForm.set(false);
    }
  }

  isApprovalFormValid(): boolean {
    const form = this.approvalForm();
    if (!form.apply_administrative_charge) {
      return true; // Si no se aplica cargo, es válido
    }
    // Si se aplica cargo, validar campos requeridos
    return form.administrative_charge_amount > 0 && 
           form.administrative_charge_reason.trim() !== '';
  }

  async confirmApproval(): Promise<void> {
    if (!this.isApprovalFormValid()) {
      return;
    }

    this.processing.set(true);
    try {
      const form = this.approvalForm();
      const request: any = {
        review_notes: form.review_notes.trim() || undefined,
        apply_administrative_charge: form.apply_administrative_charge
      };

      // Solo incluir campos de cargo si está activado
      if (form.apply_administrative_charge) {
        request.administrative_charge_amount = form.administrative_charge_amount;
        request.administrative_charge_reason = form.administrative_charge_reason.trim();
      }

      const updated = await this.plateChangeService.approvePlateChange(
        this.plateChange()!.id,
        request
      ).toPromise();

      this.plateChange.set(updated || null);
      this.showApprovalForm.set(false);
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

  toggleUploadForm(): void {
    this.showUploadForm.set(!this.showUploadForm());
    if (!this.showUploadForm()) {
      this.clearFile();
      this.selectedDocumentType.set(null);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Tamaño máximo: 5MB');
        input.value = '';
        return;
      }
      
      this.selectedFile.set(file);
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }

  canUpload(): boolean {
    return this.selectedFile() !== null && this.selectedDocumentType() !== null;
  }

  async uploadEvidence(): Promise<void> {
    if (!this.canUpload()) return;

    this.uploading.set(true);
    try {
      await this.plateChangeService.addEvidence(
        this.plateChange()!.id,
        this.selectedFile()!,
        this.selectedDocumentType()!
      ).toPromise();

      this.showSuccess('Evidencia agregada exitosamente');
      this.clearFile();
      this.selectedDocumentType.set(null);
      this.showUploadForm.set(false);
      
      // Recargar detalles para mostrar la nueva evidencia
      await this.loadPlateChange(this.plateChange()!.id);
    } catch (err: any) {
      alert(err?.error?.message || 'Error al subir la evidencia');
      console.error('Error uploading evidence:', err);
    } finally {
      this.uploading.set(false);
    }
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 3000);
  }
}
