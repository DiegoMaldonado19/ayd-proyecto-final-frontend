import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemporalPermitService, UpdateTemporalPermitRequest } from './services/temporal-permit.service';
import { TemporalPermit } from './models/temporal-permit.interface';

@Component({
  standalone: true,
  selector: 'app-temporal-permit-edit',
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
          Volver al detalle
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          Editar Permiso Temporal
        </h1>
        <p class="text-gray-600 mt-2">
          Modifica la configuración del permiso temporal
        </p>
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

      <!-- Form -->
      <div *ngIf="permit() && !loading()" class="max-w-3xl">
        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h3 class="text-blue-900 font-semibold mb-1">Información del Permiso</h3>
              <p class="text-blue-800 text-sm">
                <strong>ID:</strong> #{{ permit()?.id }} | 
                <strong>Placa:</strong> {{ permit()?.temporal_plate }} | 
                <strong>Estado:</strong> {{ permit()?.status }}
              </p>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <form (ngSubmit)="onSubmit()" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <!-- Fecha de Inicio -->
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              [(ngModel)]="formData.start_date"
              name="startDate"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">Fecha y hora de inicio de vigencia del permiso</p>
          </div>

          <!-- Fecha de Fin -->
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              [(ngModel)]="formData.end_date"
              name="endDate"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">Fecha y hora de vencimiento del permiso</p>
          </div>

          <!-- Usos Máximos -->
          <div>
            <label for="maxUses" class="block text-sm font-medium text-gray-700 mb-2">
              Número Máximo de Usos *
            </label>
            <input
              type="number"
              id="maxUses"
              [(ngModel)]="formData.max_uses"
              name="maxUses"
              min="1"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">
              Usos actuales: <strong>{{ permit()?.current_uses }}</strong>. 
              El nuevo máximo debe ser mayor o igual a los usos actuales.
            </p>
          </div>

          <!-- Sucursales Permitidas -->
          <div>
            <label for="branches" class="block text-sm font-medium text-gray-700 mb-2">
              IDs de Sucursales Permitidas *
            </label>
            <input
              type="text"
              id="branches"
              [(ngModel)]="branchesInput"
              name="branches"
              placeholder="Ej: 1, 2, 3, 4"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">
              Ingresa los IDs de las sucursales separados por comas. 
              Actualmente: <strong>{{ permit()?.allowed_branches?.join(', ') || 'Ninguna' }}</strong>
            </p>
          </div>

          <!-- Validation Message -->
          <div *ngIf="validationError()" class="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <div class="flex items-start">
              <svg class="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <p class="text-red-500 text-sm font-medium">{{ validationError() }}</p>
                <ul *ngIf="validationErrors()" class="mt-2 space-y-1">
                  <li *ngFor="let error of getValidationErrorsList()" class="text-red-400 text-xs">
                    • {{ error }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              (click)="goBack()"
              [disabled]="saving()"
              class="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="saving() || !isFormValid()"
              class="flex-1 px-4 py-2.5 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 transition disabled:opacity-50 disabled:pointer-events-none font-medium shadow-sm">
              {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage()" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage() }}
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
export class TemporalPermitEditPage implements OnInit {
  private temporalPermitService = inject(TemporalPermitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  permit = signal<TemporalPermit | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  validationError = signal<string | null>(null);
  validationErrors = signal<{ [key: string]: string } | null>(null);
  successMessage = signal<string | null>(null);

  // Form data
  formData = {
    start_date: '',
    end_date: '',
    max_uses: 0
  };

  branchesInput = '';

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
      
      if (permit) {
        // Populate form with current data
        this.formData.start_date = this.formatDateTimeLocal(permit.start_date);
        this.formData.end_date = this.formatDateTimeLocal(permit.end_date);
        this.formData.max_uses = permit.max_uses;
        this.branchesInput = permit.allowed_branches?.join(', ') || '';
      }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar el permiso temporal');
      console.error('Error loading temporal permit:', err);
    } finally {
      this.loading.set(false);
    }
  }

  isFormValid(): boolean {
    if (!this.formData.start_date || !this.formData.end_date || !this.formData.max_uses || !this.branchesInput.trim()) {
      return false;
    }
    
    const currentUses = this.permit()?.current_uses || 0;
    if (this.formData.max_uses < currentUses) {
      return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    this.validationError.set(null);
    this.validationErrors.set(null);

    // Validate dates
    const startDate = new Date(this.formData.start_date);
    const endDate = new Date(this.formData.end_date);

    if (endDate <= startDate) {
      this.validationError.set('La fecha de vencimiento debe ser posterior a la fecha de inicio');
      return;
    }

    // Validate max uses
    const currentUses = this.permit()?.current_uses || 0;
    if (this.formData.max_uses < currentUses) {
      this.validationError.set(`El número máximo de usos no puede ser menor a los usos actuales (${currentUses})`);
      return;
    }

    // Parse branches
    const branches = this.parseBranches(this.branchesInput);
    if (branches.length === 0) {
      this.validationError.set('Debes especificar al menos una sucursal válida');
      return;
    }

    const permitId = this.permit()?.id;
    if (!permitId) return;

    this.saving.set(true);

    try {
      const updateData: UpdateTemporalPermitRequest = {
        start_date: new Date(this.formData.start_date).toISOString(),
        end_date: new Date(this.formData.end_date).toISOString(),
        max_uses: this.formData.max_uses,
        allowed_branches: branches
      };

      const updatedPermit = await this.temporalPermitService
        .updateTemporalPermit(permitId, updateData)
        .toPromise();

      this.successMessage.set('Permiso actualizado exitosamente');
      
      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        this.successMessage.set(null);
        this.router.navigate(['/backoffice/temporal-permits', permitId]);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating temporal permit:', err);
      
      // Check if backend returned validation errors
      if (err?.error?.validation_errors) {
        this.validationErrors.set(err.error.validation_errors);
        this.validationError.set(err?.error?.message || 'Error de validación');
      } else {
        this.validationError.set(err?.error?.message || 'Error al actualizar el permiso temporal');
      }
    } finally {
      this.saving.set(false);
    }
  }

  getValidationErrorsList(): string[] {
    const errors = this.validationErrors();
    if (!errors) return [];
    return Object.values(errors);
  }

  parseBranches(input: string): number[] {
    return input
      .split(',')
      .map(b => b.trim())
      .filter(b => b !== '')
      .map(b => parseInt(b, 10))
      .filter(b => !isNaN(b) && b >= 0);
  }

  formatDateTimeLocal(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format: yyyy-MM-ddThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  goBack(): void {
    const permitId = this.permit()?.id;
    if (permitId) {
      this.router.navigate(['/backoffice/temporal-permits', permitId]);
    } else {
      this.router.navigate(['/backoffice/temporal-permits']);
    }
  }
}
