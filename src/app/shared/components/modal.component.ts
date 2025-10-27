import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" (click)="handleBackdropClick($event)">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            class="relative bg-white rounded-lg shadow-xl max-w-lg w-full transform transition-all"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            @if (title() || showClose()) {
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                @if (title()) {
                  <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
                }
                @if (showClose()) {
                  <button
                    type="button"
                    (click)="close()"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            }
            
            <!-- Body -->
            <div class="px-6 py-4">
              <ng-content></ng-content>
            </div>
            
            <!-- Footer -->
            @if (footer()) {
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                <ng-content select="[footer]"></ng-content>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  footer = input<boolean>(false);
  showClose = input<boolean>(true);
  closeOnBackdrop = input<boolean>(true);
  
  closed = output<void>();

  handleBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }
}
