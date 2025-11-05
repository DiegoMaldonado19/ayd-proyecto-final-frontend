import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../shared/components/card.component';
import { ButtonComponent } from '../shared/components/button.component';
import { BadgeComponent } from '../shared/components/badge.component';

@Component({
  standalone: true,
  selector: 'app-branches-dashboard',
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Operaciones de Sucursal</h1>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <app-card title="Tickets Activos">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-blue-600">5</div>
            <p class="text-gray-600 mt-2 text-sm">Vehículos en sucursal</p>
          </div>
        </app-card>

        <app-card title="Ocupación">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-green-600">62%</div>
            <p class="text-gray-600 mt-2 text-sm">31 de 50 espacios</p>
          </div>
        </app-card>

        <app-card title="Ingresos Hoy">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-yellow-600">$850</div>
            <p class="text-gray-600 mt-2 text-sm">12 cobros realizados</p>
          </div>
        </app-card>

        <app-card title="Tiempo Promedio">
          <div class="text-center py-4">
            <div class="text-4xl font-bold text-purple-600">3.5h</div>
            <p class="text-gray-600 mt-2 text-sm">Estancia promedio</p>
          </div>
        </app-card>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <app-card title="Registrar Entrada">
          <div class="space-y-4">
            <p class="text-gray-600">Registra la entrada de un vehículo a la sucursal</p>
            <app-button variant="primary" class="w-full">
              Nueva Entrada
            </app-button>
          </div>
        </app-card>

        <app-card title="Registrar Salida">
          <div class="space-y-4">
            <p class="text-gray-600">Procesa la salida y cobro de un vehículo</p>
            <app-button variant="success" class="w-full">
              Nueva Salida
            </app-button>
          </div>
        </app-card>
      </div>

      <!-- Active Tickets Table -->
      <app-card title="Tickets Activos en Sucursal">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Folio</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Placa</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Tipo</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Entrada</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Tiempo</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Estado</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-800 font-mono">#001</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">ABC-1234</td>
                <td class="px-4 py-3 text-sm text-gray-600">SEDÁN</td>
                <td class="px-4 py-3 text-sm text-gray-600">10:30 AM</td>
                <td class="px-4 py-3 text-sm text-gray-600">2h 15m</td>
                <td class="px-4 py-3">
                  <app-badge variant="success">Activo</app-badge>
                </td>
                <td class="px-4 py-3">
                  <app-button variant="secondary" size="sm">Registrar Salida</app-button>
                </td>
              </tr>

              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-800 font-mono">#002</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">XYZ-5678</td>
                <td class="px-4 py-3 text-sm text-gray-600">SUV</td>
                <td class="px-4 py-3 text-sm text-gray-600">11:00 AM</td>
                <td class="px-4 py-3 text-sm text-gray-600">1h 45m</td>
                <td class="px-4 py-3">
                  <app-badge variant="success">Activo</app-badge>
                </td>
                <td class="px-4 py-3">
                  <app-button variant="secondary" size="sm">Registrar Salida</app-button>
                </td>
              </tr>

              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-800 font-mono">#003</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">LMN-9012</td>
                <td class="px-4 py-3 text-sm text-gray-600">PICKUP</td>
                <td class="px-4 py-3 text-sm text-gray-600">09:15 AM</td>
                <td class="px-4 py-3 text-sm text-gray-600">3h 30m</td>
                <td class="px-4 py-3">
                  <app-badge variant="warning">Prolongado</app-badge>
                </td>
                <td class="px-4 py-3">
                  <app-button variant="secondary" size="sm">Registrar Salida</app-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <p class="text-sm text-gray-600">Mostrando 3 tickets activos</p>
          <div class="flex gap-2">
            <app-button variant="ghost" size="sm">Ver Histórico</app-button>
            <app-button variant="secondary" size="sm" [routerLink]="['/tickets']">
              Ver Todos los Tickets
            </app-button>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class BranchesDashboardComponent {}
