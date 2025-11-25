import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, SimpleChanges, OnInit, OnChanges, ContentChild, TemplateRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export enum NgTreeTable3Format {
  number = 'number',
  datetime = 'datetime',
  million = 'million',
  date = 'date',
  other = 'other'
}

export interface CellEditEvent {
  node: TreeNode;
  column: ColumnDefinition;
  oldValue: any;
  newValue: any;
  field: string;
}


export interface TreeNode {
  id: string;
  code: string;
  description: string;
  amount: number;
  children?: TreeNode[];
  level: number;
  isExpanded?: boolean;
  parent?: TreeNode;
  totalAmount?: number;
  isLastChild?: boolean;
  isVisible?: boolean;
  isGroupRow?: boolean;
  groupValue?: string;
  originalData?: any;
  [key: string]: any;
}
export interface ColumnDefinition {
  key?: string;
  name?: string;  // 🆕 เพิ่ม name property
  title?: string; // 🆕 เพิ่ม title property
  header?: string;
  width?: string;
  class?: string;
  template?: string;
  filterable?: boolean;
  showSummary?: boolean;
  summaryType?: 'sum' | 'avg' | 'count' | 'custom';
  summaryTemplate?: string;
  format?: NgTreeTable3Format;
  editable?: boolean;
  isGrandTotal?: boolean;
  excludeFromTotal?: boolean;
  isGroup?: boolean; // 🆕 เพิ่ม isGroup property
  sort?: boolean;    // 🆕 เพิ่ม sort property
}

export interface GroupingOption {
  field: string;
  label: string;
  enabled: boolean;
}
@Component({
  selector: 'ng-tree-table3',
  template: `
 <div class="">
  <!-- Grouping Controls -->
  <div class="grouping-controls mb-3" *ngIf="showGroupingControls">
    <div class="row">
      <div class="col-md-8">
        <h6>Group By:</h6>
        <div class="d-flex flex-wrap gap-3">
          <div class="form-check" *ngFor="let option of groupingOptions">
            <input class="form-check-input" 
                   type="checkbox" 
                   [id]="'group-' + option.field"
                   [(ngModel)]="option.enabled"
                   (change)="onGroupingChange()">
            <label class="form-check-label" [for]="'group-' + option.field">
              {{ option.label }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-md-4 text-end">
        <button class="btn btn-sm btn-outline-secondary me-2" (click)="expandAll()" type="button">
          <i class="fas fa-expand-arrows-alt"></i> Expand All
        </button>
        <button class="btn btn-sm btn-outline-secondary" (click)="collapseAll()" type="button">
          <i class="fas fa-compress-arrows-alt"></i> Collapse All
        </button>
      </div>
    </div>
  </div>

  <!-- Filter Input Section -->
  <div class="filter-section mb-3" *ngIf="showFilter">
    <div class="row">
      <div class="col-md-4">
        <div class="input-group">
          <input type="text" 
                 class="form-control" 
                 placeholder="{{ filterPlaceholder }}"
                 [(ngModel)]="filterText"
                 (input)="onFilterChange()">
        </div>
      </div>
    </div>
  </div>

  <div class="table-tree">
    <table class="table table-striped table-sticky-header">
    <thead class="table-light">
      <tr>
        <th style="min-width: 300px; background-color: #f8f9fa;">{{ headers.description || 'รายการ' }}</th>
        <!-- 🔧 เปลี่ยนจาก columns เป็น getVisibleColumns() -->
        <ng-container *ngFor="let column of getVisibleColumns()">
          <th [ngClass]="column.class || ''" 
              [style.width]="column.width"
              style="background-color: #f8f9fa;">
            {{ getColumnHeader(column) }}
          </th>
        </ng-container>
      </tr>
    </thead>
      <tbody>
      <ng-container *ngFor="let node of visibleNodes; let i = index; trackBy: trackByFn">
        <tr [attr.data-node-id]="node.id" 
            [attr.data-level]="node.level"
            [class]="getRowClass(node)"
            [style.background-color]="getRowBackgroundColor(node)">
          
          <!-- Description Column -->
          <td [style.padding-left.px]="(node.level * 20) + 12">
            <div class="d-flex align-items-center">
              <!-- Toggle icon for group rows -->
              <i *ngIf="hasChildren(node)" 
                class="fas tree-icon me-2"
                [class.fa-minus-square]="node.isExpanded"
                [class.fa-plus-square]="!node.isExpanded"
                (click)="toggleNode(node, $event)"
                style="cursor: pointer; color: #0a7c76;">
              </i>
              
              <!-- Group row display -->
              <span *ngIf="node.isGroupRow" class="fw-bold text-uppercase">
                {{ node.description }}
                <small class="text-muted ms-2">({{ getChildCount(node) }} items)</small>
              </span>
              
              <!-- Data row display -->
              <span *ngIf="!node.isGroupRow" [innerHTML]="highlightText(node.description)"></span>
            </div>
          </td>
          
          <!-- Data Columns - ใช้ getVisibleColumns() -->
          <ng-container *ngFor="let column of getVisibleColumns()">
            <td [ngClass]="column.class || ''" 
                [class.editable-cell]="allowCellEdit && column.editable && !node.isGroupRow"
                (dblclick)="onCellDoubleClick(node, column, $event)">
              
              <!-- Group rows: Show summary or nothing -->
              <ng-container *ngIf="node.isGroupRow">
                <ng-container *ngIf="column.showSummary">
                  <ng-container *ngIf="column.summaryTemplate">
                    <ng-container *ngTemplateOutlet="getTemplateRef(column.summaryTemplate); 
                                                  context: { $implicit: node, row: node, column: column, summary: getSummaryForColumn(node, column) }">
                    </ng-container>
                  </ng-container>
                  <ng-container *ngIf="!column.summaryTemplate">
                    <span class="fw-bold text-primary" [innerHTML]="formatValue(getSummaryForColumn(node, column), column)"></span>
                  </ng-container>
                </ng-container>
              </ng-container>
              
              <!-- Data rows: Show actual data or edit input -->
              <ng-container *ngIf="!node.isGroupRow">
                <!-- Edit mode input -->
                <div *ngIf="editingCell && editingCell.nodeId === node.id && editingCell.columnKey === getColumnField(column)" 
                    class="edit-cell-container">
                  <input type="number" 
                        class="form-control form-control-sm edit-input"
                        [(ngModel)]="editingValue"
                        (blur)="saveEdit()"
                        (keydown.enter)="saveEdit()"
                        (keydown.escape)="cancelEdit()"
                        #editInput
                        [placeholder]="'Enter ' + getColumnHeader(column)">
                </div>
                
                <!-- Normal display mode -->
                <div *ngIf="!editingCell || editingCell.nodeId !== node.id || editingCell.columnKey !== getColumnField(column)">
                  <!-- Template column -->
                  <ng-container *ngIf="column.template">
                    <ng-container *ngTemplateOutlet="getTemplateRef(column.template); 
                                                  context: { $implicit: node, row: node, column: column }">
                    </ng-container>
                  </ng-container>
                  <!-- Data column -->
                  <ng-container *ngIf="!column.template">
                    <span [innerHTML]="formatDisplayValue(node, column)"></span>
                  </ng-container>
                </div>
              </ng-container>
            </td>
          </ng-container>
        </tr>
      </ng-container>
              <!-- Grand Total Summary Row -->
              <!-- Grand Total Summary Row -->
      <tr *ngIf="showGrandTotal && visibleNodes.length > 0" class="grand-total-row">
        <td class="fw-bold text-uppercase total-text" style="padding-left: 12px;">
          <i class="fas fa-calculator me-2"></i>
          รวมทั้งหมด
        </td>
        <!-- 🔧 เปลี่ยนจาก columns เป็น getVisibleColumns() -->
        <ng-container *ngFor="let column of getVisibleColumns()">
          <td [ngClass]="column.class || ''">
            <ng-container *ngIf="column.showSummary">
              <ng-container *ngIf="column.summaryTemplate">
                <ng-container *ngTemplateOutlet="getTemplateRef(column.summaryTemplate); 
                                              context: { $implicit: grandTotalData, row: grandTotalData, column: column, summary: getGrandTotalForColumn(column) }">
                </ng-container>
              </ng-container>
              <ng-container *ngIf="!column.summaryTemplate">
                <span class="fw-bold total-amount" [innerHTML]="formatValue(getGrandTotalForColumn(column), column)"></span>
              </ng-container>
            </ng-container>
          </td>
        </ng-container>
      </tr>
        
        <!-- No results row -->
            <!-- No results row -->
      <tr *ngIf="visibleNodes.length === 0 && filterText" class="no-results">
        <td [attr.colspan]="getTableColspan()" class="text-center text-muted py-4">
          <i class="fas fa-search mb-2"></i>
          <div>No results found for "{{ filterText }}"</div>
          <small>Try adjusting your search terms</small>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .table-tree {
      margin: 0;
    }
    .table-tree td{
        height:40px;
    }
    
    .grouping-controls {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #dee2e6;
    }
    
    .form-check-inline {
      margin-right: 15px;
    }
    
    .tree-icon {
      color: #0a7c76;
      cursor: pointer;
      transition: color 0.2s;
    }
    .tree-icon:hover {
      color: #064e4a;
    }
    
    .group-row {
      background-color: #e9ecef;
      font-weight: 600;
    }
    
    .group-header {
      color: #495057;
    }
    
    .group-summary {
      color: #0a7c76;
      font-weight: 600;
    }
    
    .account-header {
      font-weight: 600;
    }
    .level-0 {
      text-transform: uppercase;
      color: #212529;
      font-size: 1.1em;
    }
    .level-1 {
      color: #495057;
      font-weight: 500;
    }
    .level-2 {
      color: #6c757d;
    }
    
    .summary-row {
      background-color: #f8f9fa;
    }
    .total-row {
      background-color: #f0f2f3;
    }
    
    /* Grand Total Row Styles */
    .grand-total-row {
      background-color: #e8f5e8 !important;
      border-top: 2px solid #0a7c76;
      font-weight: 600;
    }
    .grand-total-row td {
      border-top: 2px solid #0a7c76;
      vertical-align: middle;
    }
    
    .total-text {
      color: #0a7c76;
      font-weight: 700;
      font-size: 1.05em;
    }
    .total-amount {
      color: #0a7c76;
      font-weight: 700;
      font-size: 1.05em;
    }
    
    .filtered-highlight {
      background-color: rgba(10, 124, 118, 0.05);
      border-left: 3px solid #0a7c76;
    }
    
    .highlight {
      background-color: #fff3cd;
      padding: 1px 2px;
      border-radius: 2px;
      font-weight: 600;
    }
    
    .no-results {
      background-color: #f8f9fa;
    }
    
    .input-group-text {
      background-color: white;
      border-right: none;
    }
    
    .form-control:focus {
      border-color: #0a7c76;
      box-shadow: 0 0 0 0.2rem rgba(10, 124, 118, 0.25);
    }

    /* Cell Edit Styles */
    .editable-cell {
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
      border:1px solid transparent;
    }
    
    .editable-cell:hover {
      background-color: #f8f9fa !important;
      border: 1px dashed #0a7c76;
    }
    
    .editable-cell:hover::after {
      content: "Double-click to edit";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      z-index: 1000;
      opacity: 0.9;
    }
    
    .edit-cell-container {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    
    .edit-input {
      min-width: 50px;
      border-color: #0a7c76;
      height:30px;
      box-shadow: 0 0 0 0.2rem rgba(10, 124, 118, 0.25);
    }
     
    .edit-input:focus {
      border-color: #0a7c76;
      box-shadow: 0 0 0 0.2rem rgba(10, 124, 118, 0.25);
    }
    
    .edit-actions {
      display: flex;
      gap: 4px;
    }
    
    .edit-actions .btn {
      padding: 2px 6px;
      font-size: 10px;
      line-height: 1.2;
    }
    
    .editing-cell {
      background-color: #e8f5e8 !important;
      border: 1px solid #0a7c76 !important;
    }
    
    @keyframes editHighlight {
      0% { background-color: #fff3cd; }
      100% { background-color: transparent; }
    }
    
    .cell-updated {
      animation: editHighlight 1s ease-out;
    }

    /* Cell Edit Styles */
    .editable-cell {
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
    }
    
    .editable-cell:hover {
      background-color: #f8f9fa !important;
      border: 1px dashed #0a7c76;
    }
    
    .editable-cell:hover::after {
      content: "Double-click to edit";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      z-index: 1000;
      opacity: 0.9;
    }
    
    .edit-cell-container {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    
    .edit-input {
      min-width: 50px;
      border-color: #0a7c76;
      box-shadow:none;
    }
    
    .edit-input:focus {
      border-color: #0a7c76;
      box-shadow:none;
      border: 2px solid #0a7c76 !important;
    }
    
    .edit-actions {
      display: flex;
      gap: 4px;
    }
    
    .edit-actions .btn {
      padding: 2px 6px;
      font-size: 10px;
      line-height: 1.2;
    }
    
    .editing-cell {
      background-color: #e8f5e8 !important;
      border: 2px solid #0a7c76 !important;
    }
    
    @keyframes editHighlight {
      0% { background-color: #fff3cd; }
      100% { background-color: transparent; }
    }
    
    .cell-updated {
      animation: editHighlight 1s ease-out;
    }
  `]
})
export class NgTreeTable3Component implements AfterViewInit, OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() headers: { description?: string } = {};
  @Input() columns: ColumnDefinition[] = [];
  @Input() groupFields: string[] = [];
  @Input() allowSummary = false;
  @Input() showFilter = true;
  @Input() showGroupingControls = true;
  @Input() showGrandTotal = true;
  @Input() grandTotalLabel = 'รวมทั้งหมด';
  @Input() filterPlaceholder = 'Search...';
  @Input() filterFields: string[] = ['description', 'code'];
  @Input() caseSensitive = false;
  @Input() matchWholeWords = false;
  @Input() allowCellEdit = false;
  @Input() trackBy: TrackByFunction<TreeNode> | undefined;
  @Input() customGroupingOptions?: GroupingOption[];
  @Input() fieldLabelMap?: { [key: string]: string };

  @Output() filterChanged = new EventEmitter<string>();
  @Output() groupingChanged = new EventEmitter<string[]>();
  @Output() cellValueChanged = new EventEmitter<CellEditEvent>();

  @ContentChild('action') actionTemplate?: TemplateRef<any>;
  @ContentChild('summary') summaryTemplate?: TemplateRef<any>;

  private changedNodeIds: Set<string> = new Set();
  private changedNodesData: Map<string, any> = new Map();

  filterText = '';
  private originalData: any[] = [];
  treeData: TreeNode[] = [];
  flattenedNodes: TreeNode[] = [];
  visibleNodes: TreeNode[] = [];
  groupingOptions: GroupingOption[] = [];
  grandTotalData: any = {};

  // Cell editing properties
  editingCell: { nodeId: string; columnKey: string } | null = null;
  editingValue: number | null = null;
  originalEditValue: any = null;

  private templateMap = new Map<string, TemplateRef<any>>();

  trackByFn: TrackByFunction<TreeNode> = (index: number, item: TreeNode) => {
    if (this.trackBy) {
      return this.trackBy(index, item);
    }
    return item.id || index;
  };

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    if (!this.validateData()) {
      console.error('Invalid data structure detected');
      return;
    }
  
    this.originalData = JSON.parse(JSON.stringify(this.data));
    this.initializeGroupingOptions();
    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();
    
     
  }
// 🔧 Helper method สำหรับกรอง columns ที่จะแสดง
  // Helper method สำหรับกรอง columns ที่จะแสดง
// Helper method สำหรับกรอง columns ที่จะแสดง และไม่แสดง column แรกที่ไม่ใช่ group
getVisibleColumns(): ColumnDefinition[] {
  const enabledGroupFields = this.getEnabledGroupFields();
  
  // กรอง columns ที่ไม่ได้ใช้เป็น group fields
  const filteredColumns = this.columns.filter(column => {
    const fieldName = this.getColumnField(column);
    return !enabledGroupFields.includes(fieldName) || enabledGroupFields.length === 0;
  });
  
  // ค้นหา column แรกที่ไม่ใช่ group (ใช้เป็น description column)
  const firstNonGroupColumnIndex = filteredColumns.findIndex(col => col.isGroup !== true);
  
  // ตัด column แรกที่ไม่ใช่ group ออก (เพราะแสดงเป็น description แล้ว)
  if (firstNonGroupColumnIndex !== -1) {
    return [
      ...filteredColumns.slice(0, firstNonGroupColumnIndex),
      ...filteredColumns.slice(firstNonGroupColumnIndex + 1)
    ];
  }
  
  return filteredColumns;
}

  // 🔧 Helper method สำหรับ colspan ของ no-results row
  getTableColspan(): number {
    return this.getVisibleColumns().length + 1; // +1 สำหรับ description column
  }
  ngOnChanges(changes: SimpleChanges): void {
    // Handle data changes
    if (changes['data'] && changes['data'].currentValue !== changes['data'].previousValue) {
      this.originalData = JSON.parse(JSON.stringify(this.data));
      this.buildTreeData();
      this.calculateGrandTotals();
      this.applyFilter();
    }
  
    // 🔧 ADDED: Handle columns changes
    if (changes['columns'] && changes['columns'].currentValue !== changes['columns'].previousValue) {
      console.log('🔄 Columns changed, reinitializing grouping options');
      this.initializeGroupingOptions();
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
    }
  
    // Handle groupFields changes
    if (changes['groupFields'] && changes['groupFields'].currentValue !== changes['groupFields'].previousValue) {
      this.initializeGroupingOptions();
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
    }
  
    // Handle groupingOptions changes
    if (changes['groupingOptions'] && changes['groupingOptions'].currentValue !== changes['groupingOptions'].previousValue) {
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
    }
  }

  ngAfterViewInit(): void {
    if (this.actionTemplate) {
      this.templateMap.set('action', this.actionTemplate);
    }
    if (this.summaryTemplate) {
      this.templateMap.set('summary', this.summaryTemplate);
    }
  }

  // ===== Initialization Methods =====

  private validateData(): boolean {
    if (!Array.isArray(this.data)) {
      console.error('Data must be an array');
      return false;
    }

    if (!Array.isArray(this.columns)) {
      console.error('Columns must be an array');
      return false;
    }

    // ตรวจสอบว่ามี Total column มากกว่า 1 column หรือไม่
    const totalColumns = this.getTotalColumns();
    if (totalColumns.length > 1) {
      console.warn('Multiple total columns detected:', totalColumns.map(col => col.key));
    }

    return true;
  }
  private initializeGroupingOptions(): void {
    // จัดเรียง columns ให้ columns ที่มี isGroup=true ขึ้นก่อน
    const sortedColumns = [...this.columns].sort((a, b) => {
      // ถ้า a เป็น group column แต่ b ไม่ใช่ a จะขึ้นก่อน
      if (a.isGroup === true && b.isGroup !== true) return -1;
      // ถ้า b เป็น group column แต่ a ไม่ใช่ b จะขึ้นก่อน
      if (b.isGroup === true && a.isGroup !== true) return 1;
      // กรณีอื่นๆ คงลำดับเดิม
      return 0;
    });
    
    // ใช้ columns ที่จัดเรียงแล้ว
    this.columns = sortedColumns;
    
    const groupColumns = this.columns.filter(col => col.isGroup === true);
    
    console.log('🔍 Group columns found:', groupColumns);
    
    if (groupColumns.length > 0) {
      this.groupingOptions = groupColumns.map(column => ({
        field: this.getColumnField(column),
        label: this.getColumnHeader(column),
        enabled: true
      }));
      console.log('✅ Grouping options from columns:', this.groupingOptions);
    } 
    else if (this.customGroupingOptions && this.customGroupingOptions.length > 0) {
      this.groupingOptions = [...this.customGroupingOptions];
      console.log('📝 Using custom grouping options:', this.groupingOptions);
    } 
    else if (this.groupFields && this.groupFields.length > 0) {
      if (this.fieldLabelMap) {
        this.groupingOptions = this.groupFields.map(field => ({
          field: field,
          label: this.fieldLabelMap![field] || field.charAt(0).toUpperCase() + field.slice(1),
          enabled: true
        }));
      } else {
        this.groupingOptions = this.groupFields.map(field => ({
          field: field,
          label: field.charAt(0).toUpperCase() + field.slice(1),
          enabled: true
        }));
      }
      console.log('📋 Using groupFields:', this.groupingOptions);
    }
    else {
      this.groupingOptions = [];
      console.log('❌ No grouping options available');
    }
  }

  // ===== Tree Building Methods =====

  private buildTreeData(): void {
    if (!this.data.length) {
      this.treeData = [];
      return;
    }

    const enabledGroupFields = this.groupingOptions
      .filter(option => option.enabled)
      .map(option => option.field);

    if (enabledGroupFields.length === 0) {
      this.treeData = this.data.map((item, index) => this.createLeafNode(item, index));
    } else {
      this.treeData = this.buildNestedGroups(this.data, enabledGroupFields, 0);
    }
  }
// 🔧 1. Helper Methods สำหรับจัดการ column properties
  getColumnField(column: ColumnDefinition): string {
    return column.name || column.key || '';
  }

  getColumnHeader(column: ColumnDefinition): string {
    return column.title || column.header || column.name || column.key || '';
  }

  private buildNestedGroups(items: any[], groupFields: string[], level: number): TreeNode[] {
    if (level >= groupFields.length) {
      return items.map((item, index) => this.createLeafNode(item, index, level));
    }

    const currentField = groupFields[level];
    const grouped = this.groupBy(items, currentField);
    const result: TreeNode[] = [];

    let groupIndex = 0;
    for (const [groupValue, groupItems] of grouped.entries()) {
      const groupNode: TreeNode = {
        id: `group-${level}-${groupIndex}-${groupValue}`,
        code: groupValue || 'Unknown',
        description: groupValue || 'Unknown',
        amount: 0,
        level: level,
        isExpanded: false,
        isGroupRow: true,
        groupValue: groupValue,
        children: []
      };

      groupNode.children = this.buildNestedGroups(groupItems, groupFields, level + 1);
      this.calculateGroupTotals(groupNode);

      result.push(groupNode);
      groupIndex++;
    }

    return result;
  }

  private groupBy(items: any[], field: string): Map<string, any[]> {
    const grouped = new Map<string, any[]>();

    items.forEach(item => {
      const value = item[field] || 'Unknown';
      if (!grouped.has(value)) {
        grouped.set(value, []);
      }
      grouped.get(value)!.push(item);
    });

    return grouped;
  }
  
  private getFirstColumnField(): string | null {
    if (!this.columns || this.columns.length === 0) {
      return null;
    }
    
    // หา column แรกที่มี key/name
    const firstColumn = this.columns[0];
    return firstColumn.key || firstColumn.name || null;
  }
  
  // 🆕 Helper method สำหรับดึง enabled group fields
  private getEnabledGroupFields(): string[] {
    return this.groupingOptions
      .filter(option => option.enabled)
      .map(option => option.field);
  }
  
 
  saveEdit(): void {
    if (!this.editingCell || this.editingValue === null) {
      return;
    }
  
    const node = this.findNodeById(this.editingCell.nodeId);
    const column = this.columns.find(col => this.getColumnField(col) === this.editingCell!.columnKey);
  
    if (!node || !column) {
      console.warn('Cannot save edit: node or column not found');
      this.cancelEdit();
      return;
    }
  
    const fieldName = this.getColumnField(column);
    if (!fieldName) {
      console.warn('Cannot save edit: no field name');
      this.cancelEdit();
      return;
    }
  
    const oldValue = this.originalEditValue;
    const newValue = this.editingValue;
  
    if (isNaN(newValue) || !isFinite(newValue)) {
      console.warn('Invalid number value:', newValue);
      this.cancelEdit();
      return;
    }
  
    if (oldValue !== newValue) {
      try {
        node[fieldName] = newValue;
  
        if (node.originalData) {
          node.originalData[fieldName] = newValue;
        }
  
        const dataItem = this.data.find(item => item.id === node.originalData?.id);
        if (dataItem) {
          dataItem[fieldName] = newValue;
        }
  
        const originalDataItem = this.originalData.find(item => item.id === node.originalData?.id);
        if (originalDataItem) {
          originalDataItem[fieldName] = newValue;
        }
  
        this.calculateTotalColumns(node);
  
        if (node.originalData) {
          const totalColumns = this.columns.filter(col => col.isGrandTotal && this.getColumnField(col));
          totalColumns.forEach(totalCol => {
            const totalFieldName = this.getColumnField(totalCol);
            if (totalFieldName && node[totalFieldName] !== undefined) {
              node.originalData[totalFieldName] = node[totalFieldName];
  
              if (dataItem) {
                dataItem[totalFieldName] = node[totalFieldName];
              }
  
              if (originalDataItem) {
                originalDataItem[totalFieldName] = node[totalFieldName];
              }
            }
          });
        }
  
        if (node.originalData) {
          this.trackNodeChange(node.id, node.originalData);
        }
  
        this.recalculateAfterEdit();
  
        const editEvent: CellEditEvent = {
          node: node,
          column: column,
          oldValue: oldValue,
          newValue: newValue,
          field: fieldName
        };
  
        this.cellValueChanged.emit(editEvent);
        this.addCellUpdateAnimation(node.id, fieldName);
  
      } catch (error) {
        console.error('Error saving edit:', error);
        if (node && fieldName) {
          node[fieldName] = oldValue;
        }
      }
    }
  
    this.cancelEdit();
}

// 🔧 3. FIXED: createLeafNode ใช้ column สุดท้ายที่เป็น group
// แก้ไข: ใช้ column แรกที่ไม่ใช่ group column สำหรับ Description Column
// แก้ไข: ใช้ column แรกที่ไม่ใช่ group column สำหรับ Description Column
private createLeafNode(item: any, index: number, level: number = 0): TreeNode {
  // ค้นหา column แรกที่ไม่ใช่ group columns
  const firstNonGroupColumn = this.columns.find(col => col.isGroup !== true);
  
  let nodeDescription = '';
  let nodeCode = '';
  
  if (firstNonGroupColumn) {
    const fieldName = this.getColumnField(firstNonGroupColumn);
    if (fieldName && item[fieldName]) {
      nodeDescription = item[fieldName];
      nodeCode = item[fieldName];
    }
  }
  
  if (!nodeDescription) {
    nodeDescription = item.description || item.NameThai || item.name || item.Code || `Item ${index + 1}`;
    nodeCode = item.code || item.Code || item.id || `CODE-${index}`;
  }

  const node: TreeNode = {
    id: `leaf-${item.id || index}`,
    code: nodeCode,
    description: nodeDescription,
    amount: item.amount || 0,
    level: level,
    isGroupRow: false,
    originalData: item,
    ...item
  };

  this.calculateTotalColumns(node);
  return node;
}

// 🔧 4. FIXED: calculateGroupTotals ใช้ name แทน key
private calculateGroupTotals(groupNode: TreeNode): void {
  if (!groupNode.children) return;

  groupNode.amount = 0;

  this.columns.forEach(column => {
    const fieldName = this.getColumnField(column);
    if (fieldName && column.showSummary) {
      groupNode[fieldName] = 0;
    }
  });

  const leafNodes = this.getLeafNodes(groupNode);

  leafNodes.forEach(leaf => {
    groupNode.amount += leaf.amount || 0;

    this.columns.forEach(column => {
      const fieldName = this.getColumnField(column);
      if (fieldName && column.showSummary) {
        const leafValue = leaf[fieldName] || leaf.originalData?.[fieldName] || 0;
        groupNode[fieldName] = (groupNode[fieldName] || 0) + leafValue;
      }
    });
  });

  this.calculateTotalColumns(groupNode);
}
private calculateGrandTotals(): void {
  this.grandTotalData = {};

  const allLeafNodes: TreeNode[] = [];

  const collectLeafNodes = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.isGroupRow && node.children) {
        collectLeafNodes(node.children);
      } else if (!node.isGroupRow) {
        allLeafNodes.push(node);
      }
    });
  };

  collectLeafNodes(this.treeData);

  this.grandTotalData.amount = allLeafNodes.reduce((sum, node) => sum + (node.amount || 0), 0);

  this.columns.forEach(column => {
    const fieldName = this.getColumnField(column);
    if (fieldName && column.showSummary) {
      const summaryType = column.summaryType || 'sum';

      switch (summaryType) {
        case 'sum':
          this.grandTotalData[fieldName] = allLeafNodes.reduce((sum, node) => {
            const value = node[fieldName] || node.originalData?.[fieldName] || 0;
            return sum + value;
          }, 0);
          break;
        case 'avg':
          const total = allLeafNodes.reduce((sum, node) => {
            const value = node[fieldName] || node.originalData?.[fieldName] || 0;
            return sum + value;
          }, 0);
          this.grandTotalData[fieldName] = allLeafNodes.length > 0 ? total / allLeafNodes.length : 0;
          break;
        case 'count':
          this.grandTotalData[fieldName] = allLeafNodes.length;
          break;
        case 'custom':
          this.grandTotalData[fieldName] = allLeafNodes.reduce((sum, node) => {
            const value = node[fieldName + 'Total'] || node[fieldName] || node.originalData?.[fieldName] || 0;
            return sum + value;
          }, 0);
          break;
        default:
          this.grandTotalData[fieldName] = allLeafNodes.reduce((sum, node) => {
            const value = node[fieldName] || node.originalData?.[fieldName] || 0;
            return sum + value;
          }, 0);
      }
    }
  });

  this.calculateTotalColumns(this.grandTotalData);
}


// 🔧 6. FIXED: calculateTotalColumns ใช้ name แทน key
private calculateTotalColumns(targetNode: any): void {
  if (!targetNode || !this.columns) {
    console.warn('calculateTotalColumns: Invalid targetNode or columns');
    return;
  }

  const totalColumns = this.columns.filter(col => col.isGrandTotal && this.getColumnField(col));

  totalColumns.forEach(totalColumn => {
    const totalFieldName = this.getColumnField(totalColumn);
    if (!totalFieldName) return;

    let totalSum = 0;

    this.columns.forEach(column => {
      const fieldName = this.getColumnField(column);
      if (fieldName &&
        column.showSummary &&
        !column.isGrandTotal &&
        !column.excludeFromTotal &&
        fieldName !== totalFieldName) {

        const value = targetNode[fieldName] || 0;
        const numericValue = parseFloat(value) || 0;
        totalSum += numericValue;
      }
    });

    targetNode[totalFieldName] = totalSum;

    if (totalFieldName === 'TotalAmount') {
      targetNode.totalAmount = totalSum;
    }
  });
}
  private calculateTotalColumnsRobust(targetNode: any): void {
    if (!targetNode) return;

    // หา Total columns
    const totalColumns = this.columns.filter(col => Boolean(col.isGrandTotal) && col.key);

    if (totalColumns.length === 0) {
      console.warn('No total columns found');
      return;
    }

    totalColumns.forEach(totalColumn => {
      if (!totalColumn.key) return;

      let totalSum = 0;
      let calculatedFields: string[] = [];

      // รวมค่าจากทุก summable column
      this.columns.forEach(column => {
        const shouldInclude = (
          column.key &&
          column.showSummary &&
          !column.isGrandTotal &&
          !column.excludeFromTotal &&
          column.key !== totalColumn.key // ไม่รวมตัวเอง
        );

        if (shouldInclude) {
          const rawValue = targetNode[column.key!];
          const numericValue = this.safeParseFloat(rawValue);

          totalSum += numericValue;
          calculatedFields.push(`${column.key}: ${rawValue} (${numericValue})`);
        }
      });

      // Set ค่า Total
      targetNode[totalColumn.key] = totalSum;

      // Set totalAmount สำหรับ backward compatibility
      if (totalColumn.key === 'totalAmount') {
        targetNode.totalAmount = totalSum;
      }

      //console.log(`✅ Total ${totalColumn.key} = ${totalSum} from [${calculatedFields.join(', ')}]`);
    });
  }

  private safeParseFloat(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  private recalculateAfterEdit(): void {
    //console.log('🔄 recalculateAfterEdit started');

    // 1. คำนวณ Total columns สำหรับทุก leaf nodes ก่อน
    const recalculateLeafTotals = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children) {
          recalculateLeafTotals(node.children);
        } else if (!node.isGroupRow) {
          //console.log(`🧮 Recalculating totals for leaf node: ${node.id}`);
          this.calculateTotalColumns(node);
        }
      });
    };

    recalculateLeafTotals(this.treeData);

    // 2. คำนวณ group totals ใหม่
    const recalculateGroup = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.isGroupRow && node.children) {
          recalculateGroup(node.children);
          //console.log(`🧮 Recalculating group totals for: ${node.id}`);
          this.calculateGroupTotals(node);
        }
      });
    };

    recalculateGroup(this.treeData);

    // 3. คำนวณ grand totals ใหม่
    //console.log('🧮 Recalculating grand totals');
    this.calculateGrandTotals();

    // 4. อัปเดต visible nodes
    this.updateVisibleNodes();

    //console.log('✅ recalculateAfterEdit completed');
    //console.log('📊 Final grand total data:', this.grandTotalData);
  }

  // ===== Public Methods =====

  public refreshTreeData(): void {
    //console.log('🔄 refreshTreeData triggered');

    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();

    // Force update totals หลังจาก refresh
    setTimeout(() => {
      this.forceUpdateTotals();
    }, 10);

    //console.log('✅ refreshTreeData completed');
  }

  public forceUpdateTotals(): void {
    //console.log('🔄 forceUpdateTotals triggered');

    // Force recalculate ทุก node
    const updateAllNodes = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children) {
          updateAllNodes(node.children);
        }

        // คำนวณ total columns สำหรับทุก node (รวม group nodes)
        this.calculateTotalColumns(node);
      });
    };

    updateAllNodes(this.treeData);

    // คำนวณ grand totals
    this.calculateGrandTotals();

    // อัปเดต visible nodes
    this.updateVisibleNodes();

    //console.log('✅ forceUpdateTotals completed');
  }

  public manualRecalculate(): void {
    //console.log('🔄 Manual recalculate triggered');

    // Use robust calculation
    const updateAllNodesRobust = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children) {
          updateAllNodesRobust(node.children);
        }
        this.calculateTotalColumnsRobust(node);
      });
    };

    updateAllNodesRobust(this.treeData);

    // Recalculate grand totals with robust method
    this.calculateTotalColumnsRobust(this.grandTotalData);

    this.updateVisibleNodes();

    //console.log('✅ Manual recalculate completed');
  }

  public debugTotalColumns(): void {
    //console.group('🔍 Debug Total Columns');

    //console.log('Columns configuration:', this.columns);
    //console.log('Total columns:', this.getTotalColumns());
    //console.log('Summable columns:', this.getSummableColumns());

    // Debug leaf nodes
    const allLeafNodes: TreeNode[] = [];
    const collectLeafNodes = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.isGroupRow && node.children) {
          collectLeafNodes(node.children);
        } else if (!node.isGroupRow) {
          allLeafNodes.push(node);
        }
      });
    };

    collectLeafNodes(this.treeData);

    //console.log('Sample leaf node data:', allLeafNodes[0]);
    //console.log('Grand total data:', this.grandTotalData);

    // Test total calculation for first leaf node
    if (allLeafNodes.length > 0) {
      //console.log('Testing total calculation for first leaf node...');
      this.calculateTotalColumns(allLeafNodes[0]);
      //console.log('After calculation:', allLeafNodes[0]);
    }

    console.groupEnd();
  }

  public recalculateTotals(): void {
    this.recalculateAfterEdit();
  }

  public updateData(newData: any[]): void {
    this.data = newData;
    this.originalData = JSON.parse(JSON.stringify(newData));
    this.refreshTreeData();
  }

  // ===== Helper Methods =====

// 🔧 7. FIXED: getGrandTotalForColumn ใช้ name แทน key
getGrandTotalForColumn(column: ColumnDefinition): number {
  const fieldName = this.getColumnField(column);
  if (!fieldName || !column.showSummary) return 0;
  return this.grandTotalData[fieldName] || 0;
}


  private getLeafNodes(node: TreeNode): TreeNode[] {
    if (!node.children) return node.isGroupRow ? [] : [node];

    const leaves: TreeNode[] = [];
    node.children.forEach(child => {
      leaves.push(...this.getLeafNodes(child));
    });

    return leaves;
  }

  getChildCount(node: TreeNode): number {
    return this.getLeafNodes(node).length;
  }

  getTemplateRef(name: string): TemplateRef<any> | null {
    return this.templateMap.get(name) || null;
  }

  hasChildren(node: TreeNode): boolean {
    return Array.isArray(node?.children) && node.children.length > 0;
  }

  getNodeValue(node: TreeNode, key: string): any {
    return node[key] || '';
  }
   
  getSummaryForColumn(node: TreeNode | undefined, column: ColumnDefinition): number {
    const fieldName = this.getColumnField(column);
    if (!node || !fieldName || !column.showSummary) return 0;
  
    const summaryType = column.summaryType || 'sum';
  
    switch (summaryType) {
      case 'sum':
        return node[fieldName] || 0;
      case 'avg':
        const leafCount = this.getLeafNodes(node).length;
        return leafCount > 0 ? (node[fieldName] || 0) / leafCount : 0;
      case 'count':
        return this.getLeafNodes(node).length;
      case 'custom':
        return node[fieldName + 'Total'] || 0;
      default:
        return node[fieldName] || 0;
    }
  }

  isTotalColumn(column: ColumnDefinition): boolean {
    return Boolean(column?.isGrandTotal);
  }

  getTotalColumns(): ColumnDefinition[] {
    return this.columns?.filter(col => Boolean(col.isGrandTotal)) || [];
  }

  getSummableColumns(): ColumnDefinition[] {
    return this.columns?.filter(col =>
      Boolean(col.showSummary) &&
      !Boolean(col.isGrandTotal) &&
      !Boolean(col.excludeFromTotal) &&
      col.key !== 'amount'
    ) || [];
  }

  // ===== Event Handlers =====

  onGroupingChange(): void {
    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();

    const enabledFields = this.groupingOptions
      .filter(option => option.enabled)
      .map(option => option.field);

    this.groupingChanged.emit(enabledFields);
  }

  toggleNode(node: TreeNode, event: Event): void {
    event.stopPropagation();
    node.isExpanded = !node.isExpanded;
    this.updateVisibleNodes();
  }

  expandAll(): void {
    const setExpanded = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.isExpanded = true;
        if (node.children) {
          setExpanded(node.children);
        }
      });
    };

    setExpanded(this.treeData);
    this.updateVisibleNodes();
  }

  collapseAll(): void {
    const setCollapsed = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.isExpanded = false;
        if (node.children) {
          setCollapsed(node.children);
        }
      });
    };

    setCollapsed(this.treeData);
    this.updateVisibleNodes();
  }

  // ===== Filter Methods =====

  onFilterChange(): void {
    this.applyFilter();
    this.filterChanged.emit(this.filterText);
  }

  clearFilter(): void {
    this.filterText = '';
    this.applyFilter();
    this.filterChanged.emit('');
  }

  private applyFilter(): void {
    if (!this.filterText) {
      this.data = JSON.parse(JSON.stringify(this.originalData));
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
      return;
    }

    const filteredData = this.originalData.filter(item => this.itemMatchesFilter(item));
    this.data = filteredData;

    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();
  }

  private itemMatchesFilter(item: any): boolean {
    const searchText = this.caseSensitive ? this.filterText : this.filterText.toLowerCase();

    for (const field of this.filterFields) {
      const value = item[field];
      if (value) {
        const textValue = this.caseSensitive ? String(value) : String(value).toLowerCase();

        if (this.matchWholeWords) {
          const regex = new RegExp(`\\b${this.escapeRegExp(searchText)}\\b`, this.caseSensitive ? '' : 'i');
          if (regex.test(textValue)) return true;
        } else {
          if (textValue.includes(searchText)) return true;
        }
      }
    }

    return false;
  }

  private nodeMatchesFilter(node: TreeNode): boolean {
    if (node.originalData) {
      return this.itemMatchesFilter(node.originalData);
    }

    const searchText = this.caseSensitive ? this.filterText : this.filterText.toLowerCase();

    for (const field of this.filterFields) {
      const value = node[field];
      if (value) {
        const textValue = this.caseSensitive ? String(value) : String(value).toLowerCase();

        if (this.matchWholeWords) {
          const regex = new RegExp(`\\b${this.escapeRegExp(searchText)}\\b`, this.caseSensitive ? '' : 'i');
          if (regex.test(textValue)) return true;
        } else {
          if (textValue.includes(searchText)) return true;
        }
      }
    }

    return false;
  }

  isHighlighted(node: TreeNode): boolean {
    return this.filterText ? this.nodeMatchesFilter(node) : false;
  }

  highlightText(text: string): string {
    if (!this.filterText || !text) return text;

    const searchText = this.caseSensitive ? this.filterText : this.filterText.toLowerCase();
    const targetText = this.caseSensitive ? text : text.toLowerCase();

    if (this.matchWholeWords) {
      const regex = new RegExp(`\\b${this.escapeRegExp(searchText)}\\b`, this.caseSensitive ? 'g' : 'gi');
      return text.replace(regex, `<span class="highlight">${this.filterText}</span>`);
    } else {
      const index = targetText.indexOf(searchText);
      if (index !== -1) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + searchText.length);
        const after = text.substring(index + searchText.length);
        return `${before}<span class="highlight">${match}</span>${after}`;
      }
    }

    return text;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ===== Display Methods =====

  getRowClass(node: TreeNode): string {
    let classes = [];

    if (node.isGroupRow) {
      classes.push(`group-row-level-${node.level}`);
    } else {
      classes.push('data-row');
    }

    if (this.isHighlighted(node)) {
      classes.push('filtered-highlight');
    }

    return classes.join(' ');
  }

  getRowBackgroundColor(node: TreeNode): string {
    if (node.isGroupRow) {
      switch (node.level) {
        case 0: return '#e3f2fd';
        case 1: return '#f3e5f5';
        case 2: return '#e8f5e8';
        default: return '#f8f9fa';
      }
    }
    return '#ffffff';
  }

  private updateVisibleNodes(): void {
    this.flattenedNodes = [];
    this.visibleNodes = [];

    const processNode = (node: TreeNode, parent?: TreeNode, isVisible: boolean = true) => {
      node.parent = parent;
      this.flattenedNodes.push(node);

      if (isVisible) {
        this.visibleNodes.push(node);
      }

      if (node.children && node.isExpanded) {
        node.children.forEach((child, idx) => {
          child.isLastChild = idx === node.children!.length - 1;
          processNode(child, node, isVisible);
        });
      }
    };

    this.treeData.forEach(node => processNode(node));
  }

  // ===== Formatting Methods =====

  formatValue(value: any, column: ColumnDefinition): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    switch (column.format) {
      case NgTreeTable3Format.number:
        return this.formatNumber(value);

      case NgTreeTable3Format.million:
        return this.formatMillion(value);

      case NgTreeTable3Format.datetime:
        return this.formatDateTime(value);

      case NgTreeTable3Format.date:
        return this.formatDate(value);

      case NgTreeTable3Format.other:
        return String(value);

      default:
        return String(value);
    }
  }

  formatDisplayValue(node: TreeNode, column: ColumnDefinition): string {
    const fieldName = this.getColumnField(column);
    if (!fieldName) return '';
  
    const rawValue = this.getNodeValue(node, fieldName);
    const formattedValue = this.formatValue(rawValue, column);
  
    if (column.filterable && this.filterText) {
      return this.highlightText(formattedValue);
    }
  
    return formattedValue;
  }

  private formatNumber(value: any, decimals: number = 2): string {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);

    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  private formatMillion(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);

    const millions = num / 1000000;
    return millions.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private formatDateTime(value: any): string {
    if (!value) return '';

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return String(value);
    }
  }

  private formatDate(value: any): string {
    if (!value) return '';

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return String(value);
    }
  }

  // ===== Cell Editing Methods =====

  onCellDoubleClick(node: TreeNode, column: ColumnDefinition, event: Event): void {
    const fieldName = this.getColumnField(column);
    if (!this.allowCellEdit || node.isGroupRow || !column.editable || !fieldName) {
      return;
    }
  
    if (this.editingCell) {
      this.cancelEdit();
    }
  
    event.stopPropagation();
  
    const currentValue = node[fieldName];
  
    this.editingCell = {
      nodeId: node.id,
      columnKey: fieldName
    };
  
    this.originalEditValue = currentValue;
    this.editingValue = typeof currentValue === 'number' ? currentValue : 0;
  
    setTimeout(() => {
      const inputElement = this.elementRef.nativeElement.querySelector('.edit-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 50);
  }
  ssaveEdit(): void {
    if (!this.editingCell || this.editingValue === null) {
      return;
    }
  
    const node = this.findNodeById(this.editingCell.nodeId);
    const column = this.columns.find(col => this.getColumnField(col) === this.editingCell!.columnKey);
  
    if (!node || !column) {
      console.warn('Cannot save edit: node or column not found');
      this.cancelEdit();
      return;
    }
  
    const fieldName = this.getColumnField(column);
    if (!fieldName) {
      console.warn('Cannot save edit: no field name');
      this.cancelEdit();
      return;
    }
  
    const oldValue = this.originalEditValue;
    const newValue = this.editingValue;
  
    if (isNaN(newValue) || !isFinite(newValue)) {
      console.warn('Invalid number value:', newValue);
      this.cancelEdit();
      return;
    }
  
    if (oldValue !== newValue) {
      try {
        node[fieldName] = newValue;
  
        if (node.originalData) {
          node.originalData[fieldName] = newValue;
        }
  
        const dataItem = this.data.find(item => item.id === node.originalData?.id);
        if (dataItem) {
          dataItem[fieldName] = newValue;
        }
  
        const originalDataItem = this.originalData.find(item => item.id === node.originalData?.id);
        if (originalDataItem) {
          originalDataItem[fieldName] = newValue;
        }
  
        this.calculateTotalColumns(node);
  
        if (node.originalData) {
          const totalColumns = this.columns.filter(col => col.isGrandTotal && this.getColumnField(col));
          totalColumns.forEach(totalCol => {
            const totalFieldName = this.getColumnField(totalCol);
            if (totalFieldName && node[totalFieldName] !== undefined) {
              node.originalData[totalFieldName] = node[totalFieldName];
  
              if (dataItem) {
                dataItem[totalFieldName] = node[totalFieldName];
              }
  
              if (originalDataItem) {
                originalDataItem[totalFieldName] = node[totalFieldName];
              }
            }
          });
        }
  
        if (node.originalData) {
          this.trackNodeChange(node.id, node.originalData);
        }
  
        this.recalculateAfterEdit();
  
        const editEvent: CellEditEvent = {
          node: node,
          column: column,
          oldValue: oldValue,
          newValue: newValue,
          field: fieldName
        };
  
        this.cellValueChanged.emit(editEvent);
        this.addCellUpdateAnimation(node.id, fieldName);
  
      } catch (error) {
        console.error('Error saving edit:', error);
        if (node && fieldName) {
          node[fieldName] = oldValue;
        }
      }
    }
  
    this.cancelEdit();
  }
  
  
  

  cancelEdit(): void {
    this.editingCell = null;
    this.editingValue = null;
    this.originalEditValue = null;
  }

  private findNodeById(nodeId: string): TreeNode | null {
    const findInNodes = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node;
        }
        if (node.children) {
          const found = findInNodes(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInNodes(this.treeData);
  }

  private addCellUpdateAnimation(nodeId: string, columnKey: string): void {
    setTimeout(() => {
      const rowElement = this.elementRef.nativeElement.querySelector(`tr[data-node-id="${nodeId}"]`);
      if (!rowElement) {
        console.warn(`Row with node ID ${nodeId} not found for animation`);
        return;
      }
  
      // 🔧 ใช้ getVisibleColumns() แทน this.columns
      const visibleColumns = this.getVisibleColumns();
      const columnIndex = visibleColumns.findIndex(col => this.getColumnField(col) === columnKey);
      if (columnIndex === -1) {
        console.warn(`Column ${columnKey} not found in visible columns for animation`);
        return;
      }
  
      // หา cell element (description column + column index)
      const cellElement = rowElement.querySelector(`td:nth-child(${columnIndex + 2})`);
  
      if (cellElement) {
        cellElement.classList.add('cell-updated');
        setTimeout(() => {
          cellElement.classList.remove('cell-updated');
        }, 1000);
      } else {
        console.warn(`Cell element not found for animation`);
      }
    }, 100);
  }

  // ===== Deprecated Methods (for backward compatibility) =====

  /**
   * @deprecated ใช้ refreshTreeData() แทน
   */
  public updateNode(): void {
    console.warn('updateNode() is deprecated. Use refreshTreeData() instead.');
    this.refreshTreeData();
  }

  private trackNodeChange(nodeId: string, originalData: any): void {
    this.changedNodeIds.add(nodeId);
    this.changedNodesData.set(nodeId, { ...originalData });
  }

   /**
   * Get only leaf nodes (non-group) that have been changed
   * @returns Array of original data for changed leaf nodes only
   */
   public getChangedLeafNodes(): any[] {
    const changedLeafNodes: any[] = [];

    this.changedNodeIds.forEach(nodeId => {
      const node = this.findNodeById(nodeId);
      const nodeData = this.changedNodesData.get(nodeId);
      
      if (node && nodeData && !node.isGroupRow) {
        changedLeafNodes.push(nodeData);
      }
    });

    return changedLeafNodes;
  }

   // ===== 4. 🆕 เพิ่ม public method clearChangedNodes =====
  
  /**
   * Clear all tracked changes
   */
  public clearChangedNodes(): void {
    this.changedNodeIds.clear();
    this.changedNodesData.clear();
  }

  private groupByAccountCode(items: any[]): TreeNode[] {
    // ตรวจสอบว่ามีฟิลด์รหัสบัญชีหรือไม่
    const codeField = this.findAccountCodeField();
    if (!codeField) {
      console.warn('ไม่พบฟิลด์รหัสบัญชี กรุณาระบุ code หรือ Code ในข้อมูล');
      return items.map((item, index) => this.createLeafNode(item, index));
    }
    
    // ค้นหาฟิลด์ที่น่าจะเป็นชื่อบัญชี
    const nameField = this.findAccountNameField();
  
    // สร้าง group structure ตามหลักของรหัสบัญชี
    const groupedStructure = this.buildAccountCodeGroups(items, codeField, nameField);
    
    // แปลงโครงสร้าง group เป็น TreeNode[]
    return this.convertGroupStructureToNodes(groupedStructure, 0);
  }
  
  // ค้นหาฟิลด์ที่น่าจะเป็นรหัสบัญชี
  private findAccountCodeField(): string | null {
    // รายชื่อฟิลด์ที่อาจเป็นรหัสบัญชี
    const possibleCodeFields = ['code', 'Code', 'accountCode', 'AccountCode', 'account_code'];
    
    // ตรวจสอบจากข้อมูลแรก
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      
      // ค้นหาฟิลด์ที่มีค่าที่ดูเหมือนรหัสบัญชี (ตัวเลขที่มีความยาว >= 5)
      for (const field of possibleCodeFields) {
        if (firstItem[field] && 
            typeof firstItem[field] === 'string' && 
            /^\d{5,}$/.test(firstItem[field])) {
          return field;
        }
      }
      
      // ถ้าไม่พบจากรูปแบบ ก็ลองเลือกฟิลด์ที่มีชื่อที่น่าจะเป็นรหัสบัญชี
      for (const field of possibleCodeFields) {
        if (firstItem[field]) {
          return field;
        }
      }
    }
    
    return null;
  }
  
  // ค้นหาฟิลด์ที่น่าจะเป็นชื่อบัญชี
  private findAccountNameField(): string | null {
    // รายชื่อฟิลด์ที่อาจเป็นชื่อบัญชี
    const possibleNameFields = [
      'accountNameThai', 'AccountNameThai', 
      'accountName', 'AccountName', 
      'name', 'Name', 
      'description', 'Description'
    ];
    
    // ตรวจสอบจากข้อมูลแรก
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      
      // ค้นหาฟิลด์ที่มีค่าที่ดูเหมือนชื่อบัญชี
      for (const field of possibleNameFields) {
        if (firstItem[field] && typeof firstItem[field] === 'string') {
          return field;
        }
      }
    }
    
    return null;
  }
  
  // สร้างโครงสร้าง group ตามหลักของรหัสบัญชี
  private buildAccountCodeGroups(items: any[], codeField: string, nameField: string | null): any {
    const groupStructure: any = {
      children: {},
      items: []
    };
    
    // สร้าง map เก็บชื่อบัญชีของแต่ละรหัส
    const accountNamesMap: {[code: string]: string} = {};
    
    // เก็บชื่อบัญชีทั้งหมดที่มีในข้อมูล
    if (nameField) {
      items.forEach(item => {
        const code = item[codeField];
        const name = item[nameField];
        if (code && name) {
          accountNamesMap[code] = name;
        }
      });
    }
    
    items.forEach(item => {
      const code = item[codeField] || '';
      
      // ข้ามรายการที่ไม่มีรหัส
      if (!code) {
        groupStructure.items.push(item);
        return;
      }
      
      // แยกกลุ่มตามหลักของรหัสบัญชี
      // เช่น 1020101008 จะแยกเป็น 1, 10, 102, 1020, ...
      let currentGroup = groupStructure;
      let currentCode = '';
      
      // กำหนดจำนวนหลักในการแบ่งกลุ่ม (ปรับตามความเหมาะสม)
      // ตัวอย่างนี้แบ่งตามความยาวของรหัส: 1, 2, 3, 5, ทั้งหมด
      const codeLength = code.length;
      const segmentLengths = [];
      
      // ถ้ารหัสยาว 10 หลัก (เช่น 1000000000)
      if (codeLength >= 10) {
        segmentLengths.push(1, 2, 3, 5, 7, 10);
      } 
      // ถ้ารหัสยาว 8 หลัก
      else if (codeLength >= 8) {
        segmentLengths.push(1, 2, 4, 6, 8);
      }
      // ถ้ารหัสยาว 6 หลัก
      else if (codeLength >= 6) {
        segmentLengths.push(1, 2, 4, 6);
      }
      // ถ้ารหัสยาว 4 หลัก
      else if (codeLength >= 4) {
        segmentLengths.push(1, 2, 4);
      }
      // ถ้ารหัสสั้นกว่า 4 หลัก
      else {
        segmentLengths.push(1, codeLength);
      }
      
      for (const length of segmentLengths) {
        if (length > code.length) continue;
        
        const segment = code.substring(0, length);
        currentCode = segment;
        
        if (!currentGroup.children[segment]) {
          // หาชื่อกลุ่มจาก accountNamesMap หรือใช้รหัสถ้าไม่พบ
          let groupDescription = `รหัสบัญชี ${segment}`;
          
          // หาชื่อบัญชีจาก prefix matching
          const matchingCodes = Object.keys(accountNamesMap).filter(key => 
            key.startsWith(segment) && key.length > segment.length
          );
          
          // ถ้ามีรหัสที่ตรงกับ segment โดยตรง ใช้ชื่อนั้น
          if (accountNamesMap[segment]) {
            groupDescription = accountNamesMap[segment];
          } 
          // ถ้าไม่มี ใช้ชื่อจากรหัสที่ขึ้นต้นด้วย segment (ถ้ามี)
          else if (matchingCodes.length > 0) {
            // เลือกรหัสที่สั้นที่สุดที่ขึ้นต้นด้วย segment
            const shortestCode = matchingCodes.sort((a, b) => a.length - b.length)[0];
            groupDescription = `${segment} - ${accountNamesMap[shortestCode]}`;
          }
          
          currentGroup.children[segment] = {
            code: segment,
            level: length,
            description: groupDescription,
            children: {},
            items: []
          };
        }
        
        currentGroup = currentGroup.children[segment];
      }
      
      // เพิ่มรายการลงในกลุ่มสุดท้าย
      currentGroup.items.push(item);
    });
    
    return groupStructure;
  }
  
  // แปลงโครงสร้าง group เป็น TreeNode[]
  private convertGroupStructureToNodes(groupStructure: any, level: number): TreeNode[] {
    const result: TreeNode[] = [];
    
    // เพิ่ม child nodes ของแต่ละกลุ่ม
    Object.keys(groupStructure.children).forEach((key, index) => {
      const group = groupStructure.children[key];
      
      // สร้าง group node
      const groupNode: TreeNode = {
        id: `group-account-${level}-${index}-${group.code}`,
        code: group.code,
        description: group.description,
        amount: 0, // จะถูกคำนวณใน calculateGroupTotals
        level: level,
        isExpanded: level === 0, // เปิดเฉพาะระดับบนสุด
        isGroupRow: true,
        groupValue: group.code,
        children: []
      };
      
      // เพิ่ม children
      groupNode.children = [
        ...this.convertGroupStructureToNodes(group, level + 1),
        ...group.items.map((item: any, idx: number) => this.createLeafNode(item, idx, level + 1))
      ];
      
      this.calculateGroupTotals(groupNode);
      result.push(groupNode);
    });
    
    // เพิ่มรายการที่ไม่ได้อยู่ในกลุ่มใด
    const leafNodes = groupStructure.items.map((item: any, idx: number) => 
      this.createLeafNode(item, idx, level)
    );
    
    return [...result, ...leafNodes];
  }
}