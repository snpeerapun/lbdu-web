import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, SimpleChanges, OnInit, OnChanges, ContentChild, TemplateRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export enum NgTreeAccountFormat {
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
  name?: string;
  title?: string;
  header?: string;
  width?: string;
  class?: string;
  template?: string;
  filterable?: boolean;
  showSummary?: boolean;
  summaryType?: 'sum' | 'avg' | 'count' | 'custom';
  summaryTemplate?: string;
  format?: NgTreeAccountFormat;
  editable?: boolean;
  isGrandTotal?: boolean;
  excludeFromTotal?: boolean;
  isGroup?: boolean;
  sort?: boolean;
}

export interface GroupingOption {
  field: string;
  label: string;
  enabled: boolean;
}

// 🆕 Interface สำหรับ Account Tree Configuration
export interface AccountTreeConfig {
  codeField?: string;           // ฟิลด์รหัสบัญชี (เช่น 'Code')
  nameField?: string;           // ฟิลด์ชื่อบัญชี (เช่น 'NameThai')
  segmentLengths?: number[];    // ความยาวของแต่ละ level (เช่น [1,3,5,7,10])
  autoDetectSegments?: boolean; // ตรวจจับ segments อัตโนมัติ
  expandLevels?: number;        // จำนวน level ที่จะเปิดอัตโนมัติ
}

@Component({
  selector: 'ng-tree-account',
  template: `
 <div class="">
  <!-- Tree Controls -->
  <div class="tree-controls mb-3" *ngIf="showGroupingControls">
    <div class="row">
      <div class="col-md-12 text-end">
        <button class="btn btn-sm btn-outline-secondary me-2" (click)="expandAll()" type="button">
          <i class="fas fa-expand-arrows-alt"></i> Expand All
        </button>
        <button class="btn btn-sm btn-outline-secondary" (click)="collapseAll()" type="button">
          <i class="fas fa-compress-arrows-alt"></i> Collapse All
        </button>
      </div>
    </div>
  </div>

  <!-- Account Tree Info -->
  <div class="account-tree-info mb-3" *ngIf="useAccountCodeTree && showTreeInfo">
    <div class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      <strong>Account Tree Structure:</strong> 
      Code Field: <code>{{ accountTreeConfig.codeField }}</code>, 
      Name Field: <code>{{ accountTreeConfig.nameField }}</code>
      <span *ngIf="detectedSegments.length > 0">
        , Segments: <code>{{ detectedSegments.join(', ') }}</code>
      </span>
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
              
              <!-- Account Name Display for all nodes -->
              <span class="account-name" [class.fw-bold]="node.isGroupRow">
                <span [innerHTML]="highlightText(node.description)"></span>
                
              </span>
            </div>
          </td>
          
          <!-- Data Columns -->
<!-- Data Columns -->
<ng-container *ngFor="let column of getVisibleColumns()">
  <td [ngClass]="column.class || ''" 
      [class.editable-cell]="allowCellEdit && column.editable && !node.isGroupRow"
      (dblclick)="onCellDoubleClick(node, column, $event)">
    
    <!-- Account Code Column - แสดงเฉพาะ code โดยไม่มี summary -->
    <ng-container *ngIf="getColumnField(column) === 'code'">
      <span class="account-code" [innerHTML]="highlightText(node.code || '')"></span>
    </ng-container>
    
    <!-- Regular Data Columns -->
    <ng-container *ngIf="getColumnField(column) !== 'code'">
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
    </ng-container>
  </td>
</ng-container> 
        </tr>
      </ng-container>
              
      <!-- Grand Total Summary Row -->
      <tr *ngIf="showGrandTotal && visibleNodes.length > 0" class="grand-total-row">
        <td class="fw-bold text-uppercase total-text" style="padding-left: 12px;">
          <i class="fas fa-calculator me-2"></i>
          รวมทั้งหมด
        </td>
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
    
    .tree-controls {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #dee2e6;
    }
    
    /* 🆕 Account Tree Styles */
    .account-tree-info {
      border-radius: 5px;
    }
    
    
    
    .account-name {
      color: #495057;
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
    
    /* 🆕 Account Tree Level Styles */
    .account-tree-level-0 {
      background-color: #e3f2fd !important;
      color: #1565c0;
      font-weight: 700;
      font-size: 1.1em;
    }
    .account-tree-level-1 {
      background-color: #f3e5f5 !important;
      color: #7b1fa2;
      font-weight: 600;
    }
    .account-tree-level-2 {
      background-color: #e8f5e8 !important;
      color: #388e3c;
      font-weight: 600;
    }
    .account-tree-level-3 {
      background-color: #fff3e0 !important;
      color: #f57c00;
      font-weight: 500;
    }
    .account-tree-level-4 {
      background-color: #fce4ec !important;
      color: #c2185b;
      font-weight: 500;
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
      min-width: 20px;
      border-color: #0a7c76;
      height:30px;
      box-shadow:none;
    }
     
    .edit-input:focus {
      border-color: #0a7c76;
      box-shadow:none;
      border: 2px solid #0a7c76 !important;
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
export class NgTreeAccountComponent implements AfterViewInit, OnInit, OnChanges {
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
  @Input() filterFields: string[] = ['description', 'code','nameThai','nameEng'];
  @Input() caseSensitive = false;
  @Input() matchWholeWords = false;
  @Input() allowCellEdit = false;
  @Input() trackBy: TrackByFunction<TreeNode> | undefined;
  @Input() customGroupingOptions?: GroupingOption[];
  @Input() fieldLabelMap?: { [key: string]: string };
  
  // 🆕 Account Tree Properties
  @Input() accountTreeConfig: AccountTreeConfig = {
    codeField: 'Code',
    nameField: 'NameEng', 
    autoDetectSegments: true,
    expandLevels: 2
  };
  @Input() useAccountCodeTree: boolean = true;  // เปลี่ยนเป็น true เป็น default
  @Input() hideAccountTreeOption: boolean = true;  // ซ่อน option
  @Input() showTreeInfo: boolean = false;  // ซ่อน tree info

  @Output() filterChanged = new EventEmitter<string>();
  @Output() groupingChanged = new EventEmitter<string[]>();
  @Output() cellValueChanged = new EventEmitter<CellEditEvent>();
  @Output() accountTreeModeChanged = new EventEmitter<boolean>();

  @ContentChild('action') actionTemplate?: TemplateRef<any>;
  @ContentChild('summary') summaryTemplate?: TemplateRef<any>;

  // 🆕 Account Tree Internal Properties
  private accountCodeMap: Map<string, any> = new Map();
  detectedSegments: number[] = [];

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
    console.log('🚀 NgTreeAccount initializing with data:', this.data);
    console.log('🔧 Columns:', this.columns);
    console.log('🌳 Account Tree Config:', this.accountTreeConfig);
    
    if (!this.validateData()) {
      console.error('❌ Invalid data structure detected');
      return;
    }
  
    this.originalData = JSON.parse(JSON.stringify(this.data));
    this.initializeAccountTreeConfig();
    this.initializeGroupingOptions();
    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();
    
    console.log('✅ Initialization complete. Visible nodes:', this.visibleNodes.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle data changes
    if (changes['data'] && changes['data'].currentValue !== changes['data'].previousValue) {
      this.originalData = JSON.parse(JSON.stringify(this.data));
      this.initializeAccountTreeConfig();
      this.buildTreeData();
      this.calculateGrandTotals();
      this.applyFilter();
    }
  
    // Handle columns changes
    if (changes['columns'] && changes['columns'].currentValue !== changes['columns'].previousValue) {
      console.log('🔄 Columns changed, reinitializing grouping options');
      this.initializeGroupingOptions();
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
    }
  
    // 🆕 Handle account tree config changes
    if (changes['accountTreeConfig'] && changes['accountTreeConfig'].currentValue !== changes['accountTreeConfig'].previousValue) {
      this.initializeAccountTreeConfig();
      if (this.useAccountCodeTree) {
        this.buildTreeData();
        this.calculateGrandTotals();
        this.updateVisibleNodes();
      }
    }

    // 🆕 Handle useAccountCodeTree changes
    if (changes['useAccountCodeTree'] && changes['useAccountCodeTree'].currentValue !== changes['useAccountCodeTree'].previousValue) {
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
  }

  ngAfterViewInit(): void {
    if (this.actionTemplate) {
      this.templateMap.set('action', this.actionTemplate);
    }
    if (this.summaryTemplate) {
      this.templateMap.set('summary', this.summaryTemplate);
    }
  }

  // ===== 🆕 Account Tree Methods =====

  /**
   * Initialize Account Tree Configuration
   */
  private initializeAccountTreeConfig(): void {
    // Set default config if not provided
    if (!this.accountTreeConfig.codeField) {
      this.accountTreeConfig.codeField = this.detectAccountCodeField();
    }
    if (!this.accountTreeConfig.nameField) {
      this.accountTreeConfig.nameField = this.detectAccountNameField();
    }

    console.log('🌳 Account Tree Config:', this.accountTreeConfig);

    // Build account code mapping
    this.buildAccountCodeMap();

    // Auto-detect segments if enabled
    if (this.accountTreeConfig.autoDetectSegments) {
      this.detectedSegments = this.autoDetectSegmentLengths();
    } else if (this.accountTreeConfig.segmentLengths) {
      this.detectedSegments = [...this.accountTreeConfig.segmentLengths];
    }

    console.log('📊 Detected Segments:', this.detectedSegments);
  }

  /**
   * Auto-detect account code field from data
   */
  private detectAccountCodeField(): string {
    const possibleFields = ['Code', 'code', 'AccountCode', 'accountCode', 'account_code'];
    
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      for (const field of possibleFields) {
        if (firstItem[field] && typeof firstItem[field] === 'string') {
          console.log(`✅ Detected code field: ${field}`);
          return field;
        }
      }
    }
    
    console.warn('⚠️ No suitable code field detected, using default: Code');
    return 'Code';
  }

  /**
   * Auto-detect account name field from data
   */
  private detectAccountNameField(): string {
    const possibleFields = ['NameThai', 'NameEng', 'Name', 'name', 'description', 'Description', 'AccountName'];
    
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      for (const field of possibleFields) {
        if (firstItem[field] && typeof firstItem[field] === 'string') {
          console.log(`✅ Detected name field: ${field}`);
          return field;
        }
      }
    }
    
    console.warn('⚠️ No suitable name field detected, using default: NameThai');
    return 'NameThai';
  }

  /**
   * Build account code mapping for quick lookup
   */
  private buildAccountCodeMap(): void {
    this.accountCodeMap.clear();
    
    if (!this.accountTreeConfig.codeField || !this.accountTreeConfig.nameField) {
      console.warn('⚠️ Code or Name field not configured for account tree');
      return;
    }

    // สร้าง mapping เฉพาะบัญชีที่มีในข้อมูลจริงเท่านั้น
    this.data.forEach(item => {
      const code = item[this.accountTreeConfig.codeField!];
      if (code) {
        this.accountCodeMap.set(code, item);
      }
    });

    console.log(`📋 Built account code map with ${this.accountCodeMap.size} entries`);
  }

  /**
   * Auto-detect segment lengths based on account codes - ปรับให้ flexible มากขึ้น
   */
  private autoDetectSegmentLengths(): number[] {
    if (this.accountCodeMap.size === 0) {
      return [1, 3, 5, 7, 10];
    }

    const codes = Array.from(this.accountCodeMap.keys());
    const codeLengths = codes.map(code => code.length);
    const uniqueLengths = [...new Set(codeLengths)].sort((a, b) => a - b);

    console.log('📏 Detected code lengths:', uniqueLengths);
    
    // ใช้ความยาวที่พบจริงในข้อมูล
    return uniqueLengths;
  }

  /**
   * Event handler for account tree mode change
   */
  onAccountTreeModeChange(): void {
    console.log(`🌳 Account tree mode changed: ${this.useAccountCodeTree}`);
    
    // Disable other grouping options when account tree is enabled
    if (this.useAccountCodeTree) {
      this.groupingOptions.forEach(option => option.enabled = false);
    }

    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();

    this.accountTreeModeChanged.emit(this.useAccountCodeTree);
  }

  /**
   * Build account code tree structure - ใช้หลักการเดียวกับ NgTreeTableComponent
   */
  private buildAccountCodeTree(): TreeNode[] {
    if (!this.accountTreeConfig.codeField || !this.accountTreeConfig.nameField) {
      console.error('❌ Account tree configuration incomplete');
      return [];
    }

    console.log('🔧 Building account tree using NgTreeTable logic...');
    
    if (!this.data || this.data.length === 0) {
      console.warn('⚠️ No data available for tree building');
      return [];
    }

    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // First pass: Create nodes and determine levels (same as NgTreeTable logic)
    this.data.forEach(item => {
      const code = item[this.accountTreeConfig.codeField!];
      const nameThai = item[this.accountTreeConfig.nameField!];
      
      if (!code) return;

      const level = this.getNodeLevel(code);
      const node: TreeNode = {
        id: item.id?.toString() || `account-${code}`,
        code: code,
        description: nameThai || `Account ${code}`,
        amount: item.amount || 0,
        level: level,
        children: [],
        originalData: item,
        isExpanded: level <= 1, // Automatically expand first two levels
        isGroupRow: false, // Will be determined later
        ...item
      };
      
      map.set(code, node);
      if (level === 0) {
        roots.push(node);
      }
      
      //console.log(`✅ Created node: ${code} (Level ${level}) - ${nameThai}`);
    });

    //console.log(`📋 Created ${map.size} nodes, ${roots.length} root nodes`);

    // Second pass: Build hierarchy based on code (same as NgTreeTable logic)
    this.data.forEach(item => {
      const code = item[this.accountTreeConfig.codeField!];
      if (!code) return;

      const level = this.getNodeLevel(code);
      if (level > 0) {
        const parentCode = this.getParentCode(code, level);
        const parent = map.get(parentCode);
        const node = map.get(code);
        
        if (parent && node) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
          node.parent = parent;
          
          // Mark parent as group row if it has children
          parent.isGroupRow = true;
          
          console.log(`🔗 Added ${code} as child of ${parentCode}`);
        } else if (level > 0) {
          console.warn(`⚠️ Parent ${parentCode} not found for ${code}`);
        }
      }
    });

    // Sort all nodes by code (same as NgTreeTable logic)
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.code.localeCompare(b.code));
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };
    
    sortNodes(roots);

    console.log(`🌳 Final hierarchy with ${roots.length} root nodes:`);
    roots.slice(0, 3).forEach(root => this.debugPrintTree(root, 0));

    // Calculate totals
    this.calculateAccountTreeTotals(roots);

    console.log(`✅ Built account tree successfully`);
    return roots;
  }

  /**
   * Get node level based on code (same logic as NgTreeTable)
   */
  private getNodeLevel(code: string): number {
    if (!code) return 0;
    const significantCode = code.replace(/0+$/, ''); // Remove trailing zeros
    
    if (significantCode.length <= 1) return 0;  // Level 0: 1 digit (e.g., "1")
    if (significantCode.length <= 3) return 1;  // Level 1: 3 digits (e.g., "101")
    if (significantCode.length <= 5) return 2;  // Level 2: 5 digits (e.g., "10101")
    if (significantCode.length <=7)  return 3;  // Level 2: 5 digits (e.g., "1010100")
    return 4;  // Level 3: more than 5 digits
  }

  /**
   * Get parent code for given level (same logic as NgTreeTable)
   */
  private getParentCode(code: string, level: number): string {
    switch(level) {
      case 1: return code.substring(0, 1) + '000000000';  // "1010000000" -> "1000000000"
      case 2: return code.substring(0, 3) + '0000000';    // "1010100000" -> "1010000000"
      case 3: return code.substring(0, 5) + '00000';      // "1010101000" -> "1010100000"
      case 4: return code.substring(0, 7) + '000';        // "101010101000" -> "1010101000"
      default: return '';
    }
  }

  /**
   * Debug helper to print tree structure
   */
  private debugPrintTree(node: TreeNode, depth: number = 0): void {
    const indent = '  '.repeat(depth);
    const nodeType = node.isGroupRow ? '📁' : '📄';
    console.log(`${indent}${nodeType} ${node.code} - ${node.description} (Level: ${node.level})`);
    
    if (node.children) {
      node.children.forEach(child => this.debugPrintTree(child, depth + 1));
    }
  }

  /**
   * Get appropriate name for a segment
   */
  private getSegmentName(segmentCode: string, fullName: string, isLeaf: boolean): string {
    if (isLeaf) {
      return fullName || `Account ${segmentCode}`;
    }

    // สำหรับ group nodes, ใช้ชื่อจากบัญชีที่มีรหัสตรงกันโดยตรงเท่านั้น
    const exactMatch = this.accountCodeMap.get(segmentCode);
    if (exactMatch && exactMatch[this.accountTreeConfig.nameField!]) {
      return exactMatch[this.accountTreeConfig.nameField!];
    }

    // ถ้าไม่พบข้อมูลที่ตรงกัน ให้ return null เพื่อไม่สร้าง node นี้
    return `บัญชีกลุ่ม ${segmentCode}`;
  }

  /**
   * Extract meaningful group name from child account name
   */
  private extractGroupNameFromChild(childName: string, segmentCode: string): string {
    // Simple logic to extract parent group name
    // This can be customized based on naming conventions
    
    if (childName.includes('-')) {
      return childName.split('-')[0].trim();
    }
    
    // For Thai names, try to extract the main category
    const words = childName.split(' ');
    if (words.length > 1) {
      return words.slice(0, Math.min(2, words.length)).join(' ');
    }

    return `กลุ่ม ${segmentCode}`;
  }

  /**
   * Find parent code for a given segment
   */
  private findParentCode(segmentCode: string, currentLevel: number): string | null {
    if (currentLevel === 0) return null;
    
    const parentLength = this.detectedSegments[currentLevel - 1];
    if (segmentCode.length <= parentLength) return null;
    
    return segmentCode.substring(0, parentLength);
  }

  /**
   * Calculate totals for account tree nodes
   */
  private calculateAccountTreeTotals(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // Recursively calculate child totals first
        this.calculateAccountTreeTotals(node.children);
        
        // Calculate this node's totals from children
        node.amount = 0;
        
        // Initialize summary columns
        this.columns.forEach(column => {
          const fieldName = this.getColumnField(column);
          if (fieldName && column.showSummary) {
            node[fieldName] = 0;
          }
        });

        // Sum from children
        node.children.forEach(child => {
          if (child.originalData || !child.isGroupRow) {
            node.amount += child.amount || 0;
            
            this.columns.forEach(column => {
              const fieldName = this.getColumnField(column);
              if (fieldName && column.showSummary) {
                const childValue = child[fieldName] || child.originalData?.[fieldName] || 0;
                node[fieldName] = (node[fieldName] || 0) + childValue;
              }
            });
          } else {
            // Child is also a group, add its totals
            node.amount += child.amount || 0;
            
            this.columns.forEach(column => {
              const fieldName = this.getColumnField(column);
              if (fieldName && column.showSummary) {
                const childValue = child[fieldName] || 0;
                node[fieldName] = (node[fieldName] || 0) + childValue;
              }
            });
          }
        });

        // Calculate total columns
        this.calculateTotalColumns(node);
      } else if (node.originalData) {
        // Leaf node - calculate total columns
        this.calculateTotalColumns(node);
      }
    });
  }

  // ===== Initialization Methods =====

  private validateData(): boolean {
    console.log('🔍 Validating data...');
    
    if (!Array.isArray(this.data)) {
      console.error('❌ Data must be an array, received:', typeof this.data, this.data);
      return false;
    }

    if (this.data.length === 0) {
      console.warn('⚠️ Data array is empty');
      return false;
    }

    if (!Array.isArray(this.columns)) {
      console.error('❌ Columns must be an array, received:', typeof this.columns, this.columns);
      return false;
    }

    console.log('✅ Data validation passed');
    console.log(`📊 Data items: ${this.data.length}`);
    console.log(`🏛️ Columns: ${this.columns.length}`);

    // Check for multiple total columns
    const totalColumns = this.getTotalColumns();
    if (totalColumns.length > 1) {
      console.warn('⚠️ Multiple total columns detected:', totalColumns.map(col => col.key));
    }

    // Log sample data
    if (this.data.length > 0) {
      console.log('📝 Sample data item:', this.data[0]);
    }

    return true;
  }

  private initializeGroupingOptions(): void {
    // เนื่องจากไม่ใช้ grouping options แล้ว จึงตั้งค่าเป็น array ว่าง
    this.groupingOptions = [];
    console.log('✅ Grouping options disabled - using account tree only');
  }

  // ===== Tree Building Methods =====

  private buildTreeData(): void {
    console.log('🏗️ Building tree data...');
    
    if (!this.data || this.data.length === 0) {
      console.warn('⚠️ No data to build tree from');
      this.treeData = [];
      return;
    }

    console.log('📊 Input data for tree building:', this.data);

    // ใช้ account code tree เสมอ
    this.treeData = this.buildAccountCodeTree();
    
    console.log('🌳 Final tree data:', this.treeData);
    console.log(`📈 Tree nodes created: ${this.treeData.length}`);
  }

  // Helper method for filtering visible columns
  getVisibleColumns(): ColumnDefinition[] {
    const enabledGroupFields = this.getEnabledGroupFields();
    
    // Filter columns that are not used as group fields
    let filteredColumns = this.columns.filter(column => {
      const fieldName = this.getColumnField(column);
      return !enabledGroupFields.includes(fieldName) || enabledGroupFields.length === 0;
    });
    
    // *** เพิ่ม Account Code column เป็นคอลัมน์แรกเสมอ (ถ้าใช้ account tree) ***
    if (this.useAccountCodeTree) {
      const accountCodeColumn: ColumnDefinition = {
        key: 'accountCode',
        name: 'code',
        title: 'Account Code',
        header: 'Account Code',
        width: '150px',
        class: 'account-code text-start',
        filterable: true,
        showSummary: false,
        editable: false,
        sort: true
      };
      
      // ตรวจสอบว่ามี account code column อยู่แล้วหรือไม่
      const hasAccountCodeColumn = filteredColumns.some(col => 
        this.getColumnField(col) === 'code' || col.key === 'accountCode'
      );
      
      if (!hasAccountCodeColumn) {
        filteredColumns = [accountCodeColumn, ...filteredColumns];
      }
    }
    
    return filteredColumns;
  }

  // Helper method for table colspan
  getTableColspan(): number {
    return this.getVisibleColumns().length + 1; // +1 for description column
  }

  // Helper methods for column properties
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
    
    // Find first column that has key/name
    const firstColumn = this.columns[0];
    return firstColumn.key || firstColumn.name || null;
  }
  
  // Helper method for getting enabled group fields
  private getEnabledGroupFields(): string[] {
    return this.groupingOptions
      .filter(option => option.enabled)
      .map(option => option.field);
  }

  private createLeafNode(item: any, index: number, level: number = 0): TreeNode {
    // ใช้ชื่อบัญชีเป็นหลัก ไม่แสดงรหัส
    let nodeDescription = '';
    let nodeCode = '';
    
    // ใช้ชื่อบัญชีจาก nameField ที่กำหนดไว้
    nodeCode = item[this.accountTreeConfig.codeField!] || '';
    nodeDescription = item[this.accountTreeConfig.nameField!] || item.description || item.NameThai || `Account ${nodeCode}`;

    const node: TreeNode = {
      id: `leaf-${item.id || index}`,
      code: nodeCode,
      description: nodeDescription,  // แสดงเฉพาะชื่อบัญชี
      amount: item.amount || 0,
      level: level,
      isGroupRow: false,
      originalData: item,
      ...item
    };

    this.calculateTotalColumns(node);
    return node;
  }

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

  private recalculateAfterEdit(): void {
    // Recalculate Total columns for all leaf nodes first
    const recalculateLeafTotals = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children) {
          recalculateLeafTotals(node.children);
        } else if (!node.isGroupRow) {
          this.calculateTotalColumns(node);
        }
      });
    };

    recalculateLeafTotals(this.treeData);

    // Recalculate group totals
    const recalculateGroup = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.isGroupRow && node.children) {
          recalculateGroup(node.children);
          if (this.useAccountCodeTree) {
            // Use account tree totals calculation
            this.calculateAccountTreeTotals([node]);
          } else {
            this.calculateGroupTotals(node);
          }
        }
      });
    };

    recalculateGroup(this.treeData);

    // Recalculate grand totals
    this.calculateGrandTotals();

    // Update visible nodes
    this.updateVisibleNodes();
  }

  // ===== Public Methods =====

  public refreshTreeData(): void {
    console.log('🔄 refreshTreeData triggered');

    this.buildTreeData();
    this.calculateGrandTotals();
    this.updateVisibleNodes();

    // Force update totals after refresh
    setTimeout(() => {
      this.forceUpdateTotals();
    }, 10);

    console.log('✅ refreshTreeData completed');
  }

  public forceUpdateTotals(): void {
    console.log('🔄 forceUpdateTotals triggered');

    // Force recalculate all nodes
    const updateAllNodes = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children) {
          updateAllNodes(node.children);
        }

        // Calculate total columns for all nodes (including group nodes)
        this.calculateTotalColumns(node);
      });
    };

    updateAllNodes(this.treeData);

    // Calculate grand totals
    this.calculateGrandTotals();

    // Update visible nodes
    this.updateVisibleNodes();

    console.log('✅ forceUpdateTotals completed');
  }

  public updateData(newData: any[]): void {
    this.data = newData;
    this.originalData = JSON.parse(JSON.stringify(newData));
    this.initializeAccountTreeConfig(); // Re-initialize for new data
    this.refreshTreeData();
  }

  // ===== Helper Methods =====

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

  getTotalColumns(): ColumnDefinition[] {
    return this.columns?.filter(col => Boolean(col.isGrandTotal)) || [];
  }

  // ===== Event Handlers =====

  onGroupingChange(): void {
    // Disable account tree mode if standard grouping is enabled
    if (this.groupingOptions.some(option => option.enabled)) {
      this.useAccountCodeTree = false;
    }

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

    // 🆕 Include account tree fields in search
    let searchFields = [...this.filterFields];
    if (this.useAccountCodeTree) {
      if (this.accountTreeConfig.codeField && !searchFields.includes(this.accountTreeConfig.codeField)) {
        searchFields.push(this.accountTreeConfig.codeField);
      }
      if (this.accountTreeConfig.nameField && !searchFields.includes(this.accountTreeConfig.nameField)) {
        searchFields.push(this.accountTreeConfig.nameField);
      }
    }

    for (const field of searchFields) {
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

    let searchFields = [...this.filterFields];
    if (this.useAccountCodeTree) {
      searchFields.push('code', 'description');
    }

    for (const field of searchFields) {
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
    //return string.replace(/[.*+?^${}()|[\]\\]/g, '\\  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\');
  }

  // ===== Display Methods =====

  getRowClass(node: TreeNode): string {
    let classes = [];

    if (node.isGroupRow) {
      if (this.useAccountCodeTree) {
        classes.push(`account-tree-level-${node.level}`);
      } else {
        classes.push(`group-row-level-${node.level}`);
      }
    } else {
      classes.push('data-row');
    }

    if (this.isHighlighted(node)) {
      classes.push('filtered-highlight');
    }

    return classes.join(' ');
  }

  getRowBackgroundColor(node: TreeNode): string {
    if (node.isGroupRow && this.useAccountCodeTree) {
      // Account tree specific colors
      switch (node.level) {
        case 0: return '#e3f2fd'; // Light blue
        case 1: return '#f3e5f5'; // Light purple
        case 2: return '#e8f5e8'; // Light green
        case 3: return '#fff3e0'; // Light orange
        case 4: return '#fce4ec'; // Light pink
        default: return '#f8f9fa';
      }
    } else if (node.isGroupRow) {
      // Standard grouping colors
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
      case NgTreeAccountFormat.number:
        return this.formatNumber(value);

      case NgTreeAccountFormat.million:
        return this.formatMillion(value);

      case NgTreeAccountFormat.datetime:
        return this.formatDateTime(value);

      case NgTreeAccountFormat.date:
        return this.formatDate(value);

      case NgTreeAccountFormat.other:
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
  
      const visibleColumns = this.getVisibleColumns();
      const columnIndex = visibleColumns.findIndex(col => this.getColumnField(col) === columnKey);
      if (columnIndex === -1) {
        console.warn(`Column ${columnKey} not found in visible columns for animation`);
        return;
      }
  
      // Find cell element (description column + column index)
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

  /**
   * Clear all tracked changes
   */
  public clearChangedNodes(): void {
    this.changedNodeIds.clear();
    this.changedNodesData.clear();
  }

  // ===== 🆕 Public Account Tree Methods =====

  /**
   * Enable account code tree mode
   */
  public enableAccountCodeTree(): void {
    this.useAccountCodeTree = true;
    this.onAccountTreeModeChange();
  }

  /**
   * Disable account code tree mode
   */
  public disableAccountCodeTree(): void {
    this.useAccountCodeTree = false;
    this.onAccountTreeModeChange();
  }

  /**
   * Update account tree configuration
   */
  public updateAccountTreeConfig(config: Partial<AccountTreeConfig>): void {
    this.accountTreeConfig = { ...this.accountTreeConfig, ...config };
    this.initializeAccountTreeConfig();
    
    if (this.useAccountCodeTree) {
      this.buildTreeData();
      this.calculateGrandTotals();
      this.updateVisibleNodes();
    }
  }

  /**
   * Get current account tree structure info
   */
  public getAccountTreeInfo(): { 
    totalAccounts: number, 
    maxLevel: number, 
    segmentLengths: number[], 
    rootNodes: number 
  } {
    if (!this.useAccountCodeTree) {
      return { totalAccounts: 0, maxLevel: 0, segmentLengths: [], rootNodes: 0 };
    }

    const allNodes = this.flattenedNodes;
    const leafNodes = allNodes.filter(node => !node.isGroupRow);
    const maxLevel = Math.max(...allNodes.map(node => node.level));
    const rootNodes = this.treeData.length;

    return {
      totalAccounts: leafNodes.length,
      maxLevel: maxLevel,
      segmentLengths: this.detectedSegments,
      rootNodes: rootNodes
    };
  }

  /**
   * Expand all nodes up to specified level
   */
  public expandToLevel(level: number): void {
    const setExpandedToLevel = (nodes: TreeNode[], currentLevel: number = 0) => {
      nodes.forEach(node => {
        node.isExpanded = currentLevel < level;
        if (node.children) {
          setExpandedToLevel(node.children, currentLevel + 1);
        }
      });
    };

    setExpandedToLevel(this.treeData);
    this.updateVisibleNodes();
  }

  /**
   * Find account by code
   */
  public findAccountByCode(code: string): TreeNode | null {
    const findByCode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.code === code) {
          return node;
        }
        if (node.children) {
          const found = findByCode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findByCode(this.treeData);
  }

  /**
   * Get all accounts under a specific parent code
   */
  public getAccountsByParent(parentCode: string): TreeNode[] {
    const parentNode = this.findAccountByCode(parentCode);
    if (!parentNode || !parentNode.children) {
      return [];
    }

    return this.getLeafNodes(parentNode);
  }

  // ===== Deprecated Methods (for backward compatibility) =====

  /**
   * @deprecated Use refreshTreeData() instead
   */
  public updateNode(): void {
    console.warn('updateNode() is deprecated. Use refreshTreeData() instead.');
    this.refreshTreeData();
  }
}