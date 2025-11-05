import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CardComponent } from '../shared/components/card.component';
import { ButtonComponent } from '../shared/components/button.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Bienvenido, {{ currentUser?.full_name }}
          </h1>
          <p class="text-gray-600">
            Rol: <span class="font-semibold">{{ getRoleLabel(currentUser?.role) }}</span>
          </p>
        </div>

        <!-- Quick Actions by Role -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @if (currentUser?.role === 'ADMIN') {
            <app-card title="Panel de Administración" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Gestiona usuarios, sucursales y configuraciones del sistema</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/admin/dashboard']"
                  class="w-full">
                  Ir al Panel Admin
                </app-button>
              </div>
            </app-card>

            <app-card title="Reportes y Analytics" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Visualiza reportes y métricas del sistema</p>
                <app-button 
                  variant="secondary" 
                  [routerLink]="['/reports']"
                  class="w-full">
                  Ver Reportes
                </app-button>
              </div>
            </app-card>

            <app-card title="Gestión de Sucursales" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Administra sucursales, tarifas y capacidad</p>
                <app-button 
                  variant="success" 
                  [routerLink]="['/branches/dashboard']"
                  class="w-full">
                  Gestionar Sucursales
                </app-button>
              </div>
            </app-card>
          }

          @if (currentUser?.role === 'BRANCH_OPERATOR') {
            <app-card title="Operaciones de Tickets" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Registra entradas y salidas de vehículos</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/branches/dashboard']"
                  class="w-full">
                  Ir a Tickets
                </app-button>
              </div>
            </app-card>

            <app-card title="Tickets Activos" [hoverable]="true">
              <div class="space-y-3">
                <div class="text-center py-4">
                  <div class="text-5xl font-bold text-blue-600">--</div>
                  <p class="text-gray-600 mt-2">Tickets en tu sucursal</p>
                </div>
              </div>
            </app-card>

            <app-card title="Ocupación Actual" [hoverable]="true">
              <div class="space-y-3">
                <div class="text-center py-4">
                  <div class="text-5xl font-bold text-green-600">--%</div>
                  <p class="text-gray-600 mt-2">Capacidad utilizada</p>
                </div>
              </div>
            </app-card>
          }

          @if (currentUser?.role === 'BACK_OFFICE') {
            <app-card title="Validaciones Pendientes" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Revisa y aprueba validaciones</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/backoffice/dashboard']"
                  class="w-full">
                  Ir a Validaciones
                </app-button>
              </div>
            </app-card>
          }

          @if (currentUser?.role === 'CLIENT') {
            <app-card title="Mis Suscripciones" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Gestiona tus planes y suscripciones</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/client/dashboard']"
                  class="w-full">
                  Ver Suscripciones
                </app-button>
              </div>
            </app-card>
          }

          @if (currentUser?.role === 'COMPANY') {
            <app-card title="Gestión de Flotilla" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Administra tu flotilla corporativa</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/company/dashboard']"
                  class="w-full">
                  Ver Flotilla
                </app-button>
              </div>
            </app-card>
          }

          @if (currentUser?.role === 'COMMERCE') {
            <app-card title="Liquidaciones" [hoverable]="true">
              <div class="space-y-3">
                <p class="text-gray-600 mb-4">Consulta liquidaciones y beneficios</p>
                <app-button 
                  variant="primary" 
                  [routerLink]="['/commerce/dashboard']"
                  class="w-full">
                  Ver Liquidaciones
                </app-button>
              </div>
            </app-card>
          }

          <!-- Common Actions -->
          <app-card title="Mi Perfil" [hoverable]="true">
            <div class="space-y-3">
              <p class="text-gray-600 mb-4">Actualiza tu información personal</p>
              <app-button 
                variant="ghost" 
                [routerLink]="['/profile']"
                class="w-full">
                Ver Perfil
              </app-button>
            </div>
          </app-card>

          <app-card title="Cerrar Sesión" [hoverable]="true">
            <div class="space-y-3">
              <p class="text-gray-600 mb-4">Salir del sistema de forma segura</p>
              <app-button 
                variant="danger" 
                (click)="logout()"
                class="w-full">
                Cerrar Sesión
              </app-button>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser();

  ngOnInit() {
    // Si no hay usuario, redirigir a login
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  getRoleLabel(role: string | undefined): string {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'BRANCH_OPERATOR': 'Operador de Sucursal',
      'BACK_OFFICE': 'Back Office',
      'CLIENT': 'Cliente',
      'COMPANY': 'Empresa',
      'COMMERCE': 'Comercio'
    };
    return role ? roleMap[role] || role : 'Desconocido';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
