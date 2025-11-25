import { Component, Input, AfterViewInit, ElementRef, ViewChild, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'ng-table-fixed',
  template: `
    <div class="ng-table-fixed-wrapper" #tableContainer>
      <!-- Fixed Columns -->
      <div class="fixed-table-container" [style.maxHeight]="maxHeight">
        <table class="fixed-table">
          <ng-container *ngIf="fixedContentTemplate; else defaultFixedContent">
            <ng-container *ngTemplateOutlet="fixedContentTemplate;"></ng-container>
          </ng-container>
          <ng-template #defaultFixedContent>
            <ng-content select="[fixedContent]"></ng-content>
          </ng-template>
        </table>
      </div>

      <!-- Scrollable Columns -->
      <div class="scrollable-table-container" [style.maxHeight]="maxHeight" #scrollableTable>
        <table class="scrollable-table">
          <ng-container *ngIf="scrollableContentTemplate; else defaultScrollableContent">
            <ng-container *ngTemplateOutlet="scrollableContentTemplate;"></ng-container>
          </ng-container>
          <ng-template #defaultScrollableContent>
            <ng-content select="[scrollableContent]"></ng-content>
          </ng-template>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .ng-table-fixed-wrapper {
      display: flex;
      position: relative;
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .fixed-table-container {
      position: sticky;
      left: 0;
      z-index: 2;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 3px 0 6px rgba(0, 0, 0, 0.1);
      background-color: white;
      width: auto;
    }

    .scrollable-table-container {
      flex: 1;
      overflow: auto;
      background-color: white;
      white-space: nowrap;
    }

    table.fixed-table, table.scrollable-table {
      border-collapse: collapse;
      width: 100%;
    }

    table.fixed-table th, table.scrollable-table th {
      position: sticky;
      top: 0;
      background-color: #f5f5f5;
      z-index: 1;
    }

    .fixed-table th {
      z-index: 3;
    }

    th, td {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    /* Synchronizing Scrollbars */
    .scrollable-table-container::-webkit-scrollbar {
      height: 8px;
    }
    
    .scrollable-table-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .scrollable-table-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .scrollable-table-container::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class NgTableFixedComponent implements AfterViewInit {
  @Input() maxHeight: string = '400px';

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild('scrollableTable') scrollableTable!: ElementRef;

  @ContentChild('fixedContent') fixedContentTemplate!: TemplateRef<any>;
  @ContentChild('scrollableContent') scrollableContentTemplate!: TemplateRef<any>;

  ngAfterViewInit(): void {
    this.synchronizeScroll();
    this.synchronizeRowHeights();
    
    setTimeout(() => {
      this.synchronizeRowHeights();
    }, 100);
  }

  synchronizeScroll(): void {
    if (!this.tableContainer || !this.scrollableTable) return;

    const fixedTableBody = this.tableContainer.nativeElement.querySelector('.fixed-table-container');
    const scrollableTableBody = this.scrollableTable.nativeElement;

    if (fixedTableBody && scrollableTableBody) {
      scrollableTableBody.addEventListener('scroll', (e: Event) => {
        fixedTableBody.scrollTop = (e.target as HTMLElement).scrollTop;
      });

      fixedTableBody.addEventListener('scroll', (e: Event) => {
        scrollableTableBody.scrollTop = (e.target as HTMLElement).scrollTop;
      });
    }
  }

  synchronizeRowHeights(): void {
    if (!this.tableContainer) return;

    const fixedRows = this.tableContainer.nativeElement.querySelectorAll('.fixed-table tbody tr');
    const scrollableRows = this.tableContainer.nativeElement.querySelectorAll('.scrollable-table tbody tr');

    if (fixedRows.length === scrollableRows.length) {
      for (let i = 0; i < fixedRows.length; i++) {
        const fixedHeight = fixedRows[i].getBoundingClientRect().height;
        const scrollableHeight = scrollableRows[i].getBoundingClientRect().height;
        const maxHeight = Math.max(fixedHeight, scrollableHeight);

        fixedRows[i].style.height = `${maxHeight}px`;
        scrollableRows[i].style.height = `${maxHeight}px`;
      }
    }
  }
}
