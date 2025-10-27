# Componentes Compartidos - Park Control Frontend

Este directorio contiene todos los componentes reutilizables del sistema.

## 📦 Componentes Disponibles

### ButtonComponent
Botón reutilizable con múltiples variantes y estados.

**Variantes:** `primary`, `secondary`, `success`, `danger`, `warning`, `ghost`  
**Tamaños:** `sm`, `md`, `lg`

```typescript
import { ButtonComponent } from './shared/components/button.component';

// En el template:
<app-button 
  variant="primary" 
  size="md"
  [loading]="isSubmitting"
  [disabled]="!form.valid"
  (click)="onSubmit()">
  Guardar
</app-button>
```

### InputComponent
Campo de entrada con validación y estados de error.

**Tipos:** `text`, `email`, `password`, `number`, `date`, `tel`, `url`

```typescript
import { InputComponent } from './shared/components/input.component';

// En el template:
<app-input
  label="Correo Electrónico"
  type="email"
  placeholder="usuario@ejemplo.com"
  [required]="true"
  [error]="'El correo es inválido'"
  [(value)]="email">
</app-input>
```

### CardComponent
Contenedor con título, acciones y footer opcionales.

```typescript
import { CardComponent } from './shared/components/card.component';

<app-card 
  title="Información del Ticket"
  [hoverable]="true">
  <div class="card-content">
    <!-- Contenido aquí -->
  </div>
  <div class="card-footer">
    <app-button variant="primary">Aceptar</app-button>
  </div>
</app-card>
```

### ModalComponent
Diálogo modal con backdrop.

```typescript
import { ModalComponent } from './shared/components/modal.component';

<app-modal 
  title="Confirmar Acción"
  [isOpen]="showModal"
  (close)="closeModal()">
  <div class="modal-content">
    <p>¿Estás seguro de realizar esta acción?</p>
  </div>
  <div class="modal-footer">
    <app-button variant="ghost" (click)="closeModal()">Cancelar</app-button>
    <app-button variant="danger" (click)="confirm()">Confirmar</app-button>
  </div>
</app-modal>
```

### TableComponent
Tabla con paginación y ordenamiento.

```typescript
import { TableComponent } from './shared/components/table.component';

interface User {
  id: number;
  name: string;
  email: string;
}

columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: false }
];

users = signal<User[]>([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  // más datos...
]);

currentPage = signal(1);
totalUsers = 100;

<app-table
  [columns]="columns"
  [data]="users()"
  [loading]="isLoading"
  [currentPage]="currentPage()"
  [itemsPerPage]="10"
  [totalItems]="totalUsers"
  (pageChanged)="onPageChange($event)"
  (sort)="onSort($event)">
</app-table>
```

### BadgeComponent
Etiqueta de estado o categoría.

**Variantes:** `default`, `success`, `warning`, `danger`, `info`

```typescript
import { BadgeComponent } from './shared/components/badge.component';

<app-badge variant="success">Activo</app-badge>
<app-badge variant="danger">Vencido</app-badge>
<app-badge variant="warning">Pendiente</app-badge>
```

### LoadingSpinnerComponent
Indicador de carga animado.

**Tamaños:** `sm`, `md`, `lg`

```typescript
import { LoadingSpinnerComponent } from './shared/components/loading-spinner.component';

<app-loading-spinner size="md" />
```

### ToastContainerComponent
Sistema de notificaciones emergentes (ya integrado globalmente en `app.html`).

```typescript
import { NotificationService } from './shared/services/notification.service';

constructor(private notification: NotificationService) {}

// En cualquier método:
this.notification.show('Guardado exitoso', 'success');
this.notification.show('Error al procesar', 'error');
this.notification.show('Revise los datos', 'warning');
this.notification.show('Nuevo mensaje', 'info');
```

## 🎨 Guía Visual

Para ver todos los componentes con ejemplos interactivos, navega a:

```
http://localhost:4200/ui-guide
```

Esta página muestra todos los componentes con diferentes configuraciones y casos de uso.

## 📋 Convenciones

1. **Imports:** Todos los componentes son standalone y deben importarse explícitamente.
2. **Signals:** Los componentes usan Angular signals para reactividad.
3. **Tailwind:** Todos los estilos están basados en clases de Tailwind CSS.
4. **CommonModule:** Todos los componentes importan `CommonModule` para directivas básicas.

## 🔧 Uso en Módulos

Para usar estos componentes en cualquier módulo:

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/components/button.component';
import { CardComponent } from '../shared/components/card.component';

@Component({
  standalone: true,
  imports: [ButtonComponent, CardComponent],
  template: `
    <app-card title="Mi Módulo">
      <app-button variant="primary">Acción</app-button>
    </app-card>
  `
})
export class MiModuloComponent {}
```

## 📝 Notas

- El sistema de notificaciones (`NotificationService`) está disponible globalmente.
- No es necesario importar `ToastContainerComponent` en cada módulo, ya está en `app.html`.
- Todos los componentes aceptan clases CSS adicionales mediante el atributo `class`.

---

**Última actualización:** Enero 2025  
**Versión Angular:** 20.3.0
