import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  FleetService,
  FleetResponse,
  CreateFleetRequest,
  UpdateFleetRequest,
  FleetVehicleResponse,
  AddVehicleToFleetRequest,
  FleetConsumptionResponse,
  UpdateFleetDiscountsRequest,
  FleetDiscountsResponse
} from './services/fleet.service';
import { NotificationService } from '../shared/services/notification.service';

type ModalType = 'fleet' | 'vehicle' | 'discount' | 'consumption' | 'delete-fleet' | 'delete-vehicle' | null;

@Component({
  selector: 'app-fleets-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fleets-management.component.html'
})
export class FleetsManagementComponent implements OnInit {
  private fleetService = inject(FleetService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  // State signals
  fleets = signal<FleetResponse[]>([]);
  vehicles = signal<FleetVehicleResponse[]>([]);
  consumption = signal<FleetConsumptionResponse | null>(null);
  currentDiscount = signal<FleetDiscountsResponse | null>(null);
  
  loading = signal(false);
  loadingVehicles = signal(false);
  loadingConsumption = signal(false);
  submitting = signal(false);
  
  activeModal = signal<ModalType>(null);
  showAddVehicleForm = signal(false);
  
  editingFleet = signal<FleetResponse | null>(null);
  selectedFleet = signal<FleetResponse | null>(null);
  fleetToDelete = signal<FleetResponse | null>(null);
  vehicleToDelete = signal<FleetVehicleResponse | null>(null);

  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);

  // Filters
  filterActive?: boolean;

  // Computed
  vehiclesCount = computed(() => this.vehicles().filter(v => v.is_active).length);

  // Forms
  fleetForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    tax_id: ['', [Validators.required, Validators.maxLength(50)]],
    contact_name: ['', Validators.maxLength(200)],
    corporate_email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.pattern(/^[0-9]{8,15}$/)]],
    corporate_discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
    plate_limit: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
    billing_period: ['MONTHLY', Validators.required],
    is_active: [true]
  });

  vehicleForm = this.fb.group({
    license_plate: ['', [Validators.required, Validators.maxLength(20), 
      Validators.pattern(/^[A-Z]{1,3}-?[0-9]{3,4}$|^[A-Z]{1,3}[0-9]{3,4}$|^P-[0-9]{5,6}$/)]],
    plan_id: ['', Validators.required],
    vehicle_type_id: ['', Validators.required],
    assigned_employee: ['', Validators.maxLength(200)]
  });

  discountForm = this.fb.group({
    corporate_discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(10)]]
  });

  ngOnInit() {
    this.loadFleets();
  }

  loadFleets() {
    this.loading.set(true);
    this.fleetService.listFleets(this.currentPage(), this.pageSize(), this.filterActive).subscribe({
      next: (response) => {
        this.fleets.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading fleets:', error);
        this.notificationService.error('Error al cargar las flotillas');
        this.loading.set(false);
      }
    });
  }

  openCreateFleetModal() {
    this.editingFleet.set(null);
    this.fleetForm.reset({
      corporate_discount_percentage: 0,
      plate_limit: 10,
      billing_period: 'MONTHLY',
      is_active: true
    });
    this.fleetForm.get('tax_id')?.enable();
    this.activeModal.set('fleet');
  }

  openEditFleetModal(fleet: FleetResponse) {
    this.editingFleet.set(fleet);
    this.fleetForm.patchValue({
      name: fleet.name,
      tax_id: fleet.tax_id,
      contact_name: fleet.contact_name,
      corporate_email: fleet.corporate_email,
      phone: fleet.phone,
      corporate_discount_percentage: fleet.corporate_discount_percentage,
      plate_limit: fleet.plate_limit,
      billing_period: fleet.billing_period,
      is_active: fleet.is_active
    });
    this.fleetForm.get('tax_id')?.disable();
    this.activeModal.set('fleet');
  }

  submitFleetForm() {
    if (this.fleetForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.fleetForm.getRawValue();

    if (this.editingFleet()) {
      const updateRequest: UpdateFleetRequest = {
        name: formValue.name || undefined,
        contact_name: formValue.contact_name || undefined,
        corporate_email: formValue.corporate_email || undefined,
        phone: formValue.phone || undefined,
        corporate_discount_percentage: formValue.corporate_discount_percentage || undefined,
        plate_limit: formValue.plate_limit || undefined,
        billing_period: formValue.billing_period as any,
        is_active: formValue.is_active || undefined
      };

      this.fleetService.updateFleet(this.editingFleet()!.id, updateRequest).subscribe({
        next: () => {
          this.notificationService.success('Flotilla actualizada exitosamente');
          this.closeModal();
          this.loadFleets();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error updating fleet:', error);
          this.notificationService.error(error.error?.message || 'Error al actualizar la flotilla');
          this.submitting.set(false);
        }
      });
    } else {
      const createRequest: CreateFleetRequest = {
        name: formValue.name!,
        tax_id: formValue.tax_id!,
        contact_name: formValue.contact_name || undefined,
        corporate_email: formValue.corporate_email!,
        phone: formValue.phone || undefined,
        corporate_discount_percentage: formValue.corporate_discount_percentage!,
        plate_limit: formValue.plate_limit!,
        billing_period: formValue.billing_period as any
      };

      this.fleetService.createFleet(createRequest).subscribe({
        next: () => {
          this.notificationService.success('Flotilla creada exitosamente');
          this.closeModal();
          this.loadFleets();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error creating fleet:', error);
          this.notificationService.error(error.error?.message || 'Error al crear la flotilla');
          this.submitting.set(false);
        }
      });
    }
  }

  viewVehicles(fleet: FleetResponse) {
    this.selectedFleet.set(fleet);
    this.loadingVehicles.set(true);
    this.fleetService.listFleetVehicles(fleet.id, 0, 100).subscribe({
      next: (response) => {
        this.vehicles.set(response.content);
        this.loadingVehicles.set(false);
        this.activeModal.set('vehicle');
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.notificationService.error('Error al cargar los vehículos');
        this.loadingVehicles.set(false);
      }
    });
  }

  openAddVehicleForm() {
    this.vehicleForm.reset();
    this.showAddVehicleForm.set(true);
  }

  cancelAddVehicle() {
    this.showAddVehicleForm.set(false);
    this.vehicleForm.reset();
  }

  submitVehicleForm() {
    if (this.vehicleForm.invalid || !this.selectedFleet()) return;

    this.submitting.set(true);
    const formValue = this.vehicleForm.getRawValue();

    const request: AddVehicleToFleetRequest = {
      license_plate: formValue.license_plate!,
      plan_id: Number(formValue.plan_id),
      vehicle_type_id: Number(formValue.vehicle_type_id),
      assigned_employee: formValue.assigned_employee || undefined
    };

    this.fleetService.addVehicleToFleet(this.selectedFleet()!.id, request).subscribe({
      next: () => {
        this.notificationService.success('Vehículo agregado exitosamente');
        this.showAddVehicleForm.set(false);
        this.vehicleForm.reset();
        this.viewVehicles(this.selectedFleet()!);
        this.loadFleets();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        this.notificationService.error(error.error?.message || 'Error al agregar el vehículo');
        this.submitting.set(false);
      }
    });
  }

  confirmDeleteVehicle(vehicle: FleetVehicleResponse) {
    this.vehicleToDelete.set(vehicle);
    this.activeModal.set('delete-vehicle');
  }

  deleteVehicle() {
    if (!this.selectedFleet() || !this.vehicleToDelete()) return;

    this.submitting.set(true);
    this.fleetService.removeVehicleFromFleet(
      this.selectedFleet()!.id,
      this.vehicleToDelete()!.id
    ).subscribe({
      next: () => {
        this.notificationService.success('Vehículo eliminado exitosamente');
        this.activeModal.set('vehicle');
        this.vehicleToDelete.set(null);
        this.viewVehicles(this.selectedFleet()!);
        this.loadFleets();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error deleting vehicle:', error);
        this.notificationService.error(error.error?.message || 'Error al eliminar el vehículo');
        this.submitting.set(false);
      }
    });
  }

  openDiscountModal(fleet: FleetResponse) {
    this.selectedFleet.set(fleet);
    this.fleetService.getFleetDiscounts(fleet.id).subscribe({
      next: (response) => {
        this.currentDiscount.set(response);
        this.discountForm.patchValue({
          corporate_discount_percentage: response.corporate_discount_percentage
        });
        this.activeModal.set('discount');
      },
      error: (error) => {
        console.error('Error loading discounts:', error);
        this.notificationService.error('Error al cargar los descuentos');
      }
    });
  }

  submitDiscountForm() {
    if (this.discountForm.invalid || !this.selectedFleet()) return;

    this.submitting.set(true);
    const formValue = this.discountForm.getRawValue();

    const request: UpdateFleetDiscountsRequest = {
      corporate_discount_percentage: formValue.corporate_discount_percentage!
    };

    this.fleetService.updateFleetDiscounts(this.selectedFleet()!.id, request).subscribe({
      next: () => {
        this.notificationService.success('Descuentos actualizados exitosamente');
        this.closeModal();
        this.loadFleets();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error updating discounts:', error);
        this.notificationService.error(error.error?.message || 'Error al actualizar los descuentos');
        this.submitting.set(false);
      }
    });
  }

  viewConsumption(fleet: FleetResponse) {
    this.selectedFleet.set(fleet);
    this.loadingConsumption.set(true);
    this.fleetService.getFleetConsumption(fleet.id).subscribe({
      next: (response) => {
        this.consumption.set(response);
        this.loadingConsumption.set(false);
        this.activeModal.set('consumption');
      },
      error: (error) => {
        console.error('Error loading consumption:', error);
        this.notificationService.error('Error al cargar las estadísticas');
        this.loadingConsumption.set(false);
      }
    });
  }

  confirmDeleteFleet(fleet: FleetResponse) {
    if (fleet.active_vehicles_count > 0) {
      this.notificationService.warning('No se puede eliminar una flotilla con vehículos activos');
      return;
    }
    this.fleetToDelete.set(fleet);
    this.activeModal.set('delete-fleet');
  }

  deleteFleet() {
    if (!this.fleetToDelete()) return;

    this.submitting.set(true);
    this.fleetService.deleteFleet(this.fleetToDelete()!.id).subscribe({
      next: () => {
        this.notificationService.success('Flotilla eliminada exitosamente');
        this.closeModal();
        this.loadFleets();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error deleting fleet:', error);
        this.notificationService.error(error.error?.message || 'Error al eliminar la flotilla');
        this.submitting.set(false);
      }
    });
  }

  closeModal() {
    this.activeModal.set(null);
    this.editingFleet.set(null);
    this.selectedFleet.set(null);
    this.fleetToDelete.set(null);
    this.vehicleToDelete.set(null);
    this.showAddVehicleForm.set(false);
    this.vehicles.set([]);
    this.consumption.set(null);
    this.currentDiscount.set(null);
    this.fleetForm.reset();
    this.vehicleForm.reset();
    this.discountForm.reset();
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadFleets();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadFleets();
    }
  }

  getBillingPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      'DAILY': 'Diario',
      'WEEKLY': 'Semanal',
      'MONTHLY': 'Mensual',
      'ANNUAL': 'Anual'
    };
    return labels[period] || period;
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
