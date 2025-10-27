import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';

@Component({
  standalone: true,
  selector: 'app-input',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="id()" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      
      <div class="relative">
        @if (icon()) {
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500">{{ icon() }}</span>
          </div>
        }
        
        <input
          [id]="id()"
          [type]="type()"
          [name]="name()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [readonly]="readonly()"
          [(ngModel)]="value"
          (blur)="onBlur()"
          [class]="inputClasses()"
        />
      </div>
      
      @if (error()) {
        <p class="mt-1 text-sm text-red-600">{{ error() }}</p>
      }
      
      @if (hint() && !error()) {
        <p class="mt-1 text-sm text-gray-500">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [`
    input {
      @apply w-full rounded-lg border transition-colors duration-200;
      @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
      @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
    }
  `]
})
export class InputComponent {
  id = input<string>('input-' + Math.random().toString(36).substr(2, 9));
  type = input<InputType>('text');
  name = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  hint = input<string>('');
  error = input<string>('');
  icon = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  readonly = input<boolean>(false);
  
  value = model<string>('');
  blurred = output<void>();

  onBlur() {
    this.blurred.emit();
  }

  inputClasses(): string {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200';
    const iconPadding = this.icon() ? 'pl-10' : '';
    const errorBorder = this.error() ? 'border-red-500' : 'border-gray-300';
    
    return `${baseClasses} ${iconPadding} ${errorBorder}`;
  }
}
