import { 
  Component, Input, Output, EventEmitter, OnInit, TemplateRef, QueryList, ContentChildren, AfterContentInit, Signal, signal, OnDestroy 
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

export interface NgTableColumn {
  type?: 'checkbox';
  title?: string;
  name?: string;
  template?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sort?: boolean;
  format?: NgTableFormat;
  aggregate?: Aggregate;
  fractionDigits?: number;
}

export enum Aggregate {
  Sum = 1,
  Avg = 2,
  Min = 3,
  Max = 4,
  Count = 5,
}

export enum NgTableFormat {
  Date = 1,
  DateTime = 2,
  Number = 3,
  Masking = 4,
  Number4 = 5,
}

interface GroupedData {
  groupValue: string;
  groupBy: string;
  items: any[];
  children?: GroupedData[];
  expanded?: boolean;
  level?: number;
  aggregates?: { [key: string]: number };
  itemCount?: number;
}

interface TableState {
  groupByColumns: string[];
  expandedGroups: string[];
  currentPage: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filterText: string;
  pageSize: number;
  showGrouping: boolean;
}

@Component({
  selector: 'ng-table-group',
  templateUrl: './ng-table-group.component.html',
  styleUrls: ['./ng-table-group.component.css']
})
export class NgTableGroupComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input() columns: NgTableColumn[] = [];
  @Input() defaultSortColumn: string = '';
  @Input() defaultSortDirection: 'asc' | 'desc' = 'asc';
  @Input() allowFilter: boolean = true;
  @Input() allowCheckbox: boolean = false;
  @Input() allowPaging: boolean = true;
  @Input() allowExport: boolean = false;
  @Input() allowGrouping: boolean = true;
  @Input() pageSize: number = 10;
  @Input() defaultGroupBy: string[] | string = [];
  @Input() expandGroupsOnInit = true;
  @Input() saveState: boolean = true; // Enable/disable state saving
  @Input() stateKey: string = 'ng-table-state'; // Unique key for localStorage
  @Output() selectRow = new EventEmitter<any>();
  @Output() checkedItemsChange = new EventEmitter<any[]>();
  @Output() onExport = new EventEmitter<any>();
  @Output() groupingChanged = new EventEmitter<string[]>();

  @Input() datasource!: (params: any) => Observable<{ data: any[], total?: number, columns?: string[] }>;

  @ContentChildren(TemplateRef, { descendants: true }) templates!: QueryList<TemplateRef<any>>;
  @Input({ required: true }) tableId: string = ''; 
  // Private variable to prevent duplicate default grouping application
  private _defaultGroupingApplied = false;
  private _stateLoaded = false;
  private _uniqueStateKey: string = '';
  private _componentId: string = '';
  
  // Grouping properties
  groupByColumns = signal<string[]>([]);
  availableColumns = signal<NgTableColumn[]>([]);
  flatData = signal<any[]>([]);
  groupedData = signal<GroupedData[]>([]);
  expandedGroups = signal<Set<string>>(new Set());

  // Drag and drop state
  draggedColumn: string = '';
  isDraggingOver = false;

  // Original table properties
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
  showGrouping: boolean = false; // Default: hide grouping panel

  constructor(private http: HttpClient) {
    if (!this.checkedItems()) {
      this.checkedItems.set(new Set());
    }
    this._componentId = this.generateUniqueId();
  }
  private generateUniqueId(): string {
    return 'ng-table-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }
  private getStateKey(): string {
    if (this._uniqueStateKey) {
      return this._uniqueStateKey;
    }
    
    // Use tableId if provided (highest priority)
    if (this.tableId && this.tableId.trim()) {
      this._uniqueStateKey = `ng-table-state-${this.tableId}`;
      return this._uniqueStateKey;
    }
    
    // Use custom stateKey if provided
    if (this.stateKey && this.stateKey.trim()) {
      this._uniqueStateKey = `ng-table-state-${this.stateKey}`;
      return this._uniqueStateKey;
    }
    
    // Auto-generate unique key based on component context
    const columnNames = this.columns.map(col => col.name || col.title || '').join('-');
    const routeInfo = typeof window !== 'undefined' ? window.location.pathname.replace(/[^a-zA-Z0-9]/g, '-') : '';
    const timestamp = Date.now().toString(36);
    
    this._uniqueStateKey = `ng-table-state-${columnNames}-${routeInfo}-${this._componentId}-${timestamp}`;
    return this._uniqueStateKey;
  }
  getTableIdentifier(): string {
    if (this.tableId) return this.tableId;
    if (this.stateKey) return this.stateKey;
    return `auto-${this._componentId}`;
  }

  ngOnInit() {
    // Load saved state first
    if (this.saveState) {
      this.loadTableState();
    }
    
    // Apply defaults only if state wasn't loaded
    if (!this._stateLoaded) {
      this.sortColumn.set(this.defaultSortColumn || (this.columns[0]?.name ?? ''));
      this.sortDirection.set(this.defaultSortDirection || 'asc');
      
      // Set default grouping if specified and showGrouping is true
      if (!this._defaultGroupingApplied && this.showGrouping) {
        const groups = Array.isArray(this.defaultGroupBy) ? this.defaultGroupBy : [this.defaultGroupBy];
        if (groups.length && groups[0]) {
          this.setGroupBy(groups as string[]);
          this._defaultGroupingApplied = true;
        }
      }
    }
    
    this.availableColumns.set([...this.columns]);
    this.loadData();
  }
  ngOnDestroy() {
    // Save state when component is destroyed
    if (this.saveState) {
      this.saveTableState();
    }
  }

  // Enhanced State Management Methods
  private saveTableState(): void {
    if (!this.saveState) return;

    const state: TableState = {
      groupByColumns: this.groupByColumns(),
      expandedGroups: Array.from(this.expandedGroups()),
      currentPage: this.currentPage(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
      filterText: this._filterText,
      pageSize: this.pageSize,
      showGrouping: this.showGrouping
    };

    try {
      const stateKey = this.getStateKey();
      localStorage.setItem(stateKey, JSON.stringify(state));
      console.log(`Table state saved for: ${this.getTableIdentifier()} with key: ${stateKey}`);
    } catch (error) {
      console.warn('Failed to save table state to localStorage:', error);
    }
  }
  
  get pagingEnabled(): boolean {
    // Paging is enabled when allowPaging = true and grouping is not currently shown
    return this.allowPaging && (!this.allowGrouping || !this.showGrouping);
  }
  
  ngAfterContentInit() {
    this.templates.forEach((template: TemplateRef<any>) => {
      const elementRef = (template as any)._declarationTContainer;
      if (elementRef?.localNames?.[0]) {
        this.templateMap[elementRef.localNames[0]] = template;
      }
    });
  }
 

  private loadTableState(): void {
    if (!this.saveState) return;

    try {
      const stateKey = this.getStateKey();
      const savedState = localStorage.getItem(stateKey);
      if (savedState) {
        const state: TableState = JSON.parse(savedState);
        
        // Restore state
        this.groupByColumns.set(state.groupByColumns || []);
        this.expandedGroups.set(new Set(state.expandedGroups || []));
        this.currentPage.set(state.currentPage || 1);
        this.sortColumn.set(state.sortColumn || this.defaultSortColumn || (this.columns[0]?.name ?? ''));
        this.sortDirection.set(state.sortDirection || this.defaultSortDirection || 'asc');
        this._filterText = state.filterText || '';
        this.filterText.set(this._filterText);
        this.pageSize = state.pageSize || this.pageSize;
        this.showGrouping = state.showGrouping ?? false;
        
        this._stateLoaded = true;
        this._defaultGroupingApplied = true; // Mark as applied since we loaded from state
        
        console.log(`Table state loaded for: ${this.getTableIdentifier()} from key: ${stateKey}`);
      }
    } catch (error) {
      console.warn('Failed to load table state from localStorage:', error);
    }
  }

  public clearSavedState(): void {
    if (!this.saveState) return;
    
    try {
      const stateKey = this.getStateKey();
      localStorage.removeItem(stateKey);
      console.log(`Table state cleared for: ${this.getTableIdentifier()}`);
    } catch (error) {
      console.warn('Failed to clear table state from localStorage:', error);
    }
  }
 
  public resetTableState(): void {
    // Reset to defaults
    this.groupByColumns.set([]);
    this.expandedGroups.set(new Set());
    this.currentPage.set(1);
    this.sortColumn.set(this.defaultSortColumn || (this.columns[0]?.name ?? ''));
    this.sortDirection.set(this.defaultSortDirection || 'asc');
    this._filterText = '';
    this.filterText.set('');
    this.showGrouping = false;
    this._defaultGroupingApplied = false;
    
    // Clear saved state and reload data
    this.clearSavedState();
    this.loadData();
  }

  // Debug methods for state management
  public getAllSavedTableStates(): { [key: string]: any } {
    const allStates: { [key: string]: any } = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ng-table-state-')) {
          const value = localStorage.getItem(key);
          if (value) {
            allStates[key] = JSON.parse(value);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get all table states:', error);
    }
    
    return allStates;
  }

  public clearAllTableStates(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ng-table-state-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} table states from localStorage`);
    } catch (error) {
      console.warn('Failed to clear all table states:', error);
    }
  }

  setGroupBy(groups: string[]) {
    const arr = (groups || []).filter(Boolean);
    this.groupByColumns.set(arr);
    this.groupingChanged.emit(arr);
    this.applyGrouping();
    if (this.expandGroupsOnInit) {
      this.expandAllGroups();
    }
    
    // Save state after grouping change
    if (this.saveState) {
      this.saveTableState();
    }
  }

  // HTML5 Drag and Drop handlers
  onDragStart(event: DragEvent, columnName: string) {
    if (!this.allowGrouping) return;
    
    this.draggedColumn = columnName;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', columnName);
    }
  }

  onDragOver(event: DragEvent) {
    if (!this.allowGrouping) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent) {
    if (!this.allowGrouping) return;
    
    event.preventDefault();
    this.isDraggingOver = false;
    
    const columnName = event.dataTransfer!.getData('text/plain');
    if (columnName && !this.groupByColumns().includes(columnName)) {
      this.addGroupColumn(columnName);
    }
  }

  addGroupColumn(columnName: string) {
    const newGroupBy = [...this.groupByColumns(), columnName];
    this.groupByColumns.set(newGroupBy);
    this.groupingChanged.emit(newGroupBy);
    this.applyGrouping();
    
    // Save state after adding group column
    if (this.saveState) {
      this.saveTableState();
    }
  }

  removeGroupColumn(columnName: string) {
    const newGroupBy = this.groupByColumns().filter(col => col !== columnName);
    this.groupByColumns.set(newGroupBy);
    this.groupingChanged.emit(newGroupBy);
    this.applyGrouping();
    
    // Save state after removing group column
    if (this.saveState) {
      this.saveTableState();
    }
  }

  moveGroupColumn(fromIndex: number, toIndex: number) {
    const newGroupBy = [...this.groupByColumns()];
    const [movedItem] = newGroupBy.splice(fromIndex, 1);
    newGroupBy.splice(toIndex, 0, movedItem);
    this.groupByColumns.set(newGroupBy);
    this.groupingChanged.emit(newGroupBy);
    this.applyGrouping();
    
    // Save state after moving group column
    if (this.saveState) {
      this.saveTableState();
    }
  }

  clearAllGroups() {
    this.groupByColumns.set([]);
    this.expandedGroups.set(new Set());
    this.groupingChanged.emit([]);
    this.applyGrouping();
    
    // Save state after clearing groups
    if (this.saveState) {
      this.saveTableState();
    }
  }

  // Grouping logic with aggregation calculation
  private applyGrouping() {
    const data = this.flatData();
    if (this.groupByColumns().length === 0) {
      this.data.set(data);
      this.groupedData.set([]);
      return;
    }

    const grouped = this.groupDataRecursive(data, this.groupByColumns(), 0);
    this.groupedData.set(grouped);
    this.data.set(this.flattenGroupedData(grouped));
  }

  private groupDataRecursive(data: any[], groupColumns: string[], level: number): GroupedData[] {
    if (level >= groupColumns.length) {
      return [];
    }

    const currentColumn = groupColumns[level];
    const groups = new Map<string, any[]>();

    // Group data by current column
    data.forEach(item => {
      const groupValue = item[currentColumn] || 'N/A';
      if (!groups.has(groupValue)) {
        groups.set(groupValue, []);
      }
      groups.get(groupValue)!.push(item);
    });

    // Convert to GroupedData array with aggregates
    return Array.from(groups.entries()).map(([groupValue, items]) => {
      const groupKey = `${currentColumn}-${groupValue}-${level}`;
      const group: GroupedData = {
        groupValue,
        groupBy: currentColumn,
        items,
        level,
        expanded: this.expandedGroups().has(groupKey),
        itemCount: items.length,
        aggregates: this.calculateAggregates(items)
      };

      // Recursively group children if there are more grouping levels
      if (level < groupColumns.length - 1) {
        group.children = this.groupDataRecursive(items, groupColumns, level + 1);
      }

      return group;
    });
  }

  private calculateAggregates(items: any[]): { [key: string]: number } {
    const aggregates: { [key: string]: number } = {};
    
    // Calculate aggregates only for columns that have aggregate function defined
    this.columns.forEach(column => {
      if (column.name && column.aggregate) {
        const aggregateType = column.aggregate;
        const values = items.map(item => parseFloat(item[column.name!]) || 0);
        
        switch (aggregateType) {
          case Aggregate.Sum:
            aggregates[column.name] = values.reduce((sum, val) => sum + val, 0);
            break;
          case Aggregate.Avg:
            aggregates[column.name] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case Aggregate.Min:
            aggregates[column.name] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case Aggregate.Max:
            aggregates[column.name] = values.length > 0 ? Math.max(...values) : 0;
            break;
          case Aggregate.Count:
            aggregates[column.name] = items.length;
            break;
        }
      }
    });

    return aggregates;
  }

  private flattenGroupedData(groups: GroupedData[]): any[] {
    const flattened: any[] = [];
    
    groups.forEach(group => {
      // Add group header with expand/collapse button
      const groupHeaderRow = {
        ...group,
        isGroupHeader: true,
        isGroupTotal: false,
        groupKey: `${group.groupBy}-${group.groupValue}-${group.level}`,
        groupLevel: group.level || 0
      };
      flattened.push(groupHeaderRow);

      if (group.expanded) {
        if (group.children && group.children.length > 0) {
          // Recursively add children
          flattened.push(...this.flattenGroupedData(group.children));
          
          // Add group total row after children only if there are aggregates
          if (this.hasAggregatesInGroup(group)) {
            const groupTotalRow = {
              ...group.aggregates,
              isGroupHeader: false,
              isGroupTotal: true,
              groupLevel: (group.level || 0) + 1,
              groupValue: group.groupValue,
              groupBy: group.groupBy,
              itemCount: group.itemCount
            };
            flattened.push(groupTotalRow);
          }
        } else {
          // Add actual data items
          group.items.forEach(item => {
            flattened.push({
              ...item,
              isGroupHeader: false,
              isGroupTotal: false,
              groupLevel: (group.level || 0) + 1
            });
          });

          // Add group total row only if there are aggregates
          if (this.hasAggregatesInGroup(group)) {
            const groupTotalRow = {
              ...group.aggregates,
              isGroupHeader: false,
              isGroupTotal: true,
              groupLevel: (group.level || 0) + 1,
              groupValue: group.groupValue,
              groupBy: group.groupBy,
              itemCount: group.itemCount
            };
            flattened.push(groupTotalRow);
          }
        }
      }
    });

    return flattened;
  }

  // Check if group has aggregates defined
  private hasAggregatesInGroup(group: GroupedData): boolean {
    return this.columns.some(column => {
      return column.name && column.aggregate;
    });
  }

  // Group expand/collapse
  toggleGroup(groupKey: string) {
    const expanded = new Set(this.expandedGroups());
    if (expanded.has(groupKey)) {
      expanded.delete(groupKey);
    } else {
      expanded.add(groupKey);
    }
    this.expandedGroups.set(expanded);
    this.applyGrouping();
    
    // Save state after toggling group
    if (this.saveState) {
      this.saveTableState();
    }
  }

  expandAllGroups() {
    const allKeys = this.getAllGroupKeys(this.groupedData());
    this.expandedGroups.set(new Set(allKeys));
    this.applyGrouping();
    
    // Save state after expanding all groups
    if (this.saveState) {
      this.saveTableState();
    }
  }

  collapseAllGroups() {
    this.expandedGroups.set(new Set());
    this.applyGrouping();
    
    // Save state after collapsing all groups
    if (this.saveState) {
      this.saveTableState();
    }
  }

  private getAllGroupKeys(groups: GroupedData[]): string[] {
    const keys: string[] = [];
    groups.forEach(group => {
      keys.push(`${group.groupBy}-${group.groupValue}-${group.level}`);
      if (group.children) {
        keys.push(...this.getAllGroupKeys(group.children));
      }
    });
    return keys;
  }

  // Get visible columns (excluding grouped columns)
  getVisibleColumns(): NgTableColumn[] {
    return this.columns.filter(col => !this.groupByColumns().includes(col.name || ''));
  }

  getGroupColumnTitle(columnName: string): string {
    const column = this.columns.find(col => col.name === columnName);
    return column?.title || columnName;
  }

  getGroupColumnTitles(): string {
    return this.groupByColumns().map(col => this.getGroupColumnTitle(col)).join(', ');
  }

  // Group tag drag and drop for reordering
  onGroupTagDragStart(event: DragEvent, index: number) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', index.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onGroupTagDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onGroupTagDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const dragIndex = parseInt(event.dataTransfer!.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      this.moveGroupColumn(dragIndex, dropIndex);
    }
  }

  // Check if group has any aggregates to show
  hasAggregates(row: any): boolean {
    if (!row.isGroupTotal) return false;
    
    return this.columns.some(column => {
      return column.name && column.aggregate && row[column.name] !== undefined;
    });
  }

  getAggregateValue(row: any, column: NgTableColumn): string {
    if (!row.isGroupTotal || !column.name) return '';
  
    // Check if column has aggregate function defined
    const aggregateType = column.aggregate;
    if (!aggregateType) return ''; // Return empty if no aggregate defined
    
    const value = row[column.name];
    if (value === undefined || value === null) return '';
  
    const fractionDigits: number | undefined = column.fractionDigits;
  
    // Format based on column format and aggregate type
    if (column.format === NgTableFormat.Number) {
      const digits = (typeof fractionDigits === 'number')
        ? fractionDigits
        : (aggregateType === Aggregate.Count ? 0 : 2);
  
      return this.formatValue(value, column.format, { min: digits, max: digits });
    }
  
    return this.formatValue(value, column.format);
  }

  // Toggle grouping panel
  toggleGroupingPanel(): void {
    this.showGrouping = !this.showGrouping;
    
    // If opening grouping panel and haven't applied default grouping yet
    if (this.showGrouping && !this._defaultGroupingApplied) {
      const groups = Array.isArray(this.defaultGroupBy) ? this.defaultGroupBy : [this.defaultGroupBy];
      if (groups.length && groups[0]) {
        this.setGroupBy(groups as string[]);
        this._defaultGroupingApplied = true;
      }
    }
    
    // If closing grouping panel, clear groups
    if (!this.showGrouping) {
      this.clearAllGroups();
    }
    
    this.refresh();
    
    // Save state after toggling grouping panel
    if (this.saveState) {
      this.saveTableState();
    }
  }

  // Original table methods
  private emitCheckedItems(): void {
    const items = this.checkedItems();
    this.checkedItemsChange.emit(items ? Array.from(items) : []);
  }

  filter() {
    this.currentPage.set(1);
    this.loadData();
    
    // Save state after filtering
    if (this.saveState) {
      this.saveTableState();
    }
  }

  refresh() {
    this.data.set([]);
    this.flatData.set([]);
    this.loadData();
  }

  export() {
    this.onExport.emit();
  }

  isAllChecked(): boolean {
    const items = this.checkedItems();
    const nonGroupItems = this.data().filter(item => !item.isGroupHeader && !item.isGroupTotal);
    return nonGroupItems.length > 0 && items && items.size === nonGroupItems.length;
  }

  onCheckAllChange(checked: boolean): void {
    const newCheckedItems = new Set(this.checkedItems() || new Set());
    const nonGroupItems = this.data().filter(item => !item.isGroupHeader && !item.isGroupTotal);
    
    if (checked) {
      nonGroupItems.forEach(item => newCheckedItems.add(item));
    } else {
      nonGroupItems.forEach(item => newCheckedItems.delete(item));
    }
    this.checkedItems.set(newCheckedItems);
    this.emitCheckedItems();
  }

  onItemCheckChange(item: any, checked: boolean): void {
    if (item.isGroupHeader || item.isGroupTotal) return;
    
    const newCheckedItems = new Set(this.checkedItems() || new Set());
    if (checked) {
      newCheckedItems.add(item);
    } else {
      newCheckedItems.delete(item);
    }
    this.checkedItems.set(newCheckedItems);
    this.emitCheckedItems();
  }

  formatValue(value: any, format?: NgTableFormat, options?: { min: number; max: number; }): string {
    if (value === undefined || value === null) return '';

    switch (format) {
      case NgTableFormat.DateTime:
        return formatDate(value, this.dateTimeFormat, 'en-US');
      case NgTableFormat.Date:
        return formatDate(value, this.dateFormat, 'en-US');
      case NgTableFormat.Number4:
        return typeof value === 'number' ? new Intl.NumberFormat('en-US', { 
          minimumFractionDigits: options?.min ?? 4, 
          maximumFractionDigits: options?.max ?? 4 
        }).format(value) : '';
      case NgTableFormat.Number:
        return typeof value === 'number' ? new Intl.NumberFormat('en-US', { 
          minimumFractionDigits: options?.min ?? 2, 
          maximumFractionDigits: options?.max ?? 2 
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
    const pagingOn = this.pagingEnabled;
  
    const params = {
      page: pagingOn ? this.currentPage() : 1,
      limit: pagingOn ? this.pageSize : 0, // 0 means get all data
      filter: this._filterText,
      order: `${this.sortColumn()} ${this.sortDirection()}`
    };
  
    this.datasource(params).subscribe({
      next: (response) => {
        this.flatData.set(response.data);
  
        if (response.columns) {
          this.columns = response.columns.map((name: string) => ({ name, title: name, sort: false }));
          this.availableColumns.set([...this.columns]);
        }
  
        this.totalItems.set(pagingOn ? (response.total ?? response.data.length) : response.data.length);
        if (!pagingOn) this.currentPage.set(1);
  
        this.applyGrouping();
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.flatData.set([]);
        this.data.set([]);
        this.totalItems.set(0);
      }
    });
  }

  onSelectRow(row: any) {
    if (!row.isGroupHeader && !row.isGroupTotal) {
      this.selectRow.emit(row);
    }
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
    
    // Save state after sorting
    if (this.saveState) {
      this.saveTableState();
    }
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
      
      // Save state after page change
      if (this.saveState) {
        this.saveTableState();
      }
    }
  }

  onNextPage() {
    const nextPage = this.currentPage() + 1;
    if (nextPage <= this.totalPages()) {
      this.currentPage.set(nextPage);
      this.loadData();
      
      // Save state after page change
      if (this.saveState) {
        this.saveTableState();
      }
    }
  }

  onPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
      
      // Save state after page change
      if (this.saveState) {
        this.saveTableState();
      }
    }
  }

  onPrevPage() {
    const prevPage = this.currentPage() - 1;
    if (prevPage >= 1) {
      this.currentPage.set(prevPage);
      this.loadData();
      
      // Save state after page change
      if (this.saveState) {
        this.saveTableState();
      }
    }
  }

  onFirstPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(1);
      this.loadData();
      
      // Save state after page change
      if (this.saveState) {
        this.saveTableState();
      }
    }
  }

  startIndex(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  endIndex(): number {
    return this.startIndex() + this.flatData().length - 1;
  }

  isRowChecked(row: any): boolean {
    return this.checkedItems()?.has(row) ?? false;
  }
}