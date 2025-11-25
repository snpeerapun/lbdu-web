import { 
  Component, Input, Output, EventEmitter, OnInit, TemplateRef, QueryList, ContentChildren, AfterContentInit, Signal, signal 
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { NgTableColumn, NgTableFormat } from './ng-table.inferface';

@Component({
  selector: 'ng-table',
  templateUrl: './ng-table.component.html',
  styleUrls: ['./ng-table.component.css']
})
export class NgTableComponent implements OnInit, AfterContentInit {
  @Input() columns: NgTableColumn[] = [];
  @Input() defaultSortColumn: string = '';
  @Input() defaultSortDirection: 'asc' | 'desc' = 'asc';
  @Input() allowFilter: boolean = true;
  @Input() allowCheckbox: boolean = false;
  @Input() allowPaging: boolean = true;
  @Input() allowExport: boolean = false; // เพิ่มเพื่อควบคุมการแสดงปุ่ม Export
  @Input() pageSize: number = 10;
  
  @Output() selectRow = new EventEmitter<any>();
  @Output() checkedItemsChange = new EventEmitter<any[]>();
  @Output() onExport = new EventEmitter<any>(); // เพิ่ม event สำหรับ Export

  @Input() datasource!: (params: any) => Observable<{ data: any[], total?: number, columns?: string[] }>;

  @ContentChildren(TemplateRef, { descendants: true }) templates!: QueryList<TemplateRef<any>>;

  data = signal<any[]>([]);
  currentPage = signal(1);
  totalItems = signal(0);
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  private _filterText = '';
  filterText = signal('');
  checkedItems = signal<Set<any>>(new Set());
  templateMap: Record<string, TemplateRef<any>> = {};

  Math = Math;
  dateFormat: string = 'yyyy-MM-dd';
  dateTimeFormat: string = 'yyyy-MM-dd HH:mm';

  constructor(private http: HttpClient) {
    // Ensure checkedItems is always initialized
    if (!this.checkedItems()) {
      this.checkedItems.set(new Set());
    }
  }

  ngOnInit() {
    this.sortColumn.set(this.defaultSortColumn || (this.columns[0]?.name ?? ''));
    this.sortDirection.set(this.defaultSortDirection || 'asc');
    this.loadData();
  }

  ngAfterContentInit() {
    this.templates.forEach((template: TemplateRef<any>) => {
      const elementRef = (template as any)._declarationTContainer;
      if (elementRef?.localNames?.[0]) {
        this.templateMap[elementRef.localNames[0]] = template;
      }
    });
  }

  private emitCheckedItems(): void {
    const items = this.checkedItems();
    this.checkedItemsChange.emit(items ? Array.from(items) : []);
  }

  filter() {
    this.currentPage.set(1);
    this.loadData();
  }

  refresh() {
    this.data.set([]);
    this.loadData();
  }

  // เพิ่มฟังก์ชัน Export
  export() {
    this.onExport.emit();
  }

  isAllChecked(): boolean {
    const items = this.checkedItems();
    const dataLength = this.data()?.length || 0;
    return dataLength > 0 && items && items.size === dataLength;
  }

  onCheckAllChange(checked: boolean): void {
    const newCheckedItems = new Set(this.checkedItems() || new Set());
    if (checked) {
      this.data()?.forEach(item => newCheckedItems.add(item));
    } else {
      newCheckedItems.clear();
    }
    this.checkedItems.set(newCheckedItems);
    this.emitCheckedItems();
  }

  onItemCheckChange(item: any, checked: boolean): void {
    const newCheckedItems = new Set(this.checkedItems() || new Set());
    if (checked) {
      newCheckedItems.add(item);
    } else {
      newCheckedItems.delete(item);
    }
    this.checkedItems.set(newCheckedItems);
    this.emitCheckedItems();
  }

  formatValue(value: any, format?: NgTableFormat): string {
    if (value === undefined || value === null) return '';

    switch (format) {
      case NgTableFormat.DateTime:
        
        return formatDate(value, this.dateTimeFormat, 'en-US')
      case NgTableFormat.Date:
        return formatDate(value, this.dateFormat, 'en-US')
      case NgTableFormat.Number:
        return typeof value === 'number' ? new Intl.NumberFormat('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).format(value) : '';
      case NgTableFormat.Masking:
        return typeof value === 'string' ? value.replace(/\d(?=\d{4})/g, "*") : '';
      default:
        return String(value);
    }
  }

  get filterTextValue(): string {
    return this._filterText;
  }

  set filterTextValue(value: string) {
    this._filterText = value;
    this.filterText.set(value);
  }

  loadData() {
    const params = {
      page: this.currentPage(),
      limit: this.pageSize,
      filter: this._filterText,
      order: `${this.sortColumn()} ${this.sortDirection()}`
    };

    this.datasource(params).subscribe({
      next: (response) => {
        this.data.set(response.data);
        if (response.columns) {
          this.columns = response.columns.map((columnName: string) => ({
            name: columnName,
            title: columnName,
            sort: false
          }));
        }
        this.totalItems.set(response.total ?? response.data.length);
      },
      error: (error) => {
        console.error('Error loading table data:', error);
        this.data.set([]);
        this.totalItems.set(0);
      }
    });
  }

  onSelectRow(row: any) {
    this.selectRow.emit(row);
  }

  onSort(column: NgTableColumn) {
    if (!column?.name) return;

    if (column.name === this.sortColumn()) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column.name);
      this.sortDirection.set('asc');
    }
    this.loadData();
  }

  totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize);
  }

  getPages(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 1 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  sortIcon(column: NgTableColumn): string {
    if (column.name === this.sortColumn()) {
      return this.sortDirection() === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort';
  }

  getTemplate(templateName: string | undefined): TemplateRef<any> | null {
    return templateName ? this.templateMap[templateName] || null : null;
  }

  getTemplateContext(row: any): { $implicit: any; row: any } {
    return { $implicit: row, row };
  }

  onLastPage() {
    const lastPage = this.totalPages();
    if (this.currentPage() < lastPage) {
      this.currentPage.set(lastPage);
      this.loadData();
    }
  }

  onNextPage() {
    const nextPage = this.currentPage() + 1;
    if (nextPage <= this.totalPages()) {
      this.currentPage.set(nextPage);
      this.loadData();
    }
  }

  onPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  onPrevPage() {
    const prevPage = this.currentPage() - 1;
    if (prevPage >= 1) {
      this.currentPage.set(prevPage);
      this.loadData();
    }
  }

  onFirstPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(1);
      this.loadData();
    }
  }

  startIndex(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  endIndex(): number {
    return this.startIndex() + this.data().length - 1;
  }

  isRowChecked(row: any): boolean {
    return this.checkedItems()?.has(row) ?? false;
  }
}