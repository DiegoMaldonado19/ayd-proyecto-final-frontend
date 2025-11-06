import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-backoffice-dashboard',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-surface-900 p-6">
      <h1 class="text-3xl font-bold mb-6">Backoffice Dashboard</h1>
      
    </div>
  `,
})
export class BackofficeDashboardComponent {
  
}
