import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RateService, RateBaseResponse, BranchRateResponse } from './services/rate.service';
import { NotificationService } from '../shared/services/notification.service';

type ModalType = 'update-base' | 'update-branch' | 'history' | 'delete-branch' | null;

@Component({
  selector: 'app-rates-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rates-management.component.html'
})
export class RatesManagementComponent implements OnInit {
  private rateService = inject(RateService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // State signals
  currentBaseRate = signal<RateBaseResponse | null>(null);
  branchRates = signal<BranchRateResponse[]>([]);
  rateHistory = signal<RateBaseResponse[]>([]);
  selectedBranch = signal<BranchRateResponse | null>(null);
  activeModal = signal<ModalType>(null);
  loading = signal(false);
  submitting = signal(false);

  // Forms
  baseRateForm!: FormGroup;
  branchRateForm!: FormGroup;

  // Computed
  activeBranchesCount = computed(() => 
    this.branchRates().filter(b => b.is_active).length
  );

  branchesWithCustomRate = computed(() => 
    this.branchRates().filter(b => b.rate_per_hour !== null).length
  );

  branchesUsingBaseRate = computed(() => 
    this.branchRates().filter(b => b.rate_per_hour === null).length
  );

  ngOnInit(): void {
    this.initForms();
    this.loadCurrentBaseRate();
    this.loadBranchRates();
  }

  initForms(): void {
    this.baseRateForm = this.fb.group({
      amount_per_hour: ['', [Validators.required, Validators.min(1), Validators.max(1000)]]
    });

    this.branchRateForm = this.fb.group({
      rate_per_hour: ['', [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  // ==================== TARIFA BASE ====================

  loadCurrentBaseRate(): void {
    this.loading.set(true);
    this.rateService.getCurrentBaseRate().subscribe({
      next: (response) => {
        this.currentBaseRate.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading base rate:', error);
        this.notificationService.error('Error al cargar la tarifa base');
        this.loading.set(false);
      }
    });
  }

  openUpdateBaseRateModal(): void {
    if (this.currentBaseRate()) {
      this.baseRateForm.patchValue({
        amount_per_hour: this.currentBaseRate()!.amount_per_hour
      });
    }
    this.activeModal.set('update-base');
  }

  submitBaseRateForm(): void {
    if (this.baseRateForm.invalid) return;

    this.submitting.set(true);
    const request = this.baseRateForm.value;

    this.rateService.updateBaseRate(request).subscribe({
      next: (response) => {
        this.notificationService.success('Tarifa base actualizada exitosamente');
        this.currentBaseRate.set(response.data);
        this.closeModal();
        this.submitting.set(false);
        // Recargar sucursales para reflejar cambios
        this.loadBranchRates();
      },
      error: (error) => {
        console.error('Error updating base rate:', error);
        this.notificationService.error(
          error.error?.message || 'Error al actualizar la tarifa base'
        );
        this.submitting.set(false);
      }
    });
  }

  openHistoryModal(): void {
    this.loading.set(true);
    this.activeModal.set('history');
    
    this.rateService.getBaseRateHistory().subscribe({
      next: (response) => {
        this.rateHistory.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.notificationService.error('Error al cargar el historial');
        this.loading.set(false);
        this.closeModal();
      }
    });
  }

  // ==================== TARIFAS POR SUCURSAL ====================

  loadBranchRates(): void {
    this.rateService.getAllBranchRates().subscribe({
      next: (response) => {
        this.branchRates.set(response.data);
      },
      error: (error) => {
        console.error('Error loading branch rates:', error);
        this.notificationService.error('Error al cargar tarifas de sucursales');
      }
    });
  }

  openUpdateBranchRateModal(branch: BranchRateResponse): void {
    this.selectedBranch.set(branch);
    this.branchRateForm.patchValue({
      rate_per_hour: branch.rate_per_hour || this.currentBaseRate()?.amount_per_hour || ''
    });
    this.activeModal.set('update-branch');
  }

  submitBranchRateForm(): void {
    if (this.branchRateForm.invalid || !this.selectedBranch()) return;

    this.submitting.set(true);
    const request = this.branchRateForm.value;
    const branchId = this.selectedBranch()!.branch_id;

    this.rateService.updateBranchRate(branchId, request).subscribe({
      next: (response) => {
        const action = this.selectedBranch()!.rate_per_hour === null ? 'asignada' : 'actualizada';
        this.notificationService.success(`Tarifa ${action} exitosamente`);
        
        // Actualizar en la lista
        this.branchRates.update(rates => 
          rates.map(r => r.branch_id === branchId ? response.data : r)
        );
        
        this.closeModal();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error updating branch rate:', error);
        this.notificationService.error(
          error.error?.message || 'Error al actualizar la tarifa'
        );
        this.submitting.set(false);
      }
    });
  }

  confirmDeleteBranchRate(branch: BranchRateResponse): void {
    if (branch.rate_per_hour === null) {
      this.notificationService.warning('Esta sucursal ya usa la tarifa base');
      return;
    }
    this.selectedBranch.set(branch);
    this.activeModal.set('delete-branch');
  }

  deleteBranchRate(): void {
    if (!this.selectedBranch()) return;

    this.submitting.set(true);
    const branchId = this.selectedBranch()!.branch_id;

    this.rateService.deleteBranchRate(branchId).subscribe({
      next: () => {
        this.notificationService.success('Tarifa eliminada. La sucursal ahora usa la tarifa base');
        
        // Actualizar en la lista (rate_per_hour = null)
        this.branchRates.update(rates => 
          rates.map(r => r.branch_id === branchId ? { ...r, rate_per_hour: null } : r)
        );
        
        this.closeModal();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error deleting branch rate:', error);
        this.notificationService.error(
          error.error?.message || 'Error al eliminar la tarifa'
        );
        this.submitting.set(false);
      }
    });
  }

  // ==================== HELPERS ====================

  closeModal(): void {
    this.activeModal.set(null);
    this.selectedBranch.set(null);
    this.baseRateForm.reset();
    this.branchRateForm.reset();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Actual';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEffectiveRate(branch: BranchRateResponse): number {
    return branch.rate_per_hour ?? this.currentBaseRate()?.amount_per_hour ?? 0;
  }
}
