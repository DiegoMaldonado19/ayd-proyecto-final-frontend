import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TemporalPermitService, CreateTemporalPermitRequest } from './services/temporal-permit.service';
import { VehicleTypeService, VehicleType } from './services/vehicle-type.service';

@Component({
  standalone: true,
  selector: 'app-temporal-permit-create',
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
          Crear Permiso Temporal
        </h1>
        <p class="text-gray-600 mt-2">
          Crea un nuevo permiso temporal para una suscripción
        </p>
      </div>

      <!-- Loading Vehicle Types -->
      <div *ngIf="loadingVehicleTypes()" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando datos...</p>
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
      <div *ngIf="!loadingVehicleTypes() && !error()" class="max-w-3xl">
        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h3 class="text-blue-900 font-semibold mb-1">Información Importante</h3>
              <p class="text-blue-800 text-sm">
                Asegúrate de verificar que el ID de suscripción exista antes de crear el permiso temporal.
              </p>
            </div>
          </div>
        </div>

        <!-- Create Form -->
        <form (ngSubmit)="onSubmit()" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <!-- ID de Suscripción -->
          <div>
            <label for="subscriptionId" class="block text-sm font-medium text-gray-700 mb-2">
              ID de Suscripción *
            </label>
            <input
              type="number"
              id="subscriptionId"
              [(ngModel)]="formData.subscription_id"
              name="subscriptionId"
              min="1"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">ID numérico de la suscripción a la que pertenece este permiso</p>
          </div>

          <!-- Placa Temporal -->
          <div>
            <label for="temporalPlate" class="block text-sm font-medium text-gray-700 mb-2">
              Placa Temporal *
            </label>
            <input
              type="text"
              id="temporalPlate"
              [(ngModel)]="formData.temporal_plate"
              name="temporalPlate"
              placeholder="Ej: TMP-123"
              required
              maxlength="20"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono">
            <p class="text-xs text-gray-500 mt-1">Placa temporal que se usará durante el período del permiso</p>
          </div>

          <!-- Tipo de Vehículo -->
          <div>
            <label for="vehicleType" class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vehículo *
            </label>
            <select
              id="vehicleType"
              [(ngModel)]="formData.vehicle_type_id"
              name="vehicleType"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
              <option [value]="0" disabled>Selecciona un tipo de vehículo</option>
              <option *ngFor="let type of vehicleTypes()" [value]="type.id">
                {{ type.name }} ({{ type.code }})
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Tipo de vehículo para este permiso temporal</p>
          </div>

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
            <p class="text-xs text-gray-500 mt-1">Cantidad máxima de veces que se puede usar este permiso</p>
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
              placeholder="Ej: 1, 2, 3"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <p class="text-xs text-gray-500 mt-1">
              Ingresa los IDs de las sucursales separados por comas
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
              {{ saving() ? 'Creando...' : 'Crear Permiso' }}
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
export class TemporalPermitCreatePage implements OnInit {
  private temporalPermitService = inject(TemporalPermitService);
  private vehicleTypeService = inject(VehicleTypeService);
  private router = inject(Router);

  loadingVehicleTypes = signal<boolean>(false);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  validationError = signal<string | null>(null);
  validationErrors = signal<{ [key: string]: string } | null>(null);
  successMessage = signal<string | null>(null);

  vehicleTypes = signal<VehicleType[]>([]);

  // Form data
  formData = {
    subscription_id: 0,
    temporal_plate: '',
    start_date: '',
    end_date: '',
    max_uses: 1,
    vehicle_type_id: 0
  };

  branchesInput = '';

  ngOnInit(): void {
    this.loadVehicleTypes();
  }

  async loadVehicleTypes(): Promise<void> {
    this.loadingVehicleTypes.set(true);
    this.error.set(null);

    try {
      const types = await this.vehicleTypeService.getVehicleTypes().toPromise();
      this.vehicleTypes.set(types || []);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar los tipos de vehículos');
      console.error('Error loading vehicle types:', err);
    } finally {
      this.loadingVehicleTypes.set(false);
    }
  }

  isFormValid(): boolean {
    if (!this.formData.subscription_id || this.formData.subscription_id <= 0) {
      return false;
    }
    
    if (!this.formData.temporal_plate.trim()) {
      return false;
    }

    if (!this.formData.vehicle_type_id || this.formData.vehicle_type_id === 0) {
      return false;
    }

    if (!this.formData.start_date || !this.formData.end_date || !this.formData.max_uses) {
      return false;
    }

    if (!this.branchesInput.trim()) {
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

    // Parse branches
    const branches = this.parseBranches(this.branchesInput);
    if (branches.length === 0) {
      this.validationError.set('Debes especificar al menos una sucursal válida');
      return;
    }

    this.saving.set(true);

    try {
      const createData: CreateTemporalPermitRequest = {
        subscription_id: this.formData.subscription_id,
        temporal_plate: this.formData.temporal_plate.trim().toUpperCase(),
        start_date: new Date(this.formData.start_date).toISOString(),
        end_date: new Date(this.formData.end_date).toISOString(),
        max_uses: this.formData.max_uses,
        allowed_branches: branches,
        vehicle_type_id: this.formData.vehicle_type_id
      };

      const newPermit = await this.temporalPermitService
        .createTemporalPermit(createData)
        .toPromise();

      this.successMessage.set('Permiso temporal creado exitosamente');
      
      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        this.successMessage.set(null);
        if (newPermit?.id) {
          this.router.navigate(['/backoffice/temporal-permits', newPermit.id]);
        } else {
          this.router.navigate(['/backoffice/temporal-permits']);
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error creating temporal permit:', err);
      
      // Check if backend returned validation errors
      if (err?.error?.validation_errors) {
        this.validationErrors.set(err.error.validation_errors);
        this.validationError.set(err?.error?.message || 'Error de validación');
      } else {
        this.validationError.set(err?.error?.message || 'Error al crear el permiso temporal');
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

  goBack(): void {
    this.router.navigate(['/backoffice/temporal-permits']);
  }
}
