  # 📝 TODO - Park Control Frontend

  **Última actualización:** 6 de Enero, 2026 - 2:00 PM  
  ⚠️ **ESTADO:** Módulo de Tarifas implementado - Backend tiene 7 endpoints completos

  ---

  ## 📊 RESUMEN EJECUTIVO - PROGRESO GENERAL (52/74 pts - 70.3%)

  ### ✅ Completados (52 pts)
  - ✅ **Seguridad:** 5 pts (100%)
  - ✅ **Reportes:** 12 pts (100%)
  - ✅ **Tickets:** 10 pts (100%)
  - ✅ **Admin:** 18 pts (100%)
    - Comercios: 4/4 pts ✅
    - Planes + Bitácora: 3/3 pts ✅
    - Tarifas: 3/3 pts ✅
    - Comercios Afiliados: 8/8 pts ✅ ⭐ NUEVO
  - ✅ **Flotillas:** 7 pts (100%)

  ### 🔄 Asignado a compañero (24 pts)
  - 🔄 **Suscripciones:** 14 pts (compañero trabajando)
  - 🔄 **Back Office:** 10 pts (compañero trabajando)

  ### ⏳ Pendiente de implementar (0 pts)
  - ⏸️ **Admin Validaciones:** 0/0.5 pts (postponed, backend sin endpoints)

  ---

  ## � MÓDULO FLOTILLAS - ✅ COMPLETADO (7/7 pts)

  **Fecha Implementación:** 5 de Noviembre, 2025  
  **Estado:** ✅ LISTO PARA INTEGRACIÓN CON BACKEND

  ### ✅ Backend Disponible (API Completa - 11 endpoints)

  **Controller:** `FleetController.java`

  #### Endpoints Implementados:
  ```
  ✅ GET    /fleets                          → Listar flotillas (paginado)
  ✅ POST   /fleets                          → Crear flotilla
  ✅ GET    /fleets/{id}                     → Obtener detalles
  ✅ PUT    /fleets/{id}                     → Actualizar flotilla
  ✅ DELETE /fleets/{id}                     → Eliminar flotilla
  ✅ GET    /fleets/{id}/vehicles            → Listar vehículos (paginado)
  ✅ POST   /fleets/{id}/vehicles            → Agregar vehículo
  ✅ DELETE /fleets/{id}/vehicles/{vehicleId} → Eliminar vehículo
  ✅ GET    /fleets/{id}/discounts           → Obtener descuentos
  ✅ PUT    /fleets/{id}/discounts           → Actualizar descuentos
  ✅ GET    /fleets/{id}/consumption         → Estadísticas de consumo
  ```

  ### ✅ Frontend Implementado (100% Completo)

  #### Archivos Creados:
  ```
  src/app/admin/
  ├── services/
  │   └── fleet.service.ts (264 líneas)
  │       ├── ✅ 11 métodos HTTP mapeados
  │       ├── ✅ Interfaces TypeScript (10 DTOs)
  │       ├── ✅ Soporte de paginación
  │       └── ✅ Manejo de errores
  ├── fleets-management.component.ts (413 líneas)
  │   ├── ✅ CRUD completo con signals
  │   ├── ✅ 6 tipos de modales
  │   ├── ✅ 3 formularios reactivos
  │   ├── ✅ Integración con NotificationService
  │   └── ✅ Validaciones completas
  └── fleets-management.component.html (745 líneas)
      ├── ✅ Tabla principal con 8 columnas
      ├── ✅ Filtros y paginación
      ├── ✅ Modal CRUD de flotillas
      ├── ✅ Modal gestión de vehículos
      ├── ✅ Modal configuración de descuentos
      ├── ✅ Modal estadísticas de consumo
      ├── ✅ Modal confirmación eliminar flotilla
      └── ✅ Modal confirmación eliminar vehículo
  ```

  #### Rutas Configuradas:
  ```typescript
  // admin.routes.ts
  { path: 'fleets', loadComponent: () => import('./fleets-management.component') }

  // admin.layout.ts
  { label: '🚗 Flotillas', link: '/admin/fleets' }
  ```

  ### ✅ Funcionalidades Implementadas (7/7 puntos)

  #### 1. CRUD Completo de Flotillas (2 pts) ✅
  - [x] **Listar flotillas con paginación**
    - Tabla con 8 columnas: Empresa, NIT, Contacto, Descuento, Vehículos, Facturación, Estado, Acciones
    - Filtro por estado (Todas/Activas/Inactivas)
    - Indicadores visuales (badges de color, contadores)
    - Paginación con botones Anterior/Siguiente

  - [x] **Crear flotilla**
    - Modal con formulario reactivo
    - Validaciones:
      * Nombre: requerido, máx 200 caracteres
      * NIT: requerido, máx 50 caracteres, único
      * Email corporativo: requerido, formato válido
      * Teléfono: 8-15 dígitos (opcional)
      * Descuento corporativo: 0-10% (requerido)
      * Límite de placas: 1-50 (requerido)
      * Período facturación: DAILY|WEEKLY|MONTHLY|ANNUAL
    - Notificación toast de éxito/error

  - [x] **Editar flotilla**
    - Modal pre-rellenado con datos actuales
    - NIT readonly (no editable)
    - Todos los demás campos editables
    - Toggle estado Activa/Inactiva
    - Validaciones idénticas a creación

  - [x] **Eliminar flotilla**
    - Validación: solo si no tiene vehículos activos
    - Botón deshabilitado con tooltip si tiene vehículos
    - Modal de confirmación con advertencia
    - Contador de vehículos activos visible

  #### 2. Gestión de Vehículos (2 pts) ✅
  - [x] **Listar vehículos de flotilla**
    - Modal con tabla de vehículos
    - Columnas: Placa, Empleado, Plan, Tipo, Estado, Acciones
    - Contador: vehículos activos / límite de placas
    - Estados visuales (badges verde/rojo)
    - Empty state con icono si no hay vehículos

  - [x] **Agregar vehículo**
    - Formulario inline dentro del modal
    - Validaciones:
      * Placa: formato ABC-123 o P-12345 (regex)
      * Plan: selección de lista (requerido)
      * Tipo vehículo: selección de lista (requerido)
      * Empleado asignado: texto libre (opcional)
    - Botón deshabilitado si alcanzó límite de placas
    - Notificación de éxito/error

  - [x] **Eliminar vehículo**
    - Botón en cada fila de la tabla
    - Modal de confirmación con advertencia
    - Muestra placa del vehículo a eliminar
    - Actualización automática de contador

  #### 3. Configuración de Descuentos Corporativos (1 pt) ✅
  - [x] **Ver descuentos actuales**
    - Modal dedicado para descuentos
    - Muestra:
      * Nombre de la flotilla
      * Descuento corporativo actual (%)
      * Descuento máximo total permitido (%)
    - Información contextual (badge azul)

  - [x] **Actualizar descuento corporativo**
    - Campo numérico con validación 0-10%
    - Incrementos de 0.01% (step)
    - Explicación: "El descuento corporativo se suma a los descuentos de planes"
    - Validación en tiempo real
    - Toast de confirmación

  #### 4. Estadísticas de Consumo (2 pts) ✅
  - [x] **Vista de estadísticas generales**
    - Modal amplio con layout profesional
    - 4 cards de resumen (grid 4 columnas):
      * Total Vehículos (azul)
      * Total Entradas (verde)
      * Horas Consumidas (morado)
      * Monto Total Q (naranja)
    - Indicador de período (inicio - fin)

  - [x] **Desglose por vehículo**
    - Tabla detallada de consumo individual
    - Columnas: Placa, Empleado, Entradas, Horas, Monto
    - Formato monetario con Q (Quetzales)
    - Hover effects para mejor UX
    - Empty state si no hay datos del período

  ### 🎨 Diseño y UX

  #### Componentes Visuales:
  - ✅ **Emojis en lugar de iconos FontAwesome**
    - ✏️ Editar
    - 🚗 Gestionar vehículos
    - 💰 Configurar descuentos
    - 📊 Ver estadísticas
    - 🗑️ Eliminar
    - ➕ Agregar
    - ❌ Cerrar
    - ⏳ Cargando
    - ⚠️ Advertencia

  - ✅ **Estados de carga**
    - Spinner animado durante fetch
    - Botones con estado "Guardando..."/"Eliminando..."
    - Indicador de carga en modales

  - ✅ **Validaciones UI**
    - Campos con borde rojo si inválidos
    - Mensajes de error contextuales
    - Botones deshabilitados hasta validación
    - Tooltips informativos

  - ✅ **Responsive Design**
    - Grid adaptativo (1-4 columnas según viewport)
    - Modales con scroll interno
    - Tabla con overflow-x-auto
    - Mobile-friendly

  ### 🔧 Arquitectura Técnica

  #### Gestión de Estado (Signals):
  ```typescript
  // Signals principales (10+)
  fleets = signal<FleetResponse[]>([]);
  vehicles = signal<FleetVehicleResponse[]>([]);
  consumption = signal<FleetConsumptionResponse | null>(null);
  currentDiscount = signal<FleetDiscountsResponse | null>(null);
  selectedFleet = signal<FleetResponse | null>(null);
  activeModal = signal<ModalType | null>(null);
  loading = signal(false);
  loadingVehicles = signal(false);
  loadingConsumption = signal(false);
  submitting = signal(false);

  // Computed values
  vehiclesCount = computed(() => 
    this.vehicles().filter(v => v.is_active).length
  );
  ```

  #### Formularios Reactivos (3):
  ```typescript
  // 1. Fleet Form
  fleetForm = FormGroup {
    name: required, maxLength(200)
    tax_id: required, maxLength(50)
    corporate_email: required, email
    contact_name: maxLength(200)
    phone: pattern(/^\d{8,15}$/)
    corporate_discount_percentage: required, min(0), max(10)
    plate_limit: required, min(1), max(50)
    billing_period: required
    is_active: boolean
  }

  // 2. Vehicle Form
  vehicleForm = FormGroup {
    license_plate: required, pattern(/^[A-Z0-9]{1,3}-\d{3,5}$/)
    plan_id: required
    vehicle_type_id: required
    assigned_employee: optional
  }

  // 3. Discount Form
  discountForm = FormGroup {
    corporate_discount_percentage: required, min(0), max(10)
  }
  ```

  #### Manejo de Modales (6 tipos):
  ```typescript
  type ModalType = 
    | 'fleet'              // CRUD flotillas
    | 'vehicle'            // Gestión vehículos
    | 'discount'           // Configuración descuentos
    | 'consumption'        // Estadísticas
    | 'delete-fleet'       // Confirmación eliminar flotilla
    | 'delete-vehicle';    // Confirmación eliminar vehículo
  ```

  ### 📋 DTOs Implementados

  ```typescript
  // Request DTOs
  CreateFleetRequest {
    name: string;
    tax_id: string;
    contact_name?: string;
    corporate_email: string;
    phone?: string;
    corporate_discount_percentage: number;
    plate_limit: number;
    billing_period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
  }

  UpdateFleetRequest { /* campos opcionales */ }

  AddVehicleToFleetRequest {
    license_plate: string;
    plan_id: number;
    vehicle_type_id: number;
    assigned_employee?: string;
  }

  UpdateFleetDiscountsRequest {
    corporate_discount_percentage: number;
  }

  // Response DTOs
  FleetResponse {
    id, name, tax_id, contact_name, corporate_email, phone,
    corporate_discount_percentage, plate_limit, billing_period,
    months_unpaid, is_active, created_at, updated_at,
    active_vehicles_count
  }

  FleetVehicleResponse {
    id, company_id, license_plate, plan, vehicle_type,
    assigned_employee, is_active, created_at, updated_at
  }

  FleetDiscountsResponse {
    corporate_discount_percentage, max_total_discount
  }

  FleetConsumptionResponse {
    company_id, company_name, period_start, period_end,
    total_vehicles, total_entries, total_hours_consumed,
    total_amount_charged, vehicle_consumption[]
  }
  ```

  ### 🧪 Checklist de Funcionalidades

  #### CRUD Flotillas:
  - [x] Listar con paginación
  - [x] Filtrar por estado
  - [x] Crear nueva flotilla
  - [x] Editar flotilla existente
  - [x] Eliminar flotilla (con validación)
  - [x] Ver detalles

  #### Gestión Vehículos:
  - [x] Listar vehículos de flotilla
  - [x] Agregar vehículo (con límite de placas)
  - [x] Eliminar vehículo
  - [x] Ver contador de vehículos activos

  #### Descuentos:
  - [x] Ver descuento actual
  - [x] Ver descuento máximo
  - [x] Actualizar descuento corporativo
  - [x] Validación 0-10%

  #### Estadísticas:
  - [x] Ver resumen general (4 métricas)
  - [x] Ver período de análisis
  - [x] Ver desglose por vehículo
  - [x] Formato monetario correcto

  #### UX/UI:
  - [x] Toast notifications (no alerts)
  - [x] Modales con overlay
  - [x] Estados de carga
  - [x] Validaciones en tiempo real
  - [x] Mensajes de error contextuales
  - [x] Botones deshabilitados cuando corresponde
  - [x] Emojis en lugar de iconos
  - [x] Responsive design
  - [x] Empty states informativos

  ### 🎯 Próximos Pasos (Testing)

  1. **Integración con Backend:**
    - [ ] Verificar endpoints en Swagger
    - [ ] Probar CRUD completo
    - [ ] Validar paginación
    - [ ] Verificar cálculos de descuentos
    - [ ] Probar límites de vehículos

  2. **Testing E2E:**
    - [ ] Crear flotilla → Agregar vehículos → Ver consumo
    - [ ] Probar límite de placas
    - [ ] Validar descuentos acumulativos
    - [ ] Verificar meses sin pagar

  3. **Refinamiento:**
    - [ ] Ajustar mensajes de error
    - [ ] Mejorar textos de ayuda
    - [ ] Optimizar performance si necesario

  ---

  ## �🚚 MÓDULO FLOTILLAS - EN IMPLEMENTACIÓN

  ### Backend Descubierto (✅ API Completa)

  **Controller:** `FleetController.java` (11 endpoints)

  #### Endpoints Disponibles:
  ```
  ✅ GET    /fleets                          → Listar flotillas (paginado)
  ✅ POST   /fleets                          → Crear flotilla
  ✅ GET    /fleets/{id}                     → Obtener detalles
  ✅ PUT    /fleets/{id}                     → Actualizar flotilla
  ✅ DELETE /fleets/{id}                     → Eliminar flotilla
  ✅ GET    /fleets/{id}/vehicles            → Listar vehículos (paginado)
  ✅ POST   /fleets/{id}/vehicles            → Agregar vehículo
  ✅ DELETE /fleets/{id}/vehicles/{vehicleId} → Eliminar vehículo
  ✅ GET    /fleets/{id}/discounts           → Obtener descuentos
  ✅ PUT    /fleets/{id}/discounts           → Actualizar descuentos
  ✅ GET    /fleets/{id}/consumption         → Estadísticas de consumo
  ```

  #### DTOs Identificados:
  ```typescript
  // Request DTOs
  CreateFleetRequest {
    name, tax_id, contact_name, corporate_email, phone,
    corporate_discount_percentage (0-10%), plate_limit (1-50),
    billing_period: DAILY|WEEKLY|MONTHLY|ANNUAL
  }

  UpdateFleetRequest { ...campos opcionales, is_active }

  AddVehicleToFleetRequest {
    license_plate, plan_id, vehicle_type_id, assigned_employee
  }

  UpdateFleetDiscountsRequest {
    corporate_discount_percentage (0-10%)
  }

  // Response DTOs
  FleetResponse {
    id, name, tax_id, contact_name, corporate_email, phone,
    corporate_discount_percentage, plate_limit, billing_period,
    months_unpaid, is_active, created_at, updated_at,
    active_vehicles_count
  }

  FleetVehicleResponse {
    id, company_id, license_plate, plan, vehicle_type,
    assigned_employee, is_active, created_at, updated_at
  }

  FleetDiscountsResponse {
    corporate_discount_percentage, max_total_discount
  }

  FleetConsumptionResponse {
    company_id, company_name, period_start, period_end,
    total_vehicles, total_entries, total_hours_consumed,
    total_amount_charged, vehicle_consumption[]
  }
  ```

  ### Frontend Implementado (✅ COMPLETO)

  #### Archivos Creados:
  ```
  src/app/admin/
  ├── services/
  │   └── fleet.service.ts (264 líneas)
  │       ├── 11 métodos mapeados a endpoints
  │       ├── Interfaces TypeScript completas
  │       └── Soporte de paginación
  └── fleets-management.component.ts (568 líneas)
      ├── CRUD completo de flotillas
      ├── Modal crear/editar con validación
      ├── Tabla con paginación
      ├── Filtros por estado (activo/inactivo)
      └── Acciones: Ver, Editar, Vehículos, Consumo, Eliminar
  ```

  #### Rutas Actualizadas:
  ```typescript
  // admin.routes.ts
  { path: 'fleets', loadComponent: () => import('./fleets-management.component') }

  // admin.layout.ts
  { label: '🚚 Flotillas', link: '/admin/fleets' }
  ```

  #### Funcionalidades Implementadas:
  - [x] **Listar Flotillas**
    - Tabla con columnas: Empresa, NIT, Contacto, Descuento, Vehículos, Estado
    - Paginación con botones Anterior/Siguiente
    - Filtro por estado (Todas/Activas/Inactivas)
    - Badge de estado (verde/rojo)

  - [x] **Crear Flotilla**
    - Modal con formulario reactivo
    - Validaciones:
      * Nombre: requerido, max 200 caracteres
      * NIT: requerido, max 50 caracteres
      * Email: requerido, formato válido
      * Teléfono: 8-15 dígitos (opcional)
      * Descuento: 0-10% (requerido)
      * Límite placas: 1-50 (requerido)
      * Período: DAILY|WEEKLY|MONTHLY|ANNUAL

  - [x] **Editar Flotilla**
    - Todos los campos editables excepto NIT (readonly)
    - Toggle estado Activa/Inactiva
    - Validaciones completas

  - [x] **Eliminar Flotilla**
    - Solo si no tiene vehículos activos
    - Botón deshabilitado si tiene vehículos
    - Confirmación antes de eliminar

  - [x] **Acciones Adicionales**
    - Ver detalles (alert temporal)
    - Ver vehículos (placeholder para siguiente fase)
    - Ver consumo (placeholder para siguiente fase)

  #### Próximos Pasos:
  - [ ] Implementar vista de vehículos de flotilla
  - [ ] Implementar gestión de vehículos (agregar/remover)
  - [ ] Implementar vista de consumo con gráficos
  - [ ] Implementar configuración de descuentos (modal separado)

  ---

  ## 📊 RESUMEN EJECUTIVO - PROGRESO GENERAL

  ### 🎯 Módulo Administración (12 pts del proyecto)
  - ✅ **Completados:** 5.5 pts (45.8%)
  - ❌ **Bloqueados (sin endpoints):** 2 pts (16.7%)
  - ⏸️ **Pendientes (decidido dejar):** 3 pts (25.0%)
  - 🔄 **Implementado parcialmente:** 1.5 pts (12.5%)

  ### 📅 Estado Actual
  - ✅ **Infraestructura + Seguridad:** COMPLETADO
  - ✅ **Comercios Afiliados:** 4/4 pts (100%) - **LISTO PARA PROBAR**
  - ⚠️ **Planes de Suscripción:** 1.5/3 pts (50%) - **LISTO PARA PROBAR**
  - ✅ **Tarifas Base:** 3/3 pts - Completado exitosamente
  - ❌ **Validaciones:** 0/2 pts - Backend no tiene endpoints necesarios

  ---

  ## 🔧 FIXES RECIENTES

  ### ✅ Fix: Primer Cambio de Contraseña (2025-11-05)

  **Problema:** Backend requiere `current_password` en `/auth/password/first-change` pero el usuario no la conoce (es temporal).

  **Solución Implementada:**
  1. **LoginComponent:** Guarda la contraseña temporal en `sessionStorage` cuando `requires_password_change === true`
  2. **AuthService:** Actualizado `firstPasswordChange()` para recibir 3 parámetros (currentPassword, newPassword, confirmPassword)
  3. **ChangePasswordComponent:** 
    - Recupera la contraseña temporal de `sessionStorage`
    - La envía automáticamente al backend sin pedírsela al usuario
    - Limpia el `sessionStorage` después del cambio exitoso

  **Archivos Modificados:**
  ```typescript
  // login.component.ts (línea ~220)
  sessionStorage.setItem('parkcontrol_temp_password', this.password);

  // auth.service.ts (línea ~327)
  async firstPasswordChange(currentPassword: string, newPassword: string, confirmPassword: string)

  // change-password.component.ts (línea ~362)
  this.tempPassword = sessionStorage.getItem('parkcontrol_temp_password') || '';
  ```

  **Flujo Completo:**
  ```
  1. Usuario hace login con credenciales temporales
  2. Backend responde: { requires_password_change: true }
  3. Frontend guarda password en sessionStorage
  4. Redirige a /change-password
  5. Usuario solo ingresa nueva contraseña + confirmación
  6. Frontend recupera password temporal de sessionStorage
  7. Envía: { current_password, new_password, confirm_password }
  8. Backend valida y cambia la contraseña
  9. Frontend limpia sessionStorage
  10. Redirige al dashboard según rol
  ```

  **Estado:** ✅ Compilación exitosa, listo para probar

  ---

  ## 🧪 GUÍA DE PRUEBAS RÁPIDAS

  ### Iniciar Aplicación:
  ```bash
  cd ayd-proyecto-final-frontend
  npm run dev
  # App en: http://localhost:4200
  ```

  ### 🏪 Probar Comercios (4 pts):
  ```
  URL: http://localhost:4200/admin/commerces

  1. Crear comercio → "Nuevo Comercio" button
  2. Configurar horas gratuitas → "Beneficios" button (verde) ⭐
  3. Editar → "Editar" button
  4. Eliminar → "Eliminar" button (rojo)
  ```

  ### 💳 Probar Planes (1.5 pts):
  ```
  URL: http://localhost:4200/admin/plans

  1. Crear plan → "Nuevo Plan" → Tipo A/B/C/D
  2. Ver descuentos → Cards muestran mensual + anual
  3. Editar → "Editar" → Cambiar horas/descuentos
  4. Eliminar → "Eliminar" → Confirmar
  ```

  ---

  ## 📊 PUNTUACIÓN MÓDULO ADMINISTRACIÓN

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Comercios + Horas Gratuitas:  4.0 pts ████████████████████
  ⚠️ Planes de Suscripción:        1.5 pts ████████░░░░░░░░░░░░
  ✅ Tarifas Base:                 3.0 pts ████████████████████
  ❌ Validaciones:                 0.0 pts ░░░░░░░░░░░░░░░░░░░░
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOTAL:                          5.5 / 12 pts (45.8%)
  ```

  ---

  ## ✅ MÓDULO ADMINISTRACIÓN - ESTADO DETALLADO

  ### 🎯 Requisito 1: Comercios Afiliados + Horas Gratuitas (4 pts) ✅ 100%

  **URL de Prueba:** http://localhost:4200/admin/commerces

  #### Funcionalidades Implementadas:
  - [x] **CRUD Completo de Comercios**
    - ✅ Listar comercios en tabla
    - ✅ Crear nuevo comercio (modal con formulario)
    - ✅ Editar comercio existente
    - ✅ Eliminar comercio con confirmación
    - ✅ Estados Activo/Inactivo con badges

  - [x] **⭐ Configuración de Horas Gratuitas** (Requisito Principal)
    - ✅ Botón "Beneficios" en cada comercio
    - ✅ Modal de configuración
    - ✅ Campo: Horas gratuitas mensuales (validado > 0)
    - ✅ Campo: Descuento adicional (%)
    - ✅ Endpoint: `POST /admin/commerces/{id}/benefit`

  #### Archivos:
  ```
  src/app/admin/
  └── commerces-management.component.ts (463 líneas)
      ├── Tabla con columnas: Nombre, NIT, Contacto, Estado
      ├── Modal CRUD con validación de formularios
      └── Modal Beneficios con configuración de horas
  ```

  #### Endpoints Integrados:
  ```
  ✅ GET    /admin/commerces              → Lista comercios
  ✅ POST   /admin/commerces              → Crear comercio
  ✅ GET    /admin/commerces/{id}         → Obtener por ID
  ✅ PUT    /admin/commerces/{id}         → Actualizar
  ✅ DELETE /admin/commerces/{id}         → Eliminar
  ✅ POST   /admin/commerces/{id}/benefit → Configurar horas gratuitas ⭐
  ✅ GET    /admin/commerces/{id}/benefit → Ver beneficios
  ```

  #### Pasos para Probar:
  1. Navegar a `/admin/commerces`
  2. Crear comercio: Botón "Nuevo Comercio"
  3. Configurar beneficios: Botón "Beneficios" (verde) → Ingresar horas (ej: 10) → Guardar
  4. Editar: Botón "Editar" → Modificar datos → Actualizar
  5. Eliminar: Botón "Eliminar" → Confirmar

  ---

  ### 🎯 Requisito 2: Configuración de Planes de Suscripción (1.5 de 3 pts) ⚠️ 50%

  **URL de Prueba:** http://localhost:4200/admin/plans

  #### Funcionalidades Implementadas:
  - [x] **CRUD Completo de Planes**
    - ✅ Listar planes en grid de cards
    - ✅ Crear nuevo plan con tipo A/B/C/D
    - ✅ Editar plan (horas y descuentos)
    - ✅ Eliminar plan con confirmación
    - ✅ Estados Activo/Inactivo

  - [x] **Configuración de Descuentos**
    - ✅ Descuento mensual (%)
    - ✅ Descuento anual adicional (%)
    - ✅ Horas mensuales incluidas
    - ✅ Descripción del plan

  #### ❌ Funcionalidades NO Implementadas (backend sin endpoints):
  - ❌ **Bitácora de cambios de descuentos** → Endpoint no existe: `/discount-history`
  - ❌ **Validaciones de jerarquía** → Endpoint no existe: `/hierarchy` o `/validate`

  #### Archivos:
  ```
  src/app/admin/
  ├── subscription-plans.component.ts (Refactorizado - 170 líneas)
  │   ├── Grid de cards responsive
  │   ├── Modal crear/editar con FormsModule
  │   ├── Modal confirmación de eliminación
  │   └── ⚠️ NO usa componentes eliminados (discount-hierarchy, discount-audit)
  └── services/admin.service.ts
      └── ✅ DTOs corregidos para coincidir con backend
  ```

  #### Endpoints Integrados (SOLO REALES):
  ```
  ✅ GET    /subscription-plans           → Lista planes
  ✅ POST   /subscription-plans           → Crear plan
  ✅ GET    /subscription-plans/{id}      → Obtener plan
  ✅ PUT    /subscription-plans/{id}      → Actualizar plan
  ✅ DELETE /subscription-plans/{id}      → Eliminar plan
  ✅ GET    /subscription-plans/paginated → Lista paginada

  ❌ ELIMINADOS (no existen en backend):
    /admin/subscription-plans/discount-history
    /admin/subscription-plans/hierarchy
    /admin/subscription-plans/validate
  ```

  #### DTOs Corregidos:
  ```typescript
  // ✅ ANTES (INCORRECTO):
  interface SubscriptionPlanResponse {
    subscription_plan_id: number;
    plan_name: string;
    base_price: number;
    discount_percentage: number;
  }

  // ✅ AHORA (CORRECTO - del backend real):
  interface SubscriptionPlanResponse {
    id: number;
    plan_type_id: number;
    plan_type_name: string;       // "Plan Básico", "Plan Premium"
    plan_type_code: string;        // "A", "B", "C", "D"
    monthly_hours: number;
    monthly_discount_percentage: number;
    annual_additional_discount_percentage: number;
    description: string;
    is_active: boolean;
  }
  ```

  #### Pasos para Probar:
  1. Navegar a `/admin/plans`
  2. Crear plan: Botón "Nuevo Plan" → Seleccionar tipo → Configurar → Guardar
  3. Editar: Botón "Editar" → Cambiar horas/descuentos → Actualizar
  4. Eliminar: Botón "Eliminar" → Confirmar
  5. Verificar en cards: horas, descuento mensual, descuento anual

  ---

  ### 🎯 Requisito 3: Gestión de Tarifas Base (3 de 3 pts) ✅ COMPLETADO

  **Estado:** ✅ Implementado completamente

  - [x] RatesManagementComponent
  - [x] CRUD de tarifas base
  - [x] Configuración por sucursal
  - [x] Historial de cambios

  **Archivos creados:**
  - `rate.service.ts` (112 líneas) - 7 métodos HTTP
  - `rates-management.component.ts` (256 líneas) - Lógica completa
  - `rates-management.component.html` (600+ líneas) - 4 modales, tabla, cards
  - Ruta configurada: `/admin/rates`

  ---

  ### 🎯 Requisito 4: Validaciones de Descuentos (0 de 2 pts) ❌ NO IMPLEMENTABLE

  **Razón:** Backend NO tiene endpoints necesarios

  **Endpoints faltantes en backend:**
  ```
  ❌ POST /admin/subscription-plans/validate
    {
      hierarchy: number,
      discount_percentage: number,
      plan_id?: number
    }
    → Response: { is_valid, errors[], warnings[] }

  ❌ GET /admin/subscription-plans/hierarchy
    → Response: HierarchyRule[]
  ```

  **Nota:** Estas validaciones deben implementarse **primero en el backend** antes de poder crear la UI en frontend.

  ---

  ## 🗑️ ARCHIVOS ELIMINADOS (usaban endpoints falsos)

  ```
  ❌ discount-hierarchy.component.ts  → Usaba /hierarchy (no existe)
  ❌ discount-audit.component.ts      → Usaba /discount-history (no existe)
  ```

  ---

  ## 🔧 REFACTORIZACIÓN REALIZADA

  ### Problema Detectado:
  - ❌ Frontend llamaba endpoints inexistentes
  - ❌ DTOs no coincidían con backend
  - ❌ Componentes construidos sobre features no implementadas en backend

  ### Solución Aplicada:
  1. ✅ Revisión del backend real (`SubscriptionPlanController.java`)
  2. ✅ Actualización de todos los DTOs en `admin.service.ts`
  3. ✅ Reescritura completa de `subscription-plans.component.ts`
  4. ✅ Eliminación de componentes que usaban endpoints falsos
  5. ✅ Actualización de rutas (`admin.routes.ts`)
  6. ✅ Actualización del menú (`admin.layout.ts`)

  ### Archivos Modificados:
  ```
  ✅ admin.service.ts                   → DTOs corregidos, métodos falsos eliminados
  ✅ subscription-plans.component.ts    → Reescrito de 0 con endpoints reales
  ✅ admin.routes.ts                    → Rutas limpias (sin audit, sin rates)
  ✅ admin.layout.ts                    → Menú actualizado (5 ítems reales)
  ```

  ---

  ### Funcionalidades Implementadas:
  - [x] **Login Component** (`/login`)
    - Formulario con validación de email/password
    - Detección automática de 2FA requerido
    - Redirección por roles (Admin→/admin/dashboard, Operador→/branches/dashboard)
    - Manejo de errores con UI clara
    - Guard para protección de rutas

  - [x] **2FA (Two-Factor Authentication)** (`/verify-2fa`)
    - Verificación de código OTP
    - Habilitación de 2FA desde perfil
    - Deshabilitación de 2FA
    - QR code generation (backend)

  - [x] **Cambio de Contraseña** (`/change-password`)
    - Formulario con validación (actual, nueva, confirmar)
    - Forzar cambio en primer login
    - Actualización de estado en localStorage

  - [x] **Perfil de Usuario** (`/profile`)
    - Visualización de datos personales
    - Edición de información
    - Cambio de contraseña desde perfil

  - [x] **Recuperación de Contraseña** (AuthService)
    - Método `resetPassword(email)` implementado
    - Endpoint: `POST /auth/password/reset`

  ### Archivos Creados:
  ```
  src/app/auth/
  ├── auth.service.ts          (9 endpoints, 336 líneas)
  ├── auth.guard.ts            (Protección de rutas)
  ├── login.component.ts       (Login completo)
  ├── verify-2fa.component.ts  (2FA verification)
  ├── change-password.component.ts
  └── user-profile.component.ts
  ```

  ### Endpoints Backend Integrados:
  ```
  ✅ POST /auth/login
  ✅ POST /auth/logout
  ✅ POST /auth/refresh
  ✅ GET  /auth/profile
  ✅ POST /auth/2fa/enable
  ✅ POST /auth/2fa/verify
  ✅ POST /auth/2fa/disable
  ✅ POST /auth/password/reset
  ✅ POST /auth/password/change
  ```

  ---

  ## � MÓDULO 2: ADMINISTRACIÓN + REPORTES (24 pts) - 20% EN PROGRESO

  ### ✅ Completado (5 pts):
  - [x] **ReportService** (`admin/services/report.service.ts`)
    - 7 tipos de reportes implementados
    - Exportación a PDF, Excel e Imagen
    - 170 líneas de código

  - [x] **AdminService** (`admin/services/admin.service.ts`)
    - Gestión de tarifas (7 métodos)
    - Gestión de usuarios (6 métodos)
    - Gestión de comercios (6 métodos)
    - Gestión de planes de suscripción (5 métodos)
    - 450 líneas de código

  - [x] **ReportsComponent** (`admin/reports.component.ts`)
    - 3 tabs: Ocupación, Facturación, Suscripciones
    - Visualizaciones con cards y tablas
    - Botones de exportación PDF/Excel
    - Lazy loading por tab
    - 300 líneas de código

  ### ⏳ Pendiente (16 pts):
  - [x] **RatesManagementComponent** - Gestión de tarifas base y por sucursal (3 pts) ✅
  - [ ] **UsersManagementComponent** - CRUD de usuarios con paginación (5 pts)
  - [ ] **CommercesManagementComponent** - CRUD de comercios afiliados (5 pts)
  - [ ] **SubscriptionPlansComponent** - CRUD de planes de suscripción (4 pts)

  ### Endpoints Backend Documentados:

  #### 📊 Reportes (7 endpoints)
  ```
  ✅ GET  /reports/occupancy         → OccupancyReportItem[]
  ✅ GET  /reports/billing           → BillingReportItem[]
  ✅ GET  /reports/subscriptions     → SubscriptionReportItem[]
  ✅ GET  /reports/commerce-benefits → CommerceBenefitReportItem[]
  ✅ GET  /reports/cash-closing      → CashClosingItem[]
  ✅ GET  /reports/incidents         → IncidentReportItem[]
  ✅ GET  /reports/fleets            → FleetReportItem[]
  ✅ POST /reports/export            → Blob (PDF/Excel/Image)
  ```

  #### 💰 Tarifas (7 endpoints)
  ```
  ✅ GET    /rates/base              → CurrentRateResponse
  ✅ POST   /rates/base              → CreateBaseRateRequest
  ✅ GET    /rates/base/history      → List<RateHistoryItem>
  ✅ GET    /rates/branches          → List<BranchRateResponse>
  ✅ GET    /rates/branches/:id      → BranchRateResponse
  ✅ PUT    /rates/branches/:id      → UpdateBranchRateRequest
  ✅ DELETE /rates/branches/:id      → void
  ```

  #### 👥 Usuarios (6 endpoints)
  ```
  ✅ GET    /users?page&size&sortBy  → Page<UserResponse>
  ✅ POST   /users                   → CreateUserRequest
  ✅ GET    /users/:id               → UserResponse
  ✅ PUT    /users/:id               → UpdateUserRequest
  ✅ PATCH  /users/:id/status        → UpdateUserStatusRequest
  ✅ DELETE /users/:id               → void
  ```

  #### 🏪 Comercios (6 endpoints)
  ```
  ✅ GET    /commerces               → List<CommerceResponse>
  ✅ POST   /commerces               → CreateCommerceRequest
  ✅ GET    /commerces/:id           → CommerceResponse
  ✅ PUT    /commerces/:id           → UpdateCommerceRequest
  ✅ DELETE /commerces/:id           → void
  ✅ POST   /commerces/:id/benefits  → ConfigureBenefitRequest
  ✅ GET    /commerces/:id/benefits  → List<BenefitResponse>
  ```

  #### 💳 Planes de Suscripción (5 endpoints)
  ```
  ✅ GET    /subscription-plans      → List<SubscriptionPlanResponse>
  ✅ POST   /subscription-plans      → CreateSubscriptionPlanRequest
  ✅ GET    /subscription-plans/:id  → SubscriptionPlanResponse
  ✅ PUT    /subscription-plans/:id  → UpdateSubscriptionPlanRequest
  ✅ DELETE /subscription-plans/:id  → void
  ```

  ---

  ## ✅ INFRAESTRUCTURA COMPLETADA (BASE SÓLIDA)

  ---

  ## ✅ INFRAESTRUCTURA COMPLETADA (BASE SÓLIDA)

  ### Layouts y Navegación (7 pts)
  - [x] **6 Layouts por rol** con routing anidado
    - AdminLayout → `/admin/*`
    - BranchesLayout → `/branches/*`
    - BackOfficeLayout → `/backoffice/*`
    - ClientLayout → `/client/*`
    - CompanyLayout → `/company/*`
    - CommerceLayout → `/commerce/*`

  - [x] **TopNav Component** (`partials/navigation/topnav.component.ts`)
    - Avatar con iniciales del usuario
    - Dropdown: Ver Perfil, Cambiar Contraseña, Cerrar Sesión
    - Responsive mobile con hamburger menu

  - [x] **HTTP Interceptors**
    - `AuthInterceptor`: Inyecta token JWT en requests
    - `ErrorInterceptor`: Manejo global de errores HTTP

  ### Dashboards (3 pts)
  - [x] **DashboardService** con métricas en tiempo real
  - [x] **Admin Dashboard** con widgets de ocupación, ingresos, alertas
  - [x] **Branch Dashboard** con métricas por sucursal
  - [x] **Estados de carga** y manejo de errores con fallback

  ### Componentes Compartidos (9 componentes)
  - [x] Button (6 variantes, loading/disabled)
  - [x] Input (7 tipos, validación)
  - [x] Card, Table, Modal
  - [x] Badge, Spinner
  - [x] Toast + NotificationService

  ### Configuración
  - [x] **Environment variables** (dev/prod)
  - [x] **API base configuration**
  - [x] **Tailwind CSS** configurado
  - [x] **Routing con lazy loading**

  ---

  ## ⏳ MÓDULO 3: TICKETS + BRANCHES (10 pts) - PENDIENTE

  ### Core Business - Operaciones de Estacionamiento

  #### TicketService (2 pts)
  - [ ] Crear `branches/services/ticket.service.ts`
  - [ ] Métodos:
    - `getActiveTickets()` - GET /tickets/active
    - `createTicket(data)` - POST /tickets/
    - `registerExit(id)` - PATCH /tickets/{id}/exit
    - `calculateCharge(id)` - GET /tickets/{id}/calculate-charge
    - `searchByPlate(plate)` - GET /tickets/plate/{licensePlate}
    - `searchByFolio(folio)` - GET /tickets/folio/{folio}

  #### BranchService (1 pt)
  - [ ] Crear `branches/services/branch.service.ts`
  - [ ] Métodos:
    - `getAllBranches()` - GET /branches/
    - `getBranchById(id)` - GET /branches/{id}
    - `getOccupancy(id)` - GET /branches/{id}/occupancy
    - `getCapacity(id)` - GET /branches/{id}/capacity

  #### Componentes UI (7 pts)
  - [ ] **TicketEntryComponent** (2 pts)
    - Formulario: placa, sucursal, tipo vehículo
    - Validación de formato de placa
    - POST /tickets/

  - [ ] **TicketExitComponent** (3 pts)
    - Búsqueda por placa o folio
    - Cálculo automático de cobro
    - Confirmación de salida
    - PATCH /tickets/{id}/exit

  - [ ] **TicketListComponent** (2 pts)
    - Tabla con tickets activos
    - Paginación y búsqueda
    - Badge de estado

  ---

  ## ⏳ MÓDULO 4: SUSCRIPCIONES (14 pts) - PENDIENTE

  ### Funcionalidades Requeridas:

  #### Compra de Suscripciones (5 pts)
  - [ ] **SubscriptionPurchaseComponent**
    - Selección de plan
    - Calculadora de descuentos A-K
    - Simulación de pago online
    - Confirmación de compra

  #### Gestión de Suscripciones (4 pts)
  - [ ] **SubscriptionManagementComponent**
    - Lista de suscripciones activas
    - Renovación automática
    - Cancelación
    - Historial

  #### Descuentos y Antiabuso (5 pts)
  - [ ] **DiscountCalculator**
    - Validación de letra A-K
    - Cálculo de porcentaje de descuento
    - Límites de uso
    - Cooldown periods

  ---

  ## ⏳ MÓDULO 5: BACK OFFICE (10 pts) - PENDIENTE

  ### Funcionalidades Requeridas:

  #### Cambio de Placa (5 pts)
  - [ ] **PlateChangeRequestComponent**
    - Solicitud de cambio
    - Flujo de aprobación
    - Notificaciones

  #### Permisos Especiales (3 pts)
  - [ ] **SpecialPermitComponent**
    - Creación de permisos
    - Gestión de validez
    - Auditoría

  #### Control de Accesos (2 pts)
  - [ ] **AccessControlComponent**
    - Logs de acceso
    - Filtros y búsqueda

  ---

  ## ⏳ MÓDULO 6: COMERCIOS AFILIADOS (8 pts) - PENDIENTE

  ### Funcionalidades Requeridas:

  #### Aplicación de Beneficios (4 pts)
  - [ ] **BenefitApplicationComponent**
    - Aplicar horas gratis
    - Validación de comercio
    - Registro de transacción

  #### Liquidación (4 pts)
  - [ ] **CommerceLiquidationComponent**
    - Reporte de beneficios otorgados
    - Cálculo de comisiones
    - Exportación

  ---

  ## ⏳ MÓDULO 7: FLOTILLAS (7 pts) - PENDIENTE

  ### Diseño de Solución (7 pts)
  - [ ] **Documento de Diseño**
    - Arquitectura propuesta
    - Gestión de vehículos
    - Sistema de descuentos
    - Facturación consolidada
    - Reportes por flotilla

  ---

  ## 📋 PLAN DE TRABAJO ACTUALIZADO

  ### 🔥 HOY (Lunes 4/Nov) - 8 horas restantes
  **Objetivo:** Terminar Admin + Reportes (24 pts)

  #### Prioridad 1: Componentes Admin (6h)
  1. **RatesManagementComponent** (1.5h)
    - Formulario de tarifa base
    - Tabla de tarifas por sucursal
    - CRUD completo

  2. **UsersManagementComponent** (2h)
    - Tabla con paginación
    - Formulario de creación/edición
    - Toggle de estado activo/inactivo
    - Asignación de roles

  3. **CommercesManagementComponent** (1.5h)
    - CRUD de comercios
    - Configuración de beneficios (modal)
    - Tabla con filtros

  4. **SubscriptionPlansComponent** (1h)
    - CRUD de planes
    - Calculadora de descuentos
    - Vista de jerarquía

  #### Prioridad 2: Testing y Refinamiento (2h)
  - Probar todos los componentes admin
  - Verificar exportación de reportes
  - Ajustar UI/UX
  - Documentar

  **✅ Entregable Día 2:** Módulo Admin + Reportes 100% funcional (24/24 pts)

  ---

  ### 🎫 MARTES (5/Nov) - 8 horas
  **Objetivo:** Tickets + Branches (10 pts) + Inicio Suscripciones (14 pts)

  #### Morning (4h): Core Tickets
  - TicketService + BranchService (1h)
  - TicketEntryComponent (1.5h)
  - TicketExitComponent (1.5h)

  #### Afternoon (4h): Tickets + Suscripciones
  - TicketListComponent (1h)
  - SubscriptionPurchaseComponent (2h)
  - SubscriptionManagementComponent (1h)

  **✅ Entregable Día 3:** 
  - Tickets 100% (10 pts)
  - Suscripciones 50% (7 pts)
  - **Total acumulado: 41 pts**

  ---

  ### 🏁 MIÉRCOLES (6/Nov) - 8 horas
  **Objetivo:** Completar Suscripciones + Back Office + Comercios + Flotillas

  #### Morning (4h):
  - Terminar Suscripciones (2h) → 14 pts ✅
  - Back Office: Cambio Placa + Permisos (2h) → 10 pts ✅

  #### Afternoon (4h):
  - Comercios Afiliados (2h) → 8 pts ✅
  - Flotillas: Documento de diseño (2h) → 7 pts ✅

  **✅ Entregable Final:** 74 pts completos

  ---

  ## 🎯 MÉTRICAS DE PROGRESO

  ### Por Puntos:
  ```
  ✅ Seguridad:        5/5   pts (100%) ████████████████████
  ✅ Reportes:        12/12  pts (100%) ████████████████████
  ✅ Tickets:         10/10  pts (100%) ████████████████████
  🔄 Admin:            7/12  pts ( 58%) ███████████░░░░░░░░░
  ✅ Flotillas:        7/7   pts (100%) ████████████████████
  🔄 Suscripciones:    0/14  pts (  0%) ░░░░░░░░░░░░░░░░░░░░
  🔄 Back Office:      0/10  pts (  0%) ░░░░░░░░░░░░░░░░░░░░
  ⏳ Comercios App:    0/8   pts (  0%) ░░░░░░░░░░░░░░░░░░░░
                      ──────────────────
  TOTAL:              41/74  pts (55.4%)
  ```

  ### Por Tiempo:
  ```
  DÍA 1 (Ayer):     ✅ 100% - Infraestructura + Seguridad
  DÍA 2 (Hoy):      🔄  20% - Admin + Reportes en progreso
  DÍA 3 (Martes):   ⏳   0% - Tickets + Suscripciones
  DÍA 4 (Miércoles):⏳   0% - Back Office + Comercios + Flotillas
  ```

  ---

  ## 🛠️ ARCHIVOS CREADOS HASTA AHORA

  ### Auth Module (✅ Completo)
  ```
  src/app/auth/
  ├── auth.service.ts          (336 líneas, 9 endpoints)
  ├── auth.guard.ts
  ├── auth.interceptor.ts
  ├── login.component.ts       (Login + redirección por roles)
  ├── verify-2fa.component.ts  (Verificación 2FA)
  ├── change-password.component.ts
  └── user-profile.component.ts
  ```

  ### Admin Module (🔄 20% completo)
  ```
  src/app/admin/
  ├── services/
  │   ├── report.service.ts    (170 líneas, 7 reportes + export)
  │   └── admin.service.ts     (450 líneas, 30+ métodos)
  ├── reports.component.ts     (300 líneas, 3 tabs)
  └── admin.routes.ts
  ```

  ### Layouts (✅ Completo)
  ```
  src/app/
  ├── admin/admin.layout.ts
  ├── branches/branches.layout.ts
  ├── backoffice/backoffice.layout.ts
  ├── client/client.layout.ts
  ├── company/company.layout.ts
  ├── commerce/commerce.layout.ts
  └── partials/navigation/topnav.component.ts
  ```

  ### Shared Components (✅ Completo)
  ```
  src/app/shared/components/
  ├── button/button.component.ts
  ├── input/input.component.ts
  ├── card/card.component.ts
  ├── table/table.component.ts
  ├── modal/modal.component.ts
  ├── badge/badge.component.ts
  ├── spinner/spinner.component.ts
  └── toast/toast.component.ts
  ```

  ---

  ## 📊 ENDPOINTS BACKEND - ESTADO DE INTEGRACIÓN

  ### ✅ Autenticación (9/9) - 100%
  ```
  ✅ POST /auth/login
  ✅ POST /auth/logout
  ✅ POST /auth/refresh
  ✅ GET  /auth/profile
  ✅ POST /auth/2fa/enable
  ✅ POST /auth/2fa/verify
  ✅ POST /auth/2fa/disable
  ✅ POST /auth/password/reset
  ✅ POST /auth/password/change
  ```

  ### ✅ Dashboard (6/6) - 100%
  ```
  ✅ GET /dashboard/overview
  ✅ GET /dashboard/occupancy
  ✅ GET /dashboard/revenue
  ✅ GET /dashboard/active-subscriptions
  ✅ GET /dashboard/alerts
  ✅ GET /dashboard/by-branch/{branchId}
  ```

  ### ✅ Reportes (8/8) - 100%
  ```
  ✅ GET  /reports/occupancy
  ✅ GET  /reports/billing
  ✅ GET  /reports/subscriptions
  ✅ GET  /reports/commerce-benefits
  ✅ GET  /reports/cash-closing
  ✅ GET  /reports/incidents
  ✅ GET  /reports/fleets
  ✅ POST /reports/export
  ```

  ### ✅ Admin - Tarifas (7/7) - 100%
  ```
  ✅ GET    /rates/base
  ✅ POST   /rates/base
  ✅ GET    /rates/base/history
  ✅ GET    /rates/branches
  ✅ GET    /rates/branches/:id
  ✅ PUT    /rates/branches/:id
  ✅ DELETE /rates/branches/:id
  ```

  ### ✅ Admin - Usuarios (6/6) - 100%
  ```
  ✅ GET    /users?page&size
  ✅ POST   /users
  ✅ GET    /users/:id
  ✅ PUT    /users/:id
  ✅ PATCH  /users/:id/status
  ✅ DELETE /users/:id
  ```

  ### ✅ Admin - Comercios (7/7) - 100%
  ```
  ✅ GET    /commerces
  ✅ POST   /commerces
  ✅ GET    /commerces/:id
  ✅ PUT    /commerces/:id
  ✅ DELETE /commerces/:id
  ✅ POST   /commerces/:id/benefits
  ✅ GET    /commerces/:id/benefits
  ```

  ### ✅ Admin - Planes (5/5) - 100%
  ```
  ✅ GET    /subscription-plans
  ✅ POST   /subscription-plans
  ✅ GET    /subscription-plans/:id
  ✅ PUT    /subscription-plans/:id
  ✅ DELETE /subscription-plans/:id
  ```

  ### ⏳ Tickets (0/8) - Pendiente
  ```
  ⏳ GET    /tickets/active
  ⏳ GET    /tickets/{id}
  ⏳ POST   /tickets/
  ⏳ PATCH  /tickets/{id}/exit
  ⏳ GET    /tickets/{id}/calculate-charge
  ⏳ GET    /tickets/plate/{plate}
  ⏳ GET    /tickets/folio/{folio}
  ⏳ GET    /tickets/branch/{branchId}
  ```

  ### ⏳ Branches (0/5) - Pendiente
  ```
  ⏳ GET /branches/
  ⏳ GET /branches/{id}
  ⏳ GET /branches/{id}/occupancy
  ⏳ GET /branches/{id}/capacity
  ⏳ GET /branches/{id}/schedule
  ```

  ---

  ## 🚀 COMANDOS ÚTILES

  ```bash
  # Desarrollo
  npm start                    # Inicia dev server en :4200

  # Build
  npm run build                # Build para producción
  npm run build -- --configuration development  # Build dev

  # Testing
  npm test                     # Ejecutar tests
  npm run test:coverage        # Tests con cobertura

  # Linting
  npm run lint                 # Verificar código

  # Backend (si aplica)
  # MariaDB: localhost:3306
  # Redis: localhost:6379
  # API: localhost:8080/api/v1
  # Swagger: localhost:8080/api/v1/swagger-ui/index.html
  ```

  ---

  ## 📝 NOTAS TÉCNICAS

  ### Convenciones de Código:
  - **Componentes:** PascalCase → `TicketEntryComponent`
  - **Servicios:** camelCase.service.ts → `ticket.service.ts`
  - **Interfaces:** PascalCase → `Ticket`, `BillingReportItem`
  - **Signals:** camelCase → `isLoading()`, `activeTab()`

  ### Estructura de Archivos:
  ```
  module/
  ├── services/
  │   └── module.service.ts
  ├── components/
  │   └── feature.component.ts
  ├── models/
  │   └── interface.ts
  └── module.routes.ts
  ```

  ### Git Commits:
  ```
  feat(module): add feature description
  fix(module): fix bug description
  refactor(module): refactor description
  docs(module): update documentation
  ```

  ---

  ## ✅ VERIFICACIONES COMPLETADAS (Hoy)

  1. ✅ **Login, 2FA y Recuperación:**
    - LoginComponent funciona correctamente
    - 2FA habilitación/deshabilitación implementada
    - Recuperación de contraseña con `resetPassword()` en AuthService
    - Todos los componentes compilan sin errores

  2. ✅ **Reportes con Endpoints Correctos:**
    - ReportService mapea los 7 endpoints de la imagen
    - Exportación a PDF, Excel e Imagen implementada
    - Método `downloadFile()` para triggers de descarga
    - ReportsComponent con 3 tabs y visualizaciones

  3. ✅ **Build Exitoso:**
    - Compilación sin errores
    - 1.67 MB bundle size (initial)
    - 23 rutas pre-renderizadas
    - Lazy loading funcionando

  ---

  **Generado:** 5 de Noviembre, 2025 - 2:00 PM  
  **Versión:** 4.0.0 - Flotillas completado  
  **Estado:** 🎯 55.4% completado (41/74 pts)  
  **Próximo Hito:** Testing + Integración Backend
  6. ✅ Ver ocupación de sucursales en dashboard
  7. ✅ Generar reporte diario básico
  8. ✅ Hacer logout

  ---

  ## ⚡ QUICK START

  ```bash
  # Día 1: Infraestructura
  npm install lucide-angular date-fns
  npm start

  # Abrir en navegador
  http://localhost:4200

  # Login de prueba
  Email: op.plaza@parkcontrol.com
  Password: Password123$
  ```

  ---

  ## 📊 PROGRESO ACTUALIZADO

  ```
  ✅ Base (20%):           COMPLETO
  ⏳ Día 1 - Layout:       0% → 100% (HOY)
  ⏳ Día 2 - Tickets:      0% → 100% (MAÑANA)
  ⏳ Día 3 - Dashboard:    0% → 100% (PASADO MAÑANA)

  MVP FUNCIONAL: 3 DÍAS
  ```

  ---

  **Generado:** 3 de Noviembre, 2025 - 10:35 AM  
  **Versión:** 2.0.0 - MVP de 3 días  
  **Prioridad:** 🔴🔴🔴 ULTRA ALTA
