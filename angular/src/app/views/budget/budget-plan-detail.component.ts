 // budget-plan-details.component.ts
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';
import { BudgetFundSizeItemComponent } from './budget-fundsize-item.component';
import { BudgetFundSizeComponent } from './budget-fundsize.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { NgTableColumn, NgTableFormat } from 'src/app/components/forms/ng-table.inferface';
import {  ColumnDefinition, NgTreeAccountComponent, NgTreeAccountFormat } from 'src/app/components/forms/ng-tree-account.component';
 
export interface BudgetSummary {
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  utilizationPercent: number;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
}

export interface BudgetRequest {
  id: number;
  requestCode: string;
  title: string;
  department: string;
  totalAmount: number;
  allocatedAmount: number;
  usedAmount: number;
  status: string;
  priority: string;
  createdDate: Date;
  utilizationPercent: number;
}

export interface DepartmentBudget {
  departmentCode: string;
  departmentName: string;
  totalBudget: number;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  utilizationPercent: number;
  requestCount: number;
  approvedCount: number;
  status: string;
}

export interface AccountCodeBudget {
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  utilizationPercent: number;
  requestCount: number;
  status: string;
  category: string;
}

@Component({
  selector: 'app-budget-plan-details',
  template: `
    <div class="budget-plan-details">
      <!-- Header Section -->
      <div class="plan-header">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-8">
              
              <h1 class="plan-title ">
                <i class="fas fa-file-invoice-dollar me-3"></i>
                {{ budgetPlan?.planName }}
                <span class="status-badge" [ngStyle]="{ 'background-color': budgetPlan?.statusColor }">
                <i class="fas fa-circle me-2"></i>{{ budgetPlan?.statusName }}
              </span>
              </h1>
              <p class="plan-description ">{{ budgetPlan?.description }}</p>
            </div>
            <div class="col-md-4 text-end">
             
              <div class="dropdown d-inline-block ms-2">
                <button class="btn btn-primary dropdown-toggle mr-2" 
                        type="button" 
                        data-bs-toggle="dropdown">
                  <i class="fas fa-cog me-2"></i>Actions
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" (click)="onEditBudgetPlan()"><i class="fas fa-edit me-2"></i>Edit Plan</a></li>
                  <li><a class="dropdown-item" href="#"><i class="fas fa-copy me-2"></i>Copy Plan</a></li>
                  <li><a class="dropdown-item" href="#" (click)="exportBudgetPlan()"><i class="fas fa-file-export me-2"></i>Export</a></li>
                  <li ><hr class="dropdown-divider"></li>
                  <li *ngIf="budgetPlan?.statusName  === 'PENDING'" ><a class="dropdown-item" href="javascript:void(0)" (click)="onChangeStatus('APPROVED')"><i class="fa fa-check me-2"></i>APPROVED</a></li>
                  <li *ngIf="budgetPlan?.statusName === 'APPROVED' || budgetPlan?.statusName === 'DRAFT'" ><a class="dropdown-item" href="javascript:void(0)" (click)="onChangeStatus('ARCHIVED')"><i class="fa fa-archive me-2"></i>ARCHIVED</a></li>
                   
                </ul>
              </div>
              <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="quick-stats">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-3">
              <div class="stat-card stat-primary">
                <div class="stat-icon">
                  <i class="fas fa-wallet"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ budgetPlan?.totalBudget | currency:'THB':'symbol':'1.0-0' }}</div>
                  <div class="stat-label">Total Budget</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-success">
                <div class="stat-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ budgetPlan?.allocatedBudget | currency:'THB':'symbol':'1.0-0' }}</div>
                  <div class="stat-label">Allocated ({{ budgetSummary?.utilizationPercent }}%)</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-warning">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ budgetSummary?.pendingRequests }}</div>
                  <div class="stat-label">Pending Requests</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-info">
                <div class="stat-icon">
                  <i class="fas fa-list"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ budgetSummary?.totalRequests }}</div>
                  <div class="stat-label">Total Requests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Tabs -->
      <div class="main-content">
        <div class="container-fluid">
          <div class="budget-tabs-container">
            <ul class="nav nav-tabs budget-nav-tabs" id="budgetTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <a class="nav-link active" 
                        id="summary-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#summary" 
                       
                        role="tab">
                  <i class="fas fa-chart-pie me-2"></i>Budget Summary
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" 
                        id="fund-size-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#fund-size" 
                     
                        role="tab">
                  <i class="fas fa-chart-line me-2"></i>Balance Sheet
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" 
                        id="requests-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#requests" 
                       
                        role="tab">
                  <i class="fas fa-list-alt me-2"></i>Profit & Loss
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" 
                        id="departments-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#departments" 
                       
                        role="tab">
                  <i class="fas fa-building me-2"></i>Department Utilization
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" 
                        id="account-codes-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#account-codes" 
                       
                        role="tab">
                  <i class="fas fa-code me-2"></i>Account Code Utilization
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" 
                        id="analytics-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#analytics" 
                        
                        role="tab">
                  <i class="fas fa-chart-bar me-2"></i>Analytics
                </a>
              </li>
            </ul>

            <div class="tab-content budget-tab-content" id="budgetTabContent">
              
              <!-- Budget Summary Tab -->
              <div class="tab-pane fade show active" id="summary" role="tabpanel">
                <div class="tab-content-wrapper">
                  <div class="row">
                    <!-- Budget Overview Chart -->
                    <div class="col-md-8">
                      <div class="chart-card">
                        <div class="card-header">
                          <h5><i class="fas fa-chart-pie me-2"></i>Budget Overview</h5>
                        </div>
                        <div class="card-body">
                          <div class="budget-overview-chart">
                            <canvas id="budgetOverviewChart" height="300"></canvas>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Budget Breakdown -->
                    <div class="col-md-4">
                      <div class="breakdown-card">
                        <div class="card-header">
                          <h6><i class="fas fa-layer-group me-2"></i>Budget Breakdown</h6>
                        </div>
                        <div class="card-body">
                          <div class="breakdown-item">
                            <div class="breakdown-label">Total Budget</div>
                            <div class="breakdown-value text-primary">
                              {{ budgetSummary?.totalBudget | currency:'THB':'symbol':'1.0-0' }}
                            </div>
                          </div>
                          <div class="breakdown-item">
                            <div class="breakdown-label">Allocated</div>
                            <div class="breakdown-value text-success">
                              {{ budgetSummary?.allocatedBudget | currency:'THB':'symbol':'1.0-0' }}
                            </div>
                            <div class="breakdown-progress">
                              <div class="progress">
                                <div class="progress-bar bg-success" 
                                     [style.width.%]="budgetSummary?.utilizationPercent">
                                </div>
                              </div>
                              <small>{{ budgetSummary?.utilizationPercent }}%</small>
                            </div>
                          </div>
                          <div class="breakdown-item">
                            <div class="breakdown-label">Remaining</div>
                            <div class="breakdown-value text-warning">
                              {{ budgetSummary?.remainingBudget | currency:'THB':'symbol':'1.0-0' }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Request Status Summary -->
                      <div class="status-summary-card mt-3">
                        <div class="card-header">
                          <h6><i class="fas fa-tasks me-2"></i>Request Status</h6>
                        </div>
                        <div class="card-body">
                          <div class="status-item">
                            <div class="status-icon status-approved">
                              <i class="fas fa-check"></i>
                            </div>
                            <div class="status-content">
                              <div class="status-count">{{ budgetSummary?.approvedRequests }}</div>
                              <div class="status-label">Approved</div>
                            </div>
                          </div>
                          <div class="status-item">
                            <div class="status-icon status-pending">
                              <i class="fas fa-clock"></i>
                            </div>
                            <div class="status-content">
                              <div class="status-count">{{ budgetSummary?.pendingRequests }}</div>
                              <div class="status-label">Pending</div>
                            </div>
                          </div>
                          <div class="status-item">
                            <div class="status-icon status-rejected">
                              <i class="fas fa-times"></i>
                            </div>
                            <div class="status-content">
                              <div class="status-count">{{ budgetSummary?.rejectedRequests }}</div>
                              <div class="status-label">Rejected</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
   
              <div class="tab-pane fade" id="fund-size" role="tabpanel">
                <div class="tab-content-wrapper t">

                <div class="table-responsive mt-3" [style.width.px]="screenWidth">
                <ng-tree-account 
                  [data]="budgetPlanItem"
                  [columns]="columns"
                  [useAccountCodeTree]="true"
                  [allowCellEdit]="true"
                 >
                 <ng-template #action let-node let-column="column" >
                      <div class="gap-2" *ngIf="!node.isGroupRow">
                        <button class="btn btn-sm btn-secondary mr-2" 
                              (click)="onViewItem(node)"
                              [title]="'View ' + node.code">
                                  <i class="fas fa-eye"></i>
                        </button>
                        
                      </div>
                    </ng-template>
                </ng-tree-account>
               </div>
                </div>
              </div>
              
              <!-- Budget Requests & Utilization Tab -->
              <div class="tab-pane fade" id="requests" role="tabpanel">
                <div class="tab-content-wrapper">
                <ng-tree-account 
                  [data]="budgetPlanItem"
                  [columns]="columns"
                  [useAccountCodeTree]="true"
                  [allowCellEdit]="true"
                 >
                 <ng-template #action let-node let-column="column" >
                      <div class="gap-2" *ngIf="!node.isGroupRow">
                        <button class="btn btn-sm btn-secondary mr-2" 
                              (click)="onViewItem(node)"
                              [title]="'View ' + node.code">
                                  <i class="fas fa-eye"></i>
                        </button>
                        
                      </div>
                    </ng-template>
                </ng-tree-account>
                </div>
              </div>

              <!-- Department Utilization Tab -->
              <div class="tab-pane fade" id="departments" role="tabpanel">
                <div class="tab-content-wrapper">
              
                  <!-- Department Table -->
                  <div class="row mt-4">
                    <div class="col-12">
                      <div class="department-table-card">
                        <div class="card-header">
                          <h6><i class="fas fa-table me-2"></i>Department Details</h6>
                        </div>
                        <div class="card-body p-0">
                          <div class="table-responsive">
                            <table class="table budget-table mb-0">
                              <thead>
                                <tr>
                                  <th>Department</th>
                                  <th>Total Budget</th>
                                  <th>Allocated</th>
                                  <th>Used</th>
                                  <th>Remaining</th>
                                  <th>Utilization</th>
                                  <th>Requests</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr *ngFor="let dept of departmentBudgets">
                                  <td>
                                    <div class="d-flex align-items-center">
                                      <div class="dept-icon me-2" [attr.data-dept]="dept.departmentCode">
                                        {{ dept.departmentCode }}
                                      </div>
                                      <div>
                                        <div class="dept-name">{{ dept.departmentName }}</div>
                                        <small class="text-muted">{{ dept.departmentCode }}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td class="text-end">
                                    <strong>{{ dept.totalBudget | currency:'THB':'symbol':'1.0-0' }}</strong>
                                  </td>
                                  <td class="text-end">
                                    {{ dept.allocatedAmount | currency:'THB':'symbol':'1.0-0' }}
                                  </td>
                                  <td class="text-end">
                                    {{ dept.usedAmount | currency:'THB':'symbol':'1.0-0' }}
                                  </td>
                                  <td class="text-end">
                                    {{ dept.remainingAmount | currency:'THB':'symbol':'1.0-0' }}
                                  </td>
                                  <td>
                                    <div class="utilization-cell">
                                      <div class="progress utilization-progress">
                                        <div class="progress-bar" 
                                             [class]="getUtilizationClass(dept.utilizationPercent)"
                                             [style.width.%]="dept.utilizationPercent">
                                        </div>
                                      </div>
                                      <small>{{ dept.utilizationPercent }}%</small>
                                    </div>
                                  </td>
                                  <td>
                                    <span class="badge bg-primary">{{ dept.requestCount }}</span>
                                    <small class="text-muted ms-1">({{ dept.approvedCount }} approved)</small>
                                  </td>
                                  <td>
                                    <span class="status-badge" [ngClass]="'status-' + dept.status">
                                      {{ dept.status }}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Account Code Utilization Tab -->
              <div class="tab-pane fade" id="account-codes" role="tabpanel">
                <div class="tab-content-wrapper">
              
                  <!-- Account Code Filter -->
                  <div class="filter-controls mb-3">
                    <div class="row align-items-center">
                      <div class="col-md-3">
                        <select class="form-select" [(ngModel)]="selectedCategory" (change)="onFilterChange()">
                          <option value="">All Categories</option>
                          <option value="Personnel">Personnel</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Training">Training</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <select class="form-select" [(ngModel)]="selectedAccountStatus" (change)="onFilterChange()">
                          <option value="">All Status</option>
                          <option value="fully-allocated">Fully Allocated</option>
                          <option value="partially-allocated">Partially Allocated</option>
                          <option value="not-allocated">Not Allocated</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <input type="text" 
                               class="form-control" 
                               placeholder="Search account codes..."
                               [(ngModel)]="accountSearchText"
                               (input)="onFilterChange()">
                      </div>
                      <div class="col-md-2">
                        <button class="btn btn-primary">
                          <i class="fas fa-plus me-1"></i>Add Code
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Account Code Table -->
                  <div class="account-code-table-card">
                    <div class="card-header">
                      <h6><i class="fas fa-code me-2"></i>Account Code Details</h6>
                    </div>
                    <div class="card-body p-0">
                      <div class="table-responsive">
                        <table class="table budget-table mb-0">
                          <thead>
                            <tr>
                              <th>Account Code</th>
                              <th>Account Name</th>
                              <th>Category</th>
                              <th>Budget Amount</th>
                              <th>Allocated</th>
                              <th>Used</th>
                              <th>Remaining</th>
                              <th>Utilization</th>
                              <th>Requests</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let account of filteredAccountCodes" 
                                class="account-row" 
                                [ngClass]="'account-' + account.status"
                                (click)="onAccountCodeSelect(account)">
                              <td>
                                <div class="account-code">
                                  <strong>{{ account.accountCode }}</strong>
                                </div>
                              </td>
                              <td>
                                <div class="account-name">{{ account.accountName }}</div>
                              </td>
                              <td>
                                <span class="category-badge" [attr.data-category]="account.category">
                                  {{ account.category }}
                                </span>
                              </td>
                              <td class="text-end">
                                <strong>{{ account.budgetAmount | currency:'THB':'symbol':'1.0-0' }}</strong>
                              </td>
                              <td class="text-end">
                                {{ account.allocatedAmount | currency:'THB':'symbol':'1.0-0' }}
                              </td>
                              <td class="text-end">
                                {{ account.usedAmount | currency:'THB':'symbol':'1.0-0' }}
                              </td>
                              <td class="text-end">
                                <span [class]="account.remainingAmount < 0 ? 'text-danger' : 'text-success'">
                                  {{ account.remainingAmount | currency:'THB':'symbol':'1.0-0' }}
                                </span>
                              </td>
                              <td>
                                <div class="utilization-cell">
                                  <div class="progress utilization-progress">
                                    <div class="progress-bar" 
                                         [class]="getUtilizationClass(account.utilizationPercent)"
                                         [style.width.%]="Math.min(account.utilizationPercent, 100)">
                                    </div>
                                  </div>
                                  <small [class]="account.utilizationPercent > 100 ? 'text-danger' : ''">
                                    {{ account.utilizationPercent }}%
                                  </small>
                                </div>
                              </td>
                              <td class="text-center">
                                <span class="badge bg-info">{{ account.requestCount }}</span>
                              </td>
                              <td>
                                <span class="account-status-badge" [ngClass]="'status-' + account.status">
                                  <i class="fas" [ngClass]="{
                                    'fa-check-circle': account.status === 'fully-allocated',
                                    'fa-clock': account.status === 'partially-allocated',
                                    'fa-exclamation-triangle': account.status === 'not-allocated',
                                    'fa-arrow-up': account.status === 'over-utilized'
                                  }"></i>
                                  {{ getAccountStatusLabel(account.status) }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Analytics Tab -->
              <div class="tab-pane fade" id="analytics" role="tabpanel">
                <div class="tab-content-wrapper">
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
 
  `]
})
export class BudgetPlanDetailsComponent implements OnInit, AfterViewInit {
  
  Math = Math;
  budgetPlan?: any ={
    items:[]
  };
  budgetPlanItem : any =[];
  budgetSummary?: BudgetSummary;
  budgetRequests: BudgetRequest[] = [];
  departmentBudgets: DepartmentBudget[] = [];
  accountCodeBudgets: AccountCodeBudget[] = [];

  // Filter properties
  selectedDepartment = '';
  selectedStatus = '';
  searchText = '';
  viewMode: 'table' | 'card' = 'table';
  selectedCategory = '';
  selectedAccountStatus = '';
  accountSearchText = '';

  // Computed properties
  filteredRequests: BudgetRequest[] = [];
  filteredAccountCodes: AccountCodeBudget[] = [];
  screenWidth: number = 0;
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    //this.loadBudgetPlanData();
    this.getRow();
    this.initializeColumns();
    
    this.updateScreenWidth();
    window.addEventListener('resize', this.updateScreenWidth.bind(this));
  }
  updateScreenWidth() {
    this.screenWidth = window.innerWidth-350;
  }
  ngAfterViewInit(): void {
    this.initializeCharts();
  }
  treeData: any[] = [];
  flattenedData: any[] = [];
  columns: any = [];
  selectedLevel = '';
  showOnlyWithBudget = false;
  initializeColumns() {
    this.columns = [
      
       {
        title: 'Last Year', 
        name: 'LastYear', 
        format: NgTreeAccountFormat.number,
        showSummary:true,
        sort: true,
        summaryType: 'sum',
        class: 'text-end'
       },
       
       {
        title: 'Allocated', 
        name: 'Allocated', 
        format: NgTreeAccountFormat.number,
        showSummary:true,
        sort: true,
        editable:true,
        summaryType: 'sum',
        class: 'text-end'
       },
       {
        title: 'Budget', 
        name: 'TotalAmount', 
        format: NgTreeAccountFormat.number,
        showSummary:true,
        editable:true,
        sort: true,
        summaryType: 'sum',
        class: 'text-end'
       },
       {
        title: 'Change', 
        name: 'Change', 
        format: NgTreeAccountFormat.number,
        showSummary:true,
        sort: true,
        class: 'text-end'
       },
       {
        title: 'Action', 
        name: 'action',
        template: 'action'
       }
    ];
  }
  trackByItem = (index: number, item: any): any => {
    return item.id;
  };
   
  getRow() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.httpService.get("/budgetplan/get/" + id).subscribe({
        next: (response: any) => {
          this.budgetPlan = response.obj;
          this.budgetPlan.items  = response.items;;
          this.budgetPlanItem = response.items;
        },
        error: (error) => {
          this.alertService.error('Failed to load data');
          console.error('Error loading data:', error);
        }
      });
    }
  }
  onViewItem(item: any) {
    //this.router.navigate(['/budget-plan-detail', item.id]);
  }
  onFilterChanged(filterText: string) {
    console.log('Filter changed:', filterText);
  }

  onGroupingChanged(groupFields: string[]) {
    console.log('Grouping changed:', groupFields);
  }
  /*
  loadBudgetPlanData(): void {
    const id = this.route.snapshot.params['id'];
    this.httpService.get("/budgetplan/get/" + id).subscribe({
      next: (response: any) => {
        this.budgetPlan = response;
      },
      error: (error: any) => {
        console.error('Error loading budget plan:', error);
      }
    });

    this.budgetSummary = {
      totalBudget: 50000000,
      allocatedBudget: 42500000,
      remainingBudget: 7500000,
      utilizationPercent: 85,
      totalRequests: 24,
      approvedRequests: 18,
      pendingRequests: 6,
      rejectedRequests: 0
    };

    this.budgetRequests = [
      {
        id: 1,
        requestCode: 'BR-2025-001',
        title: 'อัพเกรดระบบ IT',
        department: 'IT',
        totalAmount: 2500000,
        allocatedAmount: 2500000,
        usedAmount: 350000,
        status: 'approved',
        priority: 'high',
        createdDate: new Date('2025-01-15'),
        utilizationPercent: 14
      },
      {
        id: 2,
        requestCode: 'BR-2025-002',
        title: 'แคมเปญการตลาด Q1',
        department: 'MKT',
        totalAmount: 850000,
        allocatedAmount: 850000,
        usedAmount: 425000,
        status: 'approved',
        priority: 'medium',
        createdDate: new Date('2025-01-20'),
        utilizationPercent: 50
      },
      {
        id: 3,
        requestCode: 'BR-2025-003',
        title: 'ฝึกอบรมพนักงาน',
        department: 'HR',
        totalAmount: 450000,
        allocatedAmount: 0,
        usedAmount: 0,
        status: 'pending',
        priority: 'low',
        createdDate: new Date('2025-01-25'),
        utilizationPercent: 0
      }
    ];

    this.departmentBudgets = [
      {
        departmentCode: 'IT',
        departmentName: 'IT Department',
        totalBudget: 20000000,
        allocatedAmount: 18500000,
        usedAmount: 3200000,
        remainingAmount: 15300000,
        utilizationPercent: 17,
        requestCount: 8,
        approvedCount: 6,
        status: 'on-track'
      },
      {
        departmentCode: 'MKT',
        departmentName: 'Marketing Department',
        totalBudget: 12000000,
        allocatedAmount: 9800000,
        usedAmount: 4200000,
        remainingAmount: 5600000,
        utilizationPercent: 43,
        requestCount: 6,
        approvedCount: 4,
        status: 'good'
      },
      {
        departmentCode: 'HR',
        departmentName: 'HR Department',
        totalBudget: 8000000,
        allocatedAmount: 6200000,
        usedAmount: 1800000,
        remainingAmount: 4400000,
        utilizationPercent: 29,
        requestCount: 4,
        approvedCount: 3,
        status: 'good'
      }
    ];

    this.accountCodeBudgets = [
      {
        accountCode: '5101-001',
        accountName: 'เงินเดือนพนักงาน',
        category: 'Personnel',
        budgetAmount: 15000000,
        allocatedAmount: 15000000,
        usedAmount: 7500000,
        remainingAmount: 7500000,
        utilizationPercent: 50,
        requestCount: 8,
        status: 'fully-allocated'
      },
      {
        accountCode: '5201-001',
        accountName: 'อุปกรณ์ IT',
        category: 'Equipment',
        budgetAmount: 8000000,
        allocatedAmount: 5200000,
        usedAmount: 1800000,
        remainingAmount: 3400000,
        utilizationPercent: 23,
        requestCount: 3,
        status: 'partially-allocated'
      },
      {
        accountCode: '5301-001',
        accountName: 'ค่าโฆษณาและประชาสัมพันธ์',
        category: 'Marketing',
        budgetAmount: 5000000,
        allocatedAmount: 0,
        usedAmount: 0,
        remainingAmount: 5000000,
        utilizationPercent: 0,
        requestCount: 0,
        status: 'not-allocated'
      }
    ];

    this.applyFilters();
  }
 

  initializeFilters(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    // Filter budget requests
    this.filteredRequests = this.budgetRequests.filter(request => {
      const matchesDepartment = !this.selectedDepartment || request.department === this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || request.status === this.selectedStatus;
      const matchesSearch = !this.searchText || 
        request.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        request.requestCode.toLowerCase().includes(this.searchText.toLowerCase());
      
      return matchesDepartment && matchesStatus && matchesSearch;
    });

    // Filter account codes
    this.filteredAccountCodes = this.accountCodeBudgets.filter(account => {
      const matchesCategory = !this.selectedCategory || account.category === this.selectedCategory;
      const matchesStatus = !this.selectedAccountStatus || account.status === this.selectedAccountStatus;
      const matchesSearch = !this.accountSearchText || 
        account.accountName.toLowerCase().includes(this.accountSearchText.toLowerCase()) ||
        account.accountCode.toLowerCase().includes(this.accountSearchText.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }
   */
  getUtilizationClass(percent: number): string {
    if (percent >= 80) return 'bg-success';
    if (percent >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getAccountCodeCount(status: string): number {
    return this.accountCodeBudgets.filter(account => account.status === status).length;
  }

  getAccountStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'fully-allocated': 'Fully Allocated',
      'partially-allocated': 'Partial',
      'not-allocated': 'Missing',
      'over-utilized': 'Over Used'
    };
    return labels[status] || status;
  }

  calculateBudgetEfficiency(): number {
    if (!this.budgetSummary) return 0;
    return Math.round((this.budgetSummary.allocatedBudget / this.budgetSummary.totalBudget) * 100);
  }

  calculateAvgApprovalTime(): string {
    return '8 days'; // Mock calculation
  }

  calculateRiskScore(): string {
    return 'Medium'; // Mock calculation
  }

  calculateForecastAccuracy(): number {
    return 87; // Mock calculation
  }
  

  getVarianceStatus(percent: number): string {
    const abs = Math.abs(percent);
    if (abs <= 5) return 'Good';
    if (abs <= 15) return 'Warning';
    return 'Critical';
  }

  getKeyInsights(): any[] {
    return [
      {
        type: 'positive',
        icon: 'fa-thumbs-up',
        title: 'Budget Utilization',
        description: 'Personnel budget is well-controlled at 50% usage'
      },
      {
        type: 'warning',
        icon: 'fa-exclamation-triangle',
        title: 'Equipment Overspend',
        description: 'Equipment category exceeded budget by 15%'
      },
      {
        type: 'info',
        icon: 'fa-info-circle',
        title: 'Marketing Underspend',
        description: 'Marketing has 16% remaining budget available'
      }
    ];
  }

  getRecommendations(): any[] {
    return [
      {
        priority: 'high',
        text: 'Review equipment procurement process to prevent future overspending'
      },
      {
        priority: 'medium',
        text: 'Consider reallocating unused marketing budget to high-priority projects'
      },
      {
        priority: 'low',
        text: 'Implement monthly budget review meetings for better tracking'
      }
    ];
  }

  // Chart initialization methods
  private initializeCharts(): void {
    this.initBudgetOverviewChart();
    this.initDepartmentChart();
    this.initBudgetTrendChart();
    this.initCategoryComparisonChart();
    this.initForecastChart();
  }

  private initBudgetOverviewChart(): void {
    console.log('Initializing Budget Overview Chart');
  }

  private initDepartmentChart(): void {
    console.log('Initializing Department Chart');
  }

  private initBudgetTrendChart(): void {
    console.log('Initializing Budget Trend Chart');
  }

  private initCategoryComparisonChart(): void {
    console.log('Initializing Category Comparison Chart');
  }

  private initForecastChart(): void {
    console.log('Initializing Forecast Chart');
  }

  // Event handlers
  onFilterChange(): void {
    //this.applyFilters();
  }

  onViewModeChange(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }
  onNewRequest(): void {
    this.router.navigate(['/budget/requests/create/'+this.budgetPlan?.id]);
  }
  onRequestAction(action: string, request: BudgetRequest): void {
    switch (action) {
      case 'view':
        this.viewRequest(request);
        break;
      case 'edit':
        this.editRequest(request);
        break;
      case 'history':
        this.viewRequestHistory(request);
        break;
      case 'delete':
        this.deleteRequest(request);
        break;
    }
  }

  private viewRequest(request: BudgetRequest): void {
    console.log('Viewing request:', request.requestCode);
  }

  private editRequest(request: BudgetRequest): void {
    console.log('Editing request:', request.requestCode);
  }

  private viewRequestHistory(request: BudgetRequest): void {
    console.log('Viewing history for request:', request.requestCode);
  }

  private deleteRequest(request: BudgetRequest): void {
    if (confirm(`Are you sure you want to delete request ${request.requestCode}?`)) {
      console.log('Deleting request:', request.requestCode);
    }
  }

  onDepartmentSelect(department: DepartmentBudget): void {
    console.log('Selected department:', department.departmentCode);
  }

  onAccountCodeSelect(accountCode: AccountCodeBudget): void {
    console.log('Selected account code:', accountCode.accountCode);
  }

  // Export functions
  exportBudgetPlan(): void {
    console.log('Exporting budget plan data');
  }

  exportRequests(): void {
    console.log('Exporting budget requests');
  }

  exportDepartmentData(): void {
    console.log('Exporting department data');
  }

  exportAccountCodes(): void {
    console.log('Exporting account codes');
  }

  exportAnalytics(): void {
    console.log('Exporting analytics data');
  }

  onEditBudgetPlan(): void {
     this.router.navigate(['/budget/plan/edit', this.budgetPlan?.id]);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercent(value: number): string {
    return `${Math.round(value)}%`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  refreshData(): void {
    //this.loadBudgetPlanData();
    console.log('Data refreshed');
  }
  onCancel(): void {
    this.router.navigate(['/budget/plan/list']);
  }
  refreshCharts(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }
  async onChangeStatus(status: string): Promise<void> {
     var confirm =await this.alertService.confirm( {message:"Are you sure change status this record?", title:"Change Status"})
      if (confirm.isConfirmed) {
      this.httpService.get("/budgetplan/change-status/" + this.budgetPlan?.id + "/" + status)
        .subscribe(() => {
          this.refreshData();
          this.alertService.success("Change status completed.", 'Success.');
        },
        error => {
          this.alertService.error(error.message, 'Error!');
        });
    }
  }
  

}