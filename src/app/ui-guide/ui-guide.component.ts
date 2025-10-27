import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../shared/components/button.component';
import { InputComponent } from '../shared/components/input.component';
import { CardComponent } from '../shared/components/card.component';
import { ModalComponent } from '../shared/components/modal.component';
import { BadgeComponent } from '../shared/components/badge.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner.component';
import { TableComponent, TableColumn } from '../shared/components/table.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-ui-guide',
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    ModalComponent,
    BadgeComponent,
    LoadingSpinnerComponent,
    TableComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Guía de Componentes UI</h1>
          <p class="mt-2 text-gray-600">Componentes reutilizables para Park Control S.A.</p>
        </div>

        <div class="space-y-8">
          <!-- Buttons -->
          <app-card title="Botones">
            <div class="space-y-6">
              <!-- Variants -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Variantes</h4>
                <div class="flex flex-wrap gap-3">
                  <app-button variant="primary">Primary</app-button>
                  <app-button variant="secondary">Secondary</app-button>
                  <app-button variant="success">Success</app-button>
                  <app-button variant="danger">Danger</app-button>
                  <app-button variant="warning">Warning</app-button>
                  <app-button variant="ghost">Ghost</app-button>
                </div>
              </div>

              <!-- Sizes -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Tamaños</h4>
                <div class="flex flex-wrap items-center gap-3">
                  <app-button size="sm">Small</app-button>
                  <app-button size="md">Medium</app-button>
                  <app-button size="lg">Large</app-button>
                </div>
              </div>

              <!-- States -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Estados</h4>
                <div class="flex flex-wrap gap-3">
                  <app-button [disabled]="true">Disabled</app-button>
                  <app-button [loading]="true">Loading</app-button>
                  <app-button [fullWidth]="true">Full Width</app-button>
                </div>
              </div>
            </div>
          </app-card>

          <!-- Inputs -->
          <app-card title="Inputs">
            <div class="space-y-6 max-w-md">
              <app-input 
                label="Nombre completo" 
                placeholder="Ingresa tu nombre"
                [(value)]="sampleName"
              />
              
              <app-input 
                type="email"
                label="Correo electrónico" 
                placeholder="ejemplo@correo.com"
                hint="Usaremos este correo para contactarte"
                [(value)]="sampleEmail"
              />
              
              <app-input 
                type="password"
                label="Contraseña" 
                placeholder="••••••••"
                [required]="true"
                [(value)]="samplePassword"
              />
              
              <app-input 
                label="Campo con error" 
                placeholder="Ingresa algo"
                error="Este campo es requerido"
                [(value)]="sampleError"
              />
              
              <app-input 
                label="Campo deshabilitado" 
                placeholder="No editable"
                [disabled]="true"
                [(value)]="sampleDisabled"
              />
            </div>
          </app-card>

          <!-- Cards -->
          <app-card title="Cards">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <app-card title="Card Simple">
                <p class="text-gray-600">Este es un card simple con título y contenido.</p>
              </app-card>

              <app-card title="Card con Footer" [footer]="true">
                <p class="text-gray-600">Este card tiene un footer.</p>
                <div footer class="flex justify-end gap-2">
                  <app-button variant="ghost" size="sm">Cancelar</app-button>
                  <app-button variant="primary" size="sm">Guardar</app-button>
                </div>
              </app-card>

              <app-card title="Card con Acciones" [actions]="true">
                <div actions>
                  <app-button variant="ghost" size="sm">Editar</app-button>
                </div>
                <p class="text-gray-600">Este card tiene botones de acción en el header.</p>
              </app-card>

              <app-card [hoverable]="true">
                <p class="text-gray-600">Card hoverable sin título. Pasa el cursor sobre mí.</p>
              </app-card>
            </div>
          </app-card>

          <!-- Badges -->
          <app-card title="Badges">
            <div class="flex flex-wrap gap-3">
              <app-badge variant="success">Activo</app-badge>
              <app-badge variant="error">Error</app-badge>
              <app-badge variant="warning">Pendiente</app-badge>
              <app-badge variant="info">Info</app-badge>
              <app-badge variant="default">Default</app-badge>
            </div>
          </app-card>

          <!-- Loading -->
          <app-card title="Loading Spinner">
            <app-loading-spinner />
          </app-card>

          <!-- Modals -->
          <app-card title="Modales">
            <div class="flex gap-3">
              <app-button (clicked)="showModal.set(true)">Abrir Modal</app-button>
              <app-button variant="secondary" (clicked)="showModalWithFooter.set(true)">Modal con Footer</app-button>
            </div>
          </app-card>

          <!-- Notifications -->
          <app-card title="Notificaciones (Toasts)">
            <div class="flex flex-wrap gap-3">
              <app-button variant="success" (clicked)="showSuccess()">Success Toast</app-button>
              <app-button variant="danger" (clicked)="showError()">Error Toast</app-button>
              <app-button variant="warning" (clicked)="showWarning()">Warning Toast</app-button>
              <app-button variant="secondary" (clicked)="showInfo()">Info Toast</app-button>
            </div>
          </app-card>

          <!-- Table -->
          <app-card title="Tabla con Paginación">
            <app-table
              [columns]="tableColumns"
              [data]="tableData()"
              [loading]="tableLoading()"
              [currentPage]="1"
              [itemsPerPage]="10"
              [totalItems]="tableData().length"
            />
            <div class="mt-4 flex gap-2">
              <app-button size="sm" (clicked)="tableLoading.set(!tableLoading())">
                {{ tableLoading() ? 'Ocultar' : 'Mostrar' }} Loading
              </app-button>
              <app-button size="sm" variant="secondary" (clicked)="clearTableData()">
                Limpiar Datos
              </app-button>
              <app-button size="sm" variant="success" (clicked)="loadTableData()">
                Cargar Datos
              </app-button>
            </div>
          </app-card>
        </div>
      </div>
    </div>

    <!-- Modal Examples -->
    <app-modal 
      [isOpen]="showModal()" 
      title="Modal de Ejemplo"
      (closed)="showModal.set(false)"
    >
      <p class="text-gray-600">Este es el contenido del modal. Puedes agregar cualquier contenido aquí.</p>
      <p class="text-gray-600 mt-2">Haz clic fuera del modal o en la X para cerrarlo.</p>
    </app-modal>

    <app-modal 
      [isOpen]="showModalWithFooter()" 
      title="Confirmar Acción"
      [footer]="true"
      (closed)="showModalWithFooter.set(false)"
    >
      <p class="text-gray-600">¿Estás seguro de que deseas realizar esta acción?</p>
      <div footer class="flex gap-2">
        <app-button variant="ghost" (clicked)="showModalWithFooter.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="confirmAction()">Confirmar</app-button>
      </div>
    </app-modal>
  `
})
export class UiGuideComponent {
  showModal = signal(false);
  showModalWithFooter = signal(false);
  
  // Input examples
  sampleName = signal('');
  sampleEmail = signal('');
  samplePassword = signal('');
  sampleError = signal('');
  sampleDisabled = signal('Valor no editable');

  // Table example
  tableLoading = signal(false);
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'plate', label: 'Placa', sortable: true },
    { key: 'branch', label: 'Sucursal' },
    { key: 'entryTime', label: 'Hora Entrada' },
    { key: 'status', label: 'Estado' }
  ];
  
  tableData = signal([
    { id: 1, plate: 'ABC-123', branch: 'Centro', entryTime: '10:30 AM', status: 'Activo' },
    { id: 2, plate: 'XYZ-789', branch: 'Norte', entryTime: '11:15 AM', status: 'Activo' },
    { id: 3, plate: 'DEF-456', branch: 'Sur', entryTime: '09:45 AM', status: 'Activo' }
  ]);

  constructor(private notificationService: NotificationService) {}

  showSuccess() {
    this.notificationService.success('¡Operación exitosa!');
  }

  showError() {
    this.notificationService.error('Ha ocurrido un error');
  }

  showWarning() {
    this.notificationService.warning('Advertencia: Revisa los datos');
  }

  showInfo() {
    this.notificationService.info('Información importante');
  }

  confirmAction() {
    this.showModalWithFooter.set(false);
    this.notificationService.success('Acción confirmada');
  }

  clearTableData() {
    this.tableData.set([]);
  }

  loadTableData() {
    this.tableLoading.set(true);
    setTimeout(() => {
      this.tableData.set([
        { id: 1, plate: 'ABC-123', branch: 'Centro', entryTime: '10:30 AM', status: 'Activo' },
        { id: 2, plate: 'XYZ-789', branch: 'Norte', entryTime: '11:15 AM', status: 'Activo' },
        { id: 3, plate: 'DEF-456', branch: 'Sur', entryTime: '09:45 AM', status: 'Activo' }
      ]);
      this.tableLoading.set(false);
    }, 1000);
  }
}
