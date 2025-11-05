import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AdminService, UserResponse, PageResponse } from './services/admin.service';

/**
 * Componente para gestión de usuarios del sistema
 * Permite CRUD completo de usuarios con paginación y filtros
 */
@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p class="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        
        <button
          (click)="showCreateModal.set(true)"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Buscar por email o nombre..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              [(ngModel)]="filterRole"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operador</option>
              <option value="CLIENT">Cliente</option>
              <option value="COMMERCE">Comercio</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              [(ngModel)]="filterStatus"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else if (users().length === 0) {
          <div class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <p>No se encontraron usuarios</p>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.first_name }} {{ user.last_name }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                      @if (user.phone) {
                        <div class="text-xs text-gray-400">📞 {{ user.phone }}</div>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class]="getRoleBadgeClass(user.role_name)">
                      {{ user.role_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button
                      (click)="toggleUserStatus(user)"
                      class="inline-flex items-center"
                    >
                      @if (user.is_active) {
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      } @else {
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      }
                    </button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    @if (user.has_2fa_enabled) {
                      <span class="text-green-600">✓ Habilitado</span>
                    } @else {
                      <span class="text-gray-400">✗ Deshabilitado</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="editUser(user)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      (click)="openDeleteModal(user)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ (currentPage() * pageSize()) + 1 }}</span>
              a <span class="font-medium">{{ Math.min((currentPage() + 1) * pageSize(), totalElements()) }}</span>
              de <span class="font-medium">{{ totalElements() }}</span> usuarios
            </div>
            <div class="flex gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 0"
                class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages() - 1"
                class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Create/Edit Modal -->
      @if (showCreateModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ showCreateModal() ? 'Nuevo Usuario' : 'Editar Usuario' }}
              </h3>

              <form [formGroup]="userForm" (ngSubmit)="saveUser()">
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        formControlName="first_name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Juan"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        formControlName="last_name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pérez"
                      >
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      formControlName="email"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="juan@example.com"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      formControlName="phone"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50012345678"
                    >
                    <p class="text-xs text-gray-500 mt-1">8-15 dígitos (opcional)</p>
                  </div>

                  @if (showCreateModal()) {
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        formControlName="password"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      >
                    </div>
                  }

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      formControlName="role_type_id"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="1">Admin</option>
                      <option value="2">Operador</option>
                      <option value="3">Cliente</option>
                      <option value="4">Comercio</option>
                    </select>
                  </div>
                </div>

                @if (errorMessage()) {
                  <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                  </div>
                }

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="userForm.invalid || saving()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ saving() ? 'Guardando...' : (showCreateModal() ? 'Crear' : 'Actualizar') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-red-600 mb-4">
                Eliminar Usuario
              </h3>

              <p class="text-gray-700 mb-2">
                ¿Estás seguro de eliminar al usuario 
                <strong>{{ editingUser()?.first_name }} {{ editingUser()?.last_name }}</strong>?
              </p>
              <p class="text-sm text-gray-600 mb-6">
                Email: <strong>{{ editingUser()?.email }}</strong><br>
                Esta acción no se puede deshacer.
              </p>

              @if (errorMessage()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                </div>
              }

              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeDeleteModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmDelete()"
                  [disabled]="saving()"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ saving() ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  Math = Math;
  
  users = signal<UserResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  
  // Pagination
  currentPage = signal(0);
  pageSize = signal(20);
  totalPages = signal(0);
  totalElements = signal(0);

  // Filters
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  // Modals
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  editingUser = signal<UserResponse | null>(null);

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role_type_id: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      const response = await this.adminService.listUsers(
        this.currentPage(),
        this.pageSize()
      );
      
      this.users.set(response.content);
      this.totalPages.set(response.total_pages);
      this.totalElements.set(response.total_elements);
    } catch (error) {
      console.error('Error loading users:', error);
      this.errorMessage.set('Error al cargar usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch() {
    // TODO: Implement search
    console.log('Search:', this.searchTerm);
  }

  applyFilters() {
    // TODO: Implement filters
    console.log('Filters:', this.filterRole, this.filterStatus);
    this.loadUsers();
  }

  async nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      await this.loadUsers();
    }
  }

  async previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      await this.loadUsers();
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'OPERATOR':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      case 'COMMERCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async toggleUserStatus(user: UserResponse) {
    try {
      await this.adminService.updateUserStatus(user.id, {
        is_active: !user.is_active
      });
      await this.loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      this.errorMessage.set('Error al cambiar estado del usuario');
    }
  }

  editUser(user: UserResponse) {
    this.editingUser.set(user);
    this.userForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role_type_id: user.role_type_id
    });
    // Remove password requirement for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showEditModal.set(true);
  }

  openDeleteModal(user: UserResponse) {
    this.editingUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.editingUser.set(null);
  }

  async confirmDelete() {
    const user = this.editingUser();
    if (!user) return;

    this.saving.set(true);
    try {
      await this.adminService.deleteUser(user.id);
      this.closeDeleteModal();
      await this.loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.errorMessage.set(error.error?.message || 'Error al eliminar usuario');
    } finally {
      this.saving.set(false);
    }
  }

  async saveUser() {
    if (this.userForm.invalid) return;

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.userForm.value;
      
      // Remove empty phone
      if (!formValue.phone) {
        delete formValue.phone;
      }
      
      if (this.showCreateModal()) {
        await this.adminService.createUser(formValue);
      } else if (this.editingUser()) {
        const { password, ...updateData } = formValue;
        await this.adminService.updateUser(this.editingUser()!.id, updateData);
      }

      this.closeModal();
      await this.loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      this.errorMessage.set(error.error?.message || 'Error al guardar usuario');
    } finally {
      this.saving.set(false);
    }
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
    this.errorMessage.set('');
    
    // Restore password requirement
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }
}
