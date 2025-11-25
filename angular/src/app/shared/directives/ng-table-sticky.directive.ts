import { Directive, ElementRef, Input, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ngTableSticky]'
})
export class NgTableStickyDirective implements AfterViewInit {

  @Input() stickyColumns: number = 2; // Default: 2 sticky columns
  @Input() columnWidths: number[] = []; // Widths of columns

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const table = this.el.nativeElement as HTMLTableElement;
    
    if (!table) return;

    // Apply sticky styles to headers
    const headers = table.querySelectorAll('thead th');
    headers.forEach(th => {
      this.renderer.setStyle(th, 'position', 'sticky');
      this.renderer.setStyle(th, 'top', '0');
      this.renderer.setStyle(th, 'background-color', '#f2f2f2');
      this.renderer.setStyle(th, 'z-index', '2');
    });

    // Apply sticky & width styles for first N columns
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.children;

      for (let i = 0; i < this.stickyColumns; i++) {
        if (cells[i]) {
          this.renderer.setStyle(cells[i], 'position', 'sticky');
          this.renderer.setStyle(cells[i], 'left', this.getLeftOffset(i) + 'px');
          this.renderer.setStyle(cells[i], 'z-index', '3');
          this.renderer.setStyle(cells[i], 'background-color', 'white');

          // Apply width if provided
          if (this.columnWidths[i]) {
            this.renderer.setStyle(cells[i], 'min-width', this.columnWidths[i] + 'px');
            this.renderer.setStyle(cells[i], 'max-width', this.columnWidths[i] + 'px');
          }
        }
      }
    });
  }

  /** ✅ Calculate left offset for sticky columns */
  private getLeftOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.columnWidths[i] || 100; // Default width if not provided
    }
    return offset;
  }
}
