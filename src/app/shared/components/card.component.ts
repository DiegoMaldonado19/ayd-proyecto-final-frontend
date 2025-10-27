import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-card',
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (title() || actions()) {
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          @if (title()) {
            <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
          }
          @if (actions()) {
            <div class="flex gap-2">
              <ng-content select="[actions]"></ng-content>
            </div>
          }
        </div>
      }
      
      <div [class]="bodyClasses()">
        <ng-content></ng-content>
      </div>
      
      @if (footer()) {
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  title = input<string>('');
  actions = input<boolean>(false);
  footer = input<boolean>(false);
  noPadding = input<boolean>(false);
  hoverable = input<boolean>(false);

  cardClasses(): string {
    const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
    const hoverClasses = this.hoverable() ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : '';
    return `${baseClasses} ${hoverClasses}`;
  }

  bodyClasses(): string {
    return this.noPadding() ? '' : 'px-6 py-4';
  }
}
