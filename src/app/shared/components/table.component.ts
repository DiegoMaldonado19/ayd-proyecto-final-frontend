import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [CommonModule],
  template: `
    <div class="border border-gray-200 rounded-lg bg-white">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th *ngFor="let column of columns" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngIf="loading">
            <td [attr.colspan]="columns.length" class="px-6 py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </td>
          </tr>
          <tr *ngIf="!loading && data.length === 0">
            <td [attr.colspan]="columns.length" class="px-6 py-12 text-center text-gray-500">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr *ngFor="let row of data" class="hover:bg-gray-50">
            <td *ngFor="let column of columns" class="px-6 py-4 text-sm text-gray-900">
              {{ row[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="totalItems > 0" class="px-4 py-3 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ getStartItem() }} a {{ getEndItem() }} de {{ totalItems }}
          </div>
          <div class="flex gap-2">
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Anterior
            </button>
            <span class="px-3 py-1 text-sm">Página {{ currentPage }} de {{ getTotalPages() }}</span>
            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage >= getTotalPages()"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() totalItems: number = 0;
  @Input() emptyMessage: string = 'No hay datos';

  @Output() pageChanged = new EventEmitter<number>();

  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.pageChanged.emit(page);
    }
  }
}
