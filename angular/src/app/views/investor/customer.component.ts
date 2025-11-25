import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';

@Component({
  selector: 'app-customer',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Customer Management</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New Customer
            </button>
          </div>
          
          <!-- Filter Section -->
          <div class="card-body pb-0">
            <div class="row g-3 mb-3">
              <!-- Search -->
              <div class="col-md-3">
                <label class="form-label">Search</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="filters.searchText"
                  (keyup.enter)="onFilterChange()"
                  placeholder="Name, ID Card, Customer Code...">
              </div>
              
              <!-- Customer Type -->
              <div class="col-md-2">
                <label class="form-label">Customer Type</label>
                <select class="form-select" [(ngModel)]="filters.customerType" (change)="onFilterChange()">
                  <option value="">All Types</option>
                  <option value="Individual">Individual</option>
                  <option value="Juristic">Juristic</option>
                  <option value="Minor">Minor</option>
                  <option value="Foreign">Foreign</option>
                </select>
              </div>
              
              <!-- Status -->
              <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select" [(ngModel)]="filters.status" (change)="onFilterChange()">
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <!-- KYC Status -->
              <div class="col-md-2">
                <label class="form-label">KYC Status</label>
                <select class="form-select" [(ngModel)]="filters.kycStatus" (change)="onFilterChange()">
                  <option value="">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Expiring">Expiring Soon</option>
                </select>
              </div>
              
              <!-- FATCA Status -->
              <div class="col-md-2">
                <label class="form-label">FATCA Status</label>
                <select class="form-select" [(ngModel)]="filters.fatcaStatus" (change)="onFilterChange()">
                  <option value="">All</option>
                  <option value="US Person">US Person</option>
                  <option value="Non-US">Non-US</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <!-- Clear Button -->
              <div class="col-md-1">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-secondary w-100" (click)="onClearFilter()">
                  <i class="fas fa-redo me-1"></i> Clear
                </button>
              </div>
            </div>
          </div>
          
          <!-- Table Section -->
          <div class="card-body pt-0">
            <ng-table   
              #table
              tableId="customer"
              [columns]="columns" 
              [datasource]="datasource" 
              [allowCheckbox]="false"
              [allowExport]="true"
              (checkedItemsChange)="onCheckedItemsChange($event)"
            >
              <!-- Customer Type Template -->
              <ng-template #customerType let-item="row">
                <span class="badge" 
                      [class.bg-primary]="item.customerType === 'Individual'"
                      [class.bg-info]="item.customerType === 'Juristic'"
                      [class.bg-warning]="item.customerType === 'Minor'"
                      [class.bg-secondary]="item.customerType === 'Foreign'">
                  {{ item.customerType }}
                </span>
              </ng-template>
              
              <!-- Customer Name Template -->
              <ng-template #customerName let-item="row">
                <div>
                  <strong>{{ item.customerName }}</strong>
                 
                </div>
              </ng-template>
              
              <!-- ID Number Template -->
              <ng-template #idNumber let-item="row">
                <div>
                  <span *ngIf="item.citizenId">{{ item.citizenId  }}</span>
                  <span *ngIf="item.passportNo">{{ item.passportNo }}</span>
                  <span *ngIf="item.taxId">{{ item.taxId }}</span>
                </div>
              </ng-template>
              
 
              <!-- Status Template -->
              <ng-template #status let-item="row">               
                <span class="badge" 
                      [class.bg-success]="item.status === 'Active'" 
                      [class.bg-secondary]="item.status === 'Inactive'"
                      [class.bg-warning]="item.status === 'Pending'">
                  {{ item.status }}
                </span>
              </ng-template>
              
              <!-- KYC Status Template -->
              <ng-template #kycStatus let-item="row">
                <span class="badge" 
                      [class.bg-success]="item.kycStatus === 'Completed'" 
                      [class.bg-warning]="item.kycStatus === 'Pending' || item.kycStatus === 'Expiring'"
                      [class.bg-danger]="item.kycStatus === 'Expired'">
                  {{ item.kycStatus }}
                </span>
              </ng-template>
              
              <!-- Action Template -->
              <ng-template #action let-item="row">
                <button class="btn btn-info btn-sm me-1" (click)="onEdit(item)" title="Edit">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-warning btn-sm me-1" (click)="onView(item)" title="View Details">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-success btn-sm me-1" (click)="onOpenAccount(item)" title="Open Account">
                  <i class="fa fa-folder-plus"></i>
                </button>
                <button class="btn btn-danger btn-sm" (click)="onDelete(item)" title="Delete">
                  <i class="fa fa-trash"></i>
                </button>
              </ng-template>    
            </ng-table>
          </div>
        </div>        
      </div>
    </div>
  `
})
export class CustomerComponent implements OnInit {
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  // Filter state
  filters: any = {
    searchText: '',
    customerType: '',
    status: '',
    kycStatus: '',
    fatcaStatus: ''
  };
  
  constructor(
    private router: Router,
    private httpService: HttpService,
    private alertService: AlertService
  ) {}
 
  ngOnInit() {
    // Load initial data
  }
  
  onFilterChange() {
    this.table.refresh();
  }
  
  onClearFilter() {
    this.filters = {
      searchText: '',
      customerType: '',
      status: '',
      kycStatus: '',
      fatcaStatus: ''
    };
    this.table.refresh();
  }
 
  public datasource = (params: any): Observable<any> => {    
    // Merge filters with pagination params
    const requestParams = {
      ...params,
      ...this.filters
    };
    return this.httpService.post(`/customer/list`, requestParams);
  };

  onDelete(obj: any) {
    if (confirm(`Are you sure you want to delete customer "${obj.firstNameTh} ${obj.lastNameTh}"?`)) {
      this.httpService.delete(`/customer/delete/${obj.id}`)
        .subscribe({
          next: (response) => {
            this.table.refresh();
            this.alertService.success("Customer deleted successfully.", 'Success');          
          },
          error: (error) => {
            this.alertService.error(error?.error?.message || 'Failed to delete customer', 'Error!');
          }
        });
    }
  }

  onEdit(item: any) {
    this.router.navigate(['/investor/customer/editing', item.id]);
  }
  
  onView(item: any) {
    this.router.navigate(['/investor/customer/view', item.id]);
  }

  onCreate() {
    this.router.navigate(['/investor/customer/create']);
  }
  
  onOpenAccount(item: any) {
    this.router.navigate(['/account/create'], { 
      queryParams: { customerId: item.id } 
    });
  }

  onExport() {
    this.httpService.export("/customer/export")
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.alertService.error('Failed to export data', 'Error');
        }
      });
  }

  checkedItemIds: any[] = [];
  onCheckedItemsChange(checkedItems: any[]): void {
    this.checkedItemIds = checkedItems.map((item) => item.id);
    console.log('Checked item ids:', this.checkedItemIds);
  }

  public columns: Array<NgTableColumn> = [  
 

    { 
      title: 'Customer Name', 
      name: 'customerName',
      template: 'customerName',
      sort: true 
    },
    { 
      title: 'ID/Tax Number', 
      name: 'cardNumber',
      sort: false,
      width: '12%' 
    },
        { 
      title: 'Type', 
      name: 'customerType', 
      template: 'customerType',
      align: 'center',
      sort: true, 
      width: '8%' 
    },
    { 
      title: 'Mobile', 
      name: 'mobileNo',
      sort: false,
      width: '15%' 
    },
    { 
      title: 'Status', 
      align: 'center', 
      name: 'status', 
      template: 'status', 
      width: '8%', 
      sort: true 
    },
 
   
    { 
      template: 'action', 
      width: '15%', 
      sort: false 
    },
  ];
}