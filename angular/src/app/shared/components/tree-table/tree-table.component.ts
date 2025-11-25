import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, SimpleChanges, OnInit, ContentChildren, QueryList, TemplateRef, ContentChild } from '@angular/core';

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
}

export interface LevelSummary {
  level: number;
  total: number;
  description: string;
}

export interface TableHeader {
  title: string;
  field?: string;
  template?: string;
  width?: string;
}

@Component({
  selector: 'ng-tree-table',
  template: `
    <div class="table-responsive">
      <table class="table" #treeTable>
        <thead>
          <tr>
            <th style="width: 30px"></th>
            <th style="width: 30px"></th>
            <th style="min-width: 300px">{{ headers.description || 'รายการ' }}</th>
            <th style="width: 120px">รหัส</th>
            <th class="text-end" style="width: 150px">{{ headers.amount || 'จำนวนเงิน' }}</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let node of visibleNodes; let i = index">
            <tr [attr.data-node-id]="node.id" 
                [attr.data-level]="node.level"
                [attr.data-parent]="node.parent?.id"
                [class.summary-row]="node.level <= 2">
              <td class="text-center">
                <i *ngIf="hasChildren(node)" 
                   class="fas tree-icon"
                   [class.fa-plus-square]="!node.isExpanded"
                   [class.fa-minus-square]="node.isExpanded"
                   (click)="toggleNode(node, $event)">
                </i>
              </td>
              <td>
                <ng-container *ngTemplateOutlet="iconTemplate; context: { $implicit: node }">
                </ng-container>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <div [style.width.px]="node.level * 24"></div>
                  <ng-container *ngIf="descriptionTemplate; else defaultDescription">
                    <ng-container *ngTemplateOutlet="descriptionTemplate; context: { $implicit: node }">
                    </ng-container>
                  </ng-container>
                  <ng-template #defaultDescription>
                    <span [class.account-header]="node.level <= 2"
                          [class.level-0]="node.level === 0"
                          [class.level-1]="node.level === 1"
                          [class.level-2]="node.level === 2">
                      {{ node.description }}
                    </span>
                  </ng-template>
                </div>
              </td>
              <td [class.account-header]="node.level <= 2">
                <ng-container *ngIf="codeTemplate; else defaultCode">
                  <ng-container *ngTemplateOutlet="codeTemplate; context: { $implicit: node }">
                  </ng-container>
                </ng-container>
                <ng-template #defaultCode>
                  {{ node.code }}
                </ng-template>
              </td>
              <td class="text-end" [class.account-header]="node.level <= 2">
                <ng-container *ngIf="amountTemplate; else defaultAmount">
                  <ng-container *ngTemplateOutlet="amountTemplate; context: { $implicit: node }">
                  </ng-container>
                </ng-container>
                <ng-template #defaultAmount>
                  {{ node.amount | number:'1.2-2' }}
                </ng-template>
              </td>
            </tr>
            <tr *ngIf="shouldShowTotal(node, i)" class="total-row">
              <td colspan="2"></td>
              <td>
                <div class="d-flex align-items-center">
                  <div [style.width.px]="(node.parent?.level ?? 0) * 24"></div>
                  <span class="total-text">{{ node.parent?.description }} TOTAL</span>
                </div>
              </td>
              <td></td>
              <td class="text-end total-amount">
                {{ node.parent?.totalAmount | number:'1.2-2' }}
              </td>
            </tr>
          </ng-container>
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
    .table > :not(caption) > * > * {
      padding: 0.5rem;
      border-bottom: 1px dashed #dee2e6;
    }
    .table > thead > tr > th {
      border-bottom: 2px solid #dee2e6;
      background-color: #f8f9fa;
      font-weight: 600;
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
  `]
})
export class NgTreeTableComponent implements AfterViewInit, OnInit {
  @Input() nodes: TreeNode[] = [];
  @Input() headers: { description?: string; amount?: string } = {};
  @Input() allowSummary = false;
  @Output() onDetail = new EventEmitter<TreeNode>();

  @ContentChild('iconTemplate') iconTemplate?: TemplateRef<any>;
  @ContentChild('descriptionTemplate') descriptionTemplate?: TemplateRef<any>;
  @ContentChild('codeTemplate') codeTemplate?: TemplateRef<any>;
  @ContentChild('amountTemplate') amountTemplate?: TemplateRef<any>;

  flattenedNodes: TreeNode[] = [];
  visibleNodes: TreeNode[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.calculateTotals(this.nodes);
    this.updateVisibleNodes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nodes']) {
      this.calculateTotals(this.nodes);
      this.updateVisibleNodes();
    }
  }

  ngAfterViewInit() {}

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
    
    setCollapsed(this.nodes);
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
    
    setExpanded(this.nodes);
    this.updateVisibleNodes();
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

    this.nodes.forEach(node => processNode(node));
  }

  private calculateTotals(nodes: TreeNode[]) {
    nodes.forEach(node => {
      if (this.hasChildren(node)) {
        node.totalAmount = node.children!.reduce((sum, child) => {
          if (this.hasChildren(child)) {
            this.calculateTotals([child]);
            return sum + (child.totalAmount || 0);
          }
          return sum + (child.amount || 0);
        }, 0);
        node.amount = node.totalAmount;
      } else {
        node.totalAmount = node.amount;
      }
    });
  }
}
