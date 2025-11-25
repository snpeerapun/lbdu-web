import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BudgetService } from 'src/app/shared/services/budget.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { AuthService } from '../../shared/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BudgetItemComponent } from './budget-request-item.component';
import { NgTreeTable3Format } from 'src/app/components/forms/ng-tree-table3.component';
interface Budget {
  id: number;
  name: string;
  items: BudgetItem[];
  totalAmount: number;
}

interface BudgetItem {
  id: number;
  category: string;
  description: string;
  totalAmount: number;
  allocations: BudgetAllocation[];
}

interface BudgetAllocation {
  id: number;
  month: number;
  amount: number;
}


@Component({
  selector: 'app-budget-request-detail',
  styles: [
    `
 
 
    `
  ],
  template: `
   <div class="row">
    <div class="col-12">
      <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"> Budget Request <div class="badge" [ngStyle]="{'background-color': budget.statusColor}">{{budget.statusName}}</div></h5>
        <div>
         
          <button class="btn btn-warning btn-sm me-2" *ngIf="budget.statusCode == '01'" (click)="onChangeStatus('02')">
            <i class="fas fa-check me-2"></i>Confirm
          </button>
          <button class="btn btn-danger btn-sm me-2" *ngIf="budget.statusCode == '02'" (click)="onChangeStatus('03')">
            <i class="fas fa-times me-2"></i>Cancel
          </button>
         
        </div>
      </div>
        <div class="card-body">
          <div *ngIf= "budget">
            <!-- Basic Info -->
            <div class="row mb-4">
              <div class="col-md-12">
                <div class="card shadow-none border">
                  <div class="card-body">
                   
                    <div class="row g-3">
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">เลขที่</label>
                        <p class="mb-0 fw-medium">{{ budget.docNo }}</p>
                      </div>
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">Request Date</label>
                        <p class="mb-0 fw-medium">{{ budget.docDate }}</p>
                      </div>
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">Department</label>
                        <p class="mb-0">{{  budget.departmentName  }}</p>
                      </div>
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">Request By</label>
                        <p class="mb-0">{{ budget.fullName }}</p>
                      </div>
                   
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">Fiscal Year</label>
                        <p class="mb-0">{{ budget.fiscalYear }}</p>
                      </div>
                     
                      <div class="col-sm-6">
                        <label class="form-label text-muted small mb-1">Status</label>
                        <div>
                          <div class="badge rounded-pill" [ngStyle]="{'background-color': budget.statusColor}">{{budget.statusName}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Monthly Allocation -->
      
          <h6  >Monthly Allocation</h6>
          <div class="mb-3">
            
              <div class="d-flex align-items-center justify-content-end" *ngIf="obj.statusCode == '01'" >
                <button class="btn btn-primary btn-sm me-2" (click)="onAddItem()">
                  <i class="fas fa-plus me-2"></i>Add Item
                </button>
                <!--<button class="btn btn-success btn-sm" (click)="exportExcel()">
                  <i class="fas fa-file-excel me-2"></i>Export Excel
                </button>    -->
              </div>
            </div>
            <div class="table-responsive mt-3" [style.width.px]="screenWidth">
              <ng-tree-table3 
                [data]="budget.items" 
                [columns]="columns" 
                [trackBy]="trackByItem"
              
                [allowSummary]="true"
                [showFilter]="false"
                [showGroupingControls]="true"
                
                (filterChanged)="onFilterChanged($event)"
                (groupingChanged)="onGroupingChanged($event)">
                  <ng-template #action let-node let-column="column" >
                      <div class="gap-2" *ngIf="!node.isGroupRow">
                        <button class="btn btn-sm btn-outline-primary mr-2" 
                              (click)="onEditItem(node)"
                              [title]="'Edit ' + node.code">
                                  <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="onDeleteItem(node)"
                                [title]="'Delete ' + node.code">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </ng-template>
                    
              </ng-tree-table3>
            </div>
          <!-- <button class="btn btn-outline-success btn-sm mt-3" (click)="exportExcel()">
            <i class="fas fa-file-excel me-2"></i>Export Excel
          </button>    -->
        
        </div>
        </div>
        <div class="card-footer">
          <div  class="d-flex justify-content-end ">
          <div>
          
           
            <button class="btn btn-secondary" (click)="onBack()">
              <i class="fas fa-arrow-left me-2"></i>Back
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `
})
export class BudgetRequestDetailComponent implements OnInit {

  budget: any = {
    items: []
  };
  columns: any = [];
  departments: any = [];
  categories: any = [];
  loading = true;
  error: string | null = null;
  obj: any = {};
  screenWidth: number = 0;
  constructor(

    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService,
    private alertService: AlertService,
    private modalService: ModalService
  ) { 
    this.initializeColumns();
    this.updateScreenWidth();
    window.addEventListener('resize', this.updateScreenWidth.bind(this));
  }
  updateScreenWidth() {
    this.screenWidth = window.innerWidth-300;
  }

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 
  initializeColumns() {
    this.columns = [
    
      
      {
        key:"accountType",
        header:"Account Type",
        width:'140px',
        isGroup:true
      },
      
      {
        key:"accountName",
        header:"Account Name",
        width:'140px',
        isGroup:true
      },
      {
        key:"description",
        header:"Description",
        width:'140px',

      },
      
      {
        key: 'totalAmount',
        header: 'Total',
        width: '140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key: 'actions',
        header: 'Actions',
        template: 'action',
        width:'200px',
        class: 'text-center'
      }
    ];
  }
   
    onFilterChanged(filterText: string) {
      console.log('Filter changed:', filterText);
    }
  
    onGroupingChanged(groupFields: string[]) {
      console.log('Grouping changed:', groupFields);
    }
  
  /*
   ngOnInit(): void {
     this.loading = true;
     this.route.paramMap.subscribe(params => {
       const id = params.get('id');
       if (id) {
         this.loadBudget(id);
       } else {
         this.error = 'ไม่พบรหัสงบประมาณ';
         this.loading = false;
       }
     });
 
     
   }
 */
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getRow(id);
      //this.loadBudget(1);
    }
  }
  getRow(id: number) {
    this.httpService.get("/budgetrequest/get/" + id).subscribe({
      next: (response: any) => {
        this.budget = response.budget;
        this.budget.items = response.items;
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  onAddItem() {
    this.modalService.show({
      component: BudgetItemComponent,
      title: 'Add Budget Item',
      size: 'lg',

      data: { budgetId: this.budget.id }
    }).then(result => {
      if (result) {
        this.getRow(this.budget.id);
      }
    });

  }


  /*
    loadBudget(id: string): void {
      this.loading = true;
      this.error = '';
      
      this.budgetService.getBudgetById(id).subscribe({
        next: (budget) => {
          if (budget) {
            this.budget = budget;
            this.loading = false;
          } else {
            this.error = `ไม่พบงบประมาณรหัส ${id}`;
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message;
          this.loading = false;
        }
      });
    }
  
    getDepartmentName(code: string): string {
      return this.departments.find(d => d.code === code)?.name || code;
    }
  
    getCategoryName(categoryId: number): string {
      const category = this.categories.find(c => c.id === categoryId);
      return category?.name || 'ไม่ระบุ';
    }
  
    getSubCategoryName(categoryId: number, subCategoryId: number): string {
      const category = this.categories.find(c => c.id === categoryId);
      const subCategory = category?.subCategories.find(s => s.id === subCategoryId);
      return subCategory?.name || 'ไม่ระบุ';
    }
  
    getStatusClass(status: string): string {
      switch (status?.toLowerCase()) {
        case 'approved': return 'bg-success';
        case 'pending': return 'bg-warning';
        case 'rejected': return 'bg-danger';
        case 'draft': return 'bg-secondary';
        default: return 'bg-secondary';
      }
    }
  
    getStatusText(status: string): string {
      switch (status?.toLowerCase()) {
        case 'approved': return 'อนุมัติ';
        case 'pending': return 'รออนุมัติ';
        case 'rejected': return 'ไม่อนุมัติ';
        case 'draft': return 'แบบร่าง';
        default: return 'ไม่ระบุ';
      }
    }
  
    formatDate(date: Date | string): string {
      try {
        return new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return String(date);
      }
    }
  
  
  
  
  
  
  */


  getMonthName(month: number): string {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return monthNames[month - 1];
  }

  formatCurrency(value: number): string {
    if (value)
      return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
    return '';
    //return value;
  }

  getAllocationAmount(allocations: BudgetAllocation[], month: number): number {
    const allocation = allocations.find(a => a.month === month);
    return allocation ? allocation.amount : 0;
  }
  exportExcel() {
    this.httpService.download("/budgetrequest/export-excel/" + this.budget.id).subscribe({
      next: (response: any) => {  
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `budget_${this.budget.id}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success("Export completed.", 'Success.');   
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    })
  }
  calculateMonthlyTotal(month: number): number {
    if (!this.budget?.budgetItems) return 0;

    return this.budget.budgetItems.reduce((total: any, item: { budgetAllocations: any[]; }) => {
      const allocation = item.budgetAllocations?.find((a: { month: number; }) => a.month === month);
      return total + (allocation ? allocation.amount : 0);
    }, 0);
  }



  trackByMonth(index: number, month: number): number {
    return month;
  }

  trackByItem = (index: number, item: any): any => {
    return item.id;
  };
  onBack(): void {
    this.router.navigate(['/budget/requests/list']);
  }

  onEdit(): void {
    this.router.navigate(['/budget/requests/edit', this.budget.id]);
  }
  onEditItem(obj: any) {

    this.modalService.show({
      component: BudgetItemComponent,
      title: 'Add Budget Item',
      size: 'lg',
      data: obj
    }).then(result => {
      console.log('result', result)
      if (result) {
        this.getRow(this.budget.id);
      }
    });
  }
  async onDeleteItem(arg0: any) {
    var result = await this.alertService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
    });
    if (result) {
      this.httpService.get("/budgetrequest/item/delete/" + arg0)
        .subscribe(response => {
          this.getRow(this.budget.id);
          this.alertService.success("Delete completed.", 'Success.');
        },
          error => {
            this.alertService.error(error.message, 'Error!');
          });
    }
  }
  async onChangeStatus(status: string) {
    var result= await this.alertService.confirm({
       title: 'Confirm Change Status',
       message: 'Are you sure you want to change status?',
     });
     if(result.isConfirmed){
       this.httpService.get("/budgetrequest/change-status/" + this.budget.id + "/" + status)
       .subscribe({
         next: (response) => {
           this.getRow(this.budget.id);
           this.alertService.success("Change status completed.", 'Success.');
         },
         error: (error) => {
           this.alertService.error(error.error.message, 'Error!');
         }
       });
     }
   }
}
