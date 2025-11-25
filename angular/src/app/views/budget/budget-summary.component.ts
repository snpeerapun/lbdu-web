import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
 
import { BudgetService } from '../../shared/services/budget.service';
import { NgTreeTableComponent, TreeNode } from 'src/app/components/forms/ng-tree-table.component';

@Component({
  selector: 'app-budget-summary',
  template: `
    <div class="card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <h5 class="mb-0">งบประมาณตามหมวดบัญชี</h5>
          <select class="form-select" style="width: auto;" [(ngModel)]="selectedYear" (change)="onYearChange()">
            <option *ngFor="let year of fiscalYears" [value]="year">
              ปีงบประมาณ {{ year }}
            </option>
          </select>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="expandAll()">
            <i class="fas fa-expand-arrows-alt me-1"></i>
            ขยายทั้งหมด
          </button>
          <button class="btn btn-outline-secondary" (click)="collapseAll()">
            <i class="fas fa-compress-arrows-alt me-1"></i>
            ย่อทั้งหมด
          </button>
        </div>
      </div>
      <div class="card-body">
       
      </div>
    </div>
  `,
  styles: [`
    .form-select {
      border-color: #0a7c76;
      color: #0a7c76;
      font-weight: 500;
      &:focus {
        border-color: #0a7c76;
        box-shadow: 0 0 0 0.2rem rgba(10, 124, 118, 0.25);
      }
    }
  `]
})
export class BudgetSummaryComponent implements OnInit {
  @ViewChild('treeTable') treeTable!: NgTreeTableComponent;
  
  selectedYear: number = new Date().getFullYear() + 543; // ปี พ.ศ. ปัจจุบัน
  fiscalYears: number[] = [];
  
  treeData: TreeNode[] = [
    {
      id: '1',
      code: '4',
      description: 'INCOME',
      amount: 0,
      level: 0,
      children: [
        {
          id: '1.1',
          code: '401',
          description: 'FEES & SERVICE INCOME',
          amount: 0,
          level: 1,
          children: [
            {
              id: '1.1.1',
              code: '4010101',
              description: 'CONSULTANT & ADVISORY FEES',
              amount: 0,
              level: 2,
              children: [
                {
                  id: '1.1.1.1',
                  code: '4010101005',
                  description: 'FEES AND SERVICE INCOME',
                  amount: 150000,
                  level: 3
                },
                {
                  id: '1.1.1.2',
                  code: '4010101010',
                  description: 'MANAGEMENT FEE',
                  amount: 250000,
                  level: 3
                },
                {
                  id: '1.1.1.3',
                  code: '4010101015',
                  description: 'REGISTRAR FEE',
                  amount: 180000,
                  level: 3
                },
                {
                  id: '1.1.1.4',
                  code: '4010101020',
                  description: 'BACK END FEE',
                  amount: 120000,
                  level: 3
                }
              ]
            },
            {
              id: '1.1.2',
              code: '4010102',
              description: 'BROKERAGE FEES',
              amount: 0,
              level: 2,
              children: [
                {
                  id: '1.1.2.1',
                  code: '4010102005',
                  description: 'EQUITY BROKERAGE',
                  amount: 300000,
                  level: 3
                },
                {
                  id: '1.1.2.2',
                  code: '4010102010',
                  description: 'BOND BROKERAGE',
                  amount: 200000,
                  level: 3
                }
              ]
            }
          ]
        },
        {
          id: '1.2',
          code: '402',
          description: 'INTEREST INCOME',
          amount: 0,
          level: 1,
          children: [
            {
              id: '1.2.1',
              code: '4020101',
              description: 'INTEREST FROM INVESTMENTS',
              amount: 0,
              level: 2,
              children: [
                {
                  id: '1.2.1.1',
                  code: '4020101005',
                  description: 'INTEREST FROM BONDS',
                  amount: 450000,
                  level: 3
                },
                {
                  id: '1.2.1.2',
                  code: '4020101010',
                  description: 'INTEREST FROM DEPOSITS',
                  amount: 350000,
                  level: 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2',
      code: '5',
      description: 'EXPENSES',
      amount: 0,
      level: 0,
      children: [
        {
          id: '2.1',
          code: '501',
          description: 'OPERATING EXPENSES',
          amount: 0,
          level: 1,
          children: [
            {
              id: '2.1.1',
              code: '5010101',
              description: 'EMPLOYEE EXPENSES',
              amount: 0,
              level: 2,
              children: [
                {
                  id: '2.1.1.1',
                  code: '5010101005',
                  description: 'SALARIES',
                  amount: 800000,
                  level: 3
                },
                {
                  id: '2.1.1.2',
                  code: '5010101010',
                  description: 'BONUSES',
                  amount: 400000,
                  level: 3
                },
                {
                  id: '2.1.1.3',
                  code: '5010101015',
                  description: 'WELFARE',
                  amount: 200000,
                  level: 3
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  tableHeaders = {
    description: 'รายการ',
    amount: 'จำนวนเงิน (บาท)'
  };

  constructor(
    private budgetService: BudgetService,
    private router: Router
  ) {
    // สร้างตัวเลือกปีงบประมาณ ย้อนหลัง 2 ปี และล่วงหน้า 1 ปี
    const currentYear = this.selectedYear;
    this.fiscalYears = [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1
    ];
  }

  ngOnInit() {
    this.loadBudgetData();
  }

  onYearChange() {
    this.loadBudgetData();
  }

  private loadBudgetData() {
    // TODO: เรียกข้อมูลจาก service ตามปีที่เลือก
    // this.budgetService.getBudgetByYear(this.selectedYear).subscribe(data => {
    //   this.treeData = data;
    // });
    
    // ใช้ข้อมูล mock ไปก่อน
  }

  expandAll() {
    this.updateNodeExpansion(this.treeData, true);
    this.treeTable?.updateExpansionState();
  }

  collapseAll() {
    this.updateNodeExpansion(this.treeData, false);
    this.treeTable?.updateExpansionState();
  }

  private updateNodeExpansion(nodes: TreeNode[], expanded: boolean) {
    nodes.forEach(node => {
      node.isExpanded = expanded;
      if (node.children) {
        this.updateNodeExpansion(node.children, expanded);
      }
    });
  }

  viewDetail(node: TreeNode) {
    // Navigate to detail view with the node data
    this.router.navigate(['/budget/detail', node.id]);
  }
}
