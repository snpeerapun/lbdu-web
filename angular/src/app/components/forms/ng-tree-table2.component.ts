import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, SimpleChanges, OnInit, ContentChild, TemplateRef, TrackByFunction } from '@angular/core';

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
  isVisible?: boolean; // New property for filtering
  [key: string]: any; // Support for additional custom properties
}

export interface ColumnDefinition {
  key?: string;      // Property key in the data
  header?: string;   // Display header text
  width?: string;    // Optional width (e.g., '150px')
  class?: string;    // Optional CSS class
  isCurrency?: boolean; // Whether to format as currency
  template?: string;  // Template name for custom rendering
  filterable?: boolean; // Whether this column is searchable
  showSummary?: boolean; // Whether to show summary for this column in group totals
  summaryType?: 'sum' | 'avg' | 'count' | 'custom'; // Type of summary calculation
  summaryTemplate?: string; // Custom template for summary display
}

@Component({
  selector: 'ng-tree-table2',
  template: `
   <!-- ส่วนของ template ที่แก้ไขแล้ว -->
<div class="">
  <!-- Filter Input Section -->
  <div class="filter-section mb-3 col-4" *ngIf="showFilter">
    <div class="input-group ">
    <input type="text" 
             class="form-control" 
             placeholder="{{ filterPlaceholder }}"
             [(ngModel)]="filterText"
             (input)="onFilterChange()"
             #filterInput>
    </div>   
  </div>

  <table class="table table-striped table-sticky-header" #treeTable>
    <thead>
      <tr>
        <!-- ลบคอลัมน์แรกออก (ที่เคยใช้สำหรับไอคอน) -->
        <th style="min-width: 300px">{{ headers.description || 'รายการ' }}</th>
        <ng-container *ngFor="let column of columns">
          <th [ngClass]="column.class || ''" 
              [style.width]="column.width">
            {{ column.header }}
          </th>
        </ng-container>
      </tr>
    </thead>
    <tbody>
      <ng-container *ngFor="let node of visibleNodes; let i = index; trackBy: trackByFn">
        <tr [attr.data-node-id]="node.id" 
            [attr.data-level]="node.level"
            [attr.data-parent]="node.parent?.id"
            [class.summary-row]="node.level <= 2"
            [class.filtered-highlight]="isHighlighted(node)">
          <!-- ลบ <td> สำหรับไอคอนออก -->
          <td>
            <div class="d-flex align-items-center">
              <div [style.width.px]="node.level * 24"></div>
              <!-- ย้ายไอคอนมาวางก่อนข้อความ -->
              <i *ngIf="hasChildren(node)" 
                class="fas tree-icon mr-2"
                [class.fa-plus-square]="!node.isExpanded"
                [class.fa-minus-square]="node.isExpanded"
                (click)="toggleNode(node, $event)">
              </i>
              <span [class.account-header]="node.level <= 2"
                    [class.level-0]="node.level === 0"
                    [class.level-1]="node.level === 1"
                    [class.level-2]="node.level === 2"
                    [innerHTML]="highlightText(node.description)">
              </span>
            </div>
          </td>
          <ng-container *ngFor="let column of columns">
            <td [ngClass]="column.class || ''"
                [class.account-header]="node.level <= 2">
              <!-- Template column -->
              <ng-container *ngIf="column.template">
                <ng-container *ngTemplateOutlet="getTemplateRef(column.template); 
                                              context: { $implicit: node, row: node, column: column }">
                </ng-container>
              </ng-container>
              <!-- Data column -->
              <ng-container *ngIf="!column.template">
                <ng-container *ngIf="column.isCurrency">
                  {{ getNodeValue(node, column.key!) | number:'1.2-2' }}
                </ng-container>
                <ng-container *ngIf="!column.isCurrency">
                  <span [innerHTML]="column.filterable ? highlightText(getNodeValue(node, column.key!)) : getNodeValue(node, column.key!)"></span>
                </ng-container>
              </ng-container>
            </td>
          </ng-container>
        </tr>
        <tr *ngIf="shouldShowTotal(node, i)" class="total-row">
          <!-- ลบ <td> แรกออกและปรับ total row -->
          <td>
            <div class="d-flex align-items-center">
              <div [style.width.px]="(node.parent?.level ?? 0) * 24"></div>
              <span class="total-text">{{ node.parent?.description }} TOTAL</span>
            </div>
          </td>
          <ng-container *ngFor="let column of columns">
            <td [ngClass]="column.class || ''" class="total-amount">
              <!-- Summary template column -->
              <ng-container *ngIf="column.summaryTemplate">
                <ng-container *ngTemplateOutlet="getTemplateRef(column.summaryTemplate); 
                                              context: { $implicit: node.parent, row: node.parent, column: column, summary: getSummaryForColumn(node.parent, column) }">
                </ng-container>
              </ng-container>
              <!-- Default summary display -->
              <ng-container *ngIf="!column.summaryTemplate && column.showSummary">
                <ng-container *ngIf="column.isCurrency">
                  {{ getSummaryForColumn(node.parent, column) | number:'1.2-2' }}
                </ng-container>
                <ng-container *ngIf="!column.isCurrency">
                  {{ getSummaryForColumn(node.parent, column) }}
                </ng-container>
              </ng-container>
            </td>
          </ng-container>
        </tr>
      </ng-container>
      <tr *ngIf="visibleNodes.length === 0 && filterText" class="no-results">
        <td [attr.colspan]="columns.length + 1" class="text-center text-muted py-4">
          <i class="fas fa-search mb-2"></i>
          <div>No results found for "{{ filterText }}"</div>
          <small>Try adjusting your search terms</small>
        </td>
      </tr>
    </tbody>
  </table>
</div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .table {
      margin: 0;
    }
   
  
    .tree-icon {
      color: #0a7c76;
      cursor: pointer;
    }
    .tree-icon:hover {
      color: #064e4a;
    }
    .account-header {
      font-weight: 600;
    }
    .level-0 {
      text-transform: uppercase;
    }
    .level-1 {
    }
    .level-2 {
      color: #444;
    }
    .summary-row {
      background-color: #f8f9fa;
    }
    .total-row {
      background-color: #f0f2f3;
    }
    .total-text {
      color: #0a7c76;
      font-weight: 600;
    }
    .total-amount {
      color: #0a7c76;
      font-weight: 600;
    }
    
 
    
    .filter-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
  `]
})
export class NgTreeTable2Component implements AfterViewInit, OnInit {
  @Input() data: TreeNode[] = []; // Changed from 'nodes' to 'data'
  @Input() nodes: TreeNode[] = []; // Keep for backward compatibility
  @Input() headers: { description?: string } = {};
  @Input() columns: ColumnDefinition[] = [];
  @Input() allowSummary = false;
  @Input() showFilter = true; // New property to show/hide filter
  @Input() filterPlaceholder = 'Search...'; // Customizable placeholder
  @Input() filterFields: string[] = ['description', 'code']; // Fields to search in
  @Input() caseSensitive = false; // Case sensitive search
  @Input() matchWholeWords = false; // Match whole words only
  @Input() trackBy: TrackByFunction<TreeNode> | undefined; // Custom trackBy function
  
  @Output() filterChanged = new EventEmitter<string>(); // Event when filter changes
  
  @ContentChild('action') actionTemplate?: TemplateRef<any>;
  @ContentChild('summary') summaryTemplate?: TemplateRef<any>;
  
  // Filter properties
  filterText = '';
  private allNodes: TreeNode[] = []; // Store original unfiltered nodes
  
  private templateMap = new Map<string, TemplateRef<any>>();
  flattenedNodes: TreeNode[] = [];
  visibleNodes: TreeNode[] = [];

  // Default trackBy function
  trackByFn: TrackByFunction<TreeNode> = (index: number, item: TreeNode) => {
    if (this.trackBy) {
      return this.trackBy(index, item);
    }
    return item.id || index;
  };

  constructor(private elementRef: ElementRef) {}

  get actualNodes(): TreeNode[] {
    return this.data.length > 0 ? this.data : this.nodes;
  }

  ngOnInit() {
    this.allNodes = JSON.parse(JSON.stringify(this.actualNodes)); // Deep copy
    this.calculateTotals(this.actualNodes);
    this.updateVisibleNodes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['nodes']) {
      this.allNodes = JSON.parse(JSON.stringify(this.actualNodes)); // Deep copy
      this.calculateTotals(this.actualNodes);
      this.applyFilter();
    }
  }

  ngAfterViewInit() {
    // Map templates to their names
    if (this.actionTemplate) {
      this.templateMap.set('action', this.actionTemplate);
    }
    if (this.summaryTemplate) {
      this.templateMap.set('summary', this.summaryTemplate);
    }
  }

  getTemplateRef(name: string): TemplateRef<any> | null {
    return this.templateMap.get(name) || null;
  }

  hasChildren(node: TreeNode): boolean {
    return Array.isArray(node?.children) && node.children.length > 0;
  }

  toggleNode(node: TreeNode, event: Event) {
    event.stopPropagation();
    node.isExpanded = !node.isExpanded;
    this.updateVisibleNodes();
  }

  shouldShowTotal(node: TreeNode, index: number): boolean {
    if (!this.allowSummary || !node.parent || !node.parent.isExpanded) return false;
    
    const nextNode = this.visibleNodes[index + 1];
    const nextLevel = nextNode?.level ?? 0;
    const isLastOfLevel = node.level !== nextLevel && node.level > nextLevel;
    const isLastChildOfTopLevels = node.parent.level <= 1 && node.isLastChild;
    
    return Boolean(isLastOfLevel || isLastChildOfTopLevels);
  }

  getNodeValue(node: TreeNode, key: string): any {
    return node[key] || '';
  }

  getSummaryForColumn(node: TreeNode | undefined, column: ColumnDefinition): number {
    if (!node || !column.key || !column.showSummary) return 0;
    
    const summaryType = column.summaryType || 'sum';
    
    switch (summaryType) {
      case 'sum':
        return this.calculateSum(node, column.key);
      case 'avg':
        return this.calculateAverage(node, column.key);
      case 'count':
        return this.calculateCount(node);
      case 'custom':
        // Custom calculation can be handled in template
        return node[column.key + 'Total'] || 0;
      default:
        return this.calculateSum(node, column.key);
    }
  }

  private calculateSum(node: TreeNode, key: string): number {
    if (!node.children) return node[key] || 0;
    
    return node.children.reduce((sum, child) => {
      if (this.hasChildren(child)) {
        return sum + this.calculateSum(child, key);
      }
      return sum + (child[key] || 0);
    }, 0);
  }

  private calculateAverage(node: TreeNode, key: string): number {
    const sum = this.calculateSum(node, key);
    const count = this.calculateCount(node);
    return count > 0 ? sum / count : 0;
  }

  private calculateCount(node: TreeNode): number {
    if (!node.children) return 1;
    
    return node.children.reduce((count, child) => {
      return count + this.calculateCount(child);
    }, 0);
  }

  updateExpansionState() {
    this.updateVisibleNodes();
  }

  collapseAll() {
    const setCollapsed = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.isExpanded = false;
        if (node.children) {
          setCollapsed(node.children);
        }
      });
    };
    
    setCollapsed(this.actualNodes);
    this.updateVisibleNodes();
  }

  expandAll() {
    const setExpanded = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.isExpanded = true;
        if (node.children) {
          setExpanded(node.children);
        }
      });
    };
    
    setExpanded(this.actualNodes);
    this.updateVisibleNodes();
  }

  // Filter methods
  onFilterChange() {
    this.applyFilter();
    this.filterChanged.emit(this.filterText);
  }

  clearFilter() {
    this.filterText = '';
    this.applyFilter();
    this.filterChanged.emit('');
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

  private applyFilter() {
    if (!this.filterText) {
      // Reset to original nodes
      if (this.data.length > 0) {
        this.data.splice(0, this.data.length, ...JSON.parse(JSON.stringify(this.allNodes)));
      } else {
        this.nodes.splice(0, this.nodes.length, ...JSON.parse(JSON.stringify(this.allNodes)));
      }
      this.calculateTotals(this.actualNodes);
      this.updateVisibleNodes();
      return;
    }

    // Filter nodes
    const filteredNodes = this.filterNodes(JSON.parse(JSON.stringify(this.allNodes)));
    
    if (this.data.length > 0) {
      this.data.splice(0, this.data.length, ...filteredNodes);
    } else {
      this.nodes.splice(0, this.nodes.length, ...filteredNodes);
    }
    
    this.calculateTotals(this.actualNodes);
    
    // Auto-expand nodes that have matches
    this.expandMatchingNodes(this.actualNodes);
    this.updateVisibleNodes();
  }

  private filterNodes(nodes: TreeNode[]): TreeNode[] {
    const filtered: TreeNode[] = [];

    for (const node of nodes) {
      const hasMatchingChildren = node.children ? this.filterNodes(node.children).length > 0 : false;
      const nodeMatches = this.nodeMatchesFilter(node);

      if (nodeMatches || hasMatchingChildren) {
        const newNode = { ...node };
        if (node.children) {
          newNode.children = this.filterNodes(node.children);
        }
        filtered.push(newNode);
      }
    }

    return filtered;
  }

  private nodeMatchesFilter(node: TreeNode): boolean {
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

  private expandMatchingNodes(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // Expand if any child matches or has matching descendants
        const hasMatchingDescendants = this.hasMatchingDescendants(node);
        if (hasMatchingDescendants) {
          node.isExpanded = true;
        }
        this.expandMatchingNodes(node.children);
      }
    }
  }

  private hasMatchingDescendants(node: TreeNode): boolean {
    if (!node.children) return false;
    
    for (const child of node.children) {
      if (this.nodeMatchesFilter(child) || this.hasMatchingDescendants(child)) {
        return true;
      }
    }
    
    return false;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private updateVisibleNodes() {
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

    this.actualNodes.forEach(node => processNode(node));
  }

  private calculateTotals(nodes: TreeNode[]) {
    nodes.forEach(node => {
      if (this.hasChildren(node)) {
        // Calculate regular amount total
        node.totalAmount = node.children!.reduce((sum, child) => {
          if (this.hasChildren(child)) {
            this.calculateTotals([child]);
            return sum + (child.totalAmount || 0);
          }
          return sum + (child.amount || 0);
        }, 0);
        node.amount = node.totalAmount;
        
        // Calculate totals for each custom column
        this.columns.forEach(column => {
          if (column.key && column.key !== 'amount' && column.showSummary) {
            const totalKey = column.key + 'Total';
            node[totalKey] = this.getSummaryForColumn(node, column);
          }
        });
      } else {
        node.totalAmount = node.amount;
        
        // Set totals for leaf nodes
        this.columns.forEach(column => {
          if (column.key && column.key !== 'amount' && column.showSummary) {
            node[column.key + 'Total'] = node[column.key!] || 0;
          }
        });
      }
    });
  }
}