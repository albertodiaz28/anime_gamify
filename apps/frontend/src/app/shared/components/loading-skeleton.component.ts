import { Component, Input } from '@angular/core';

@Component({
  selector: 'ag-loading-skeleton',
  standalone: true,
  template: `
    <div
      class="ag-skeleton"
      [style.height]="height"
      [style.width]="width"
      [style.border-radius]="radius"
    ></div>
  `,
  styles: [
    `
      .ag-skeleton {
        display: block;
        background: linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
        background-size: 200% 100%;
        animation: ag-skeleton-pulse 1.4s ease-in-out infinite;
      }
      @keyframes ag-skeleton-pulse {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() height = '1rem';
  @Input() width = '100%';
  @Input() radius = '4px';
}
