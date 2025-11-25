import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bank-component',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Banks</h5>
            <div>
              <button class="btn btn-primary me-2" (click)="onCreate()">
                <i class="fas fa-plus me-2"></i> Add New Bank
              </button>
           
            </div>
          </div>
          <div class="card-body">
            <ng-table   
              #table
              tableId="bank"
              [columns]="columns" 
              [datasource]="datasource" 
              [allowCheckbox]="false"
              [allowExport]="true"
              [defaultSortColumn]="'id'"              
              (checkedItemsChange)="onCheckedItemsChange($event)"
            >
              <ng-template #action let-item="row">
                <div class="">
                  <button class="btn btn-outline-info btn-sm me-1" (click)="onEdit(item)" title="Edit">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-success btn-sm me-1" (click)="viewBranches(item)" title="View Branches">
                    <i class="fa fa-code-branch"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm me-1" (click)="onDelete(item)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </ng-template>    
              
              <ng-template #status let-item="row">               
                <i class="fa fa-check text-primary" style="font-size:16px" *ngIf="item.isActive==1"></i>
                <i class="fa fa-times text-danger" style="font-size:16px" *ngIf="item.isActive==0"></i>
              </ng-template>

              <ng-template #branchCount let-item="row">
                <span class="badge bg-info">{{ item.branchCount || 0 }} branches</span>
              </ng-template>
            </ng-table>
          </div>
        </div>        
      </div>
    </div>
  `
})
export class BankComponent implements OnInit {

  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  constructor(
    private router: Router,
    private httpService: HttpService,
    private toast: ToastService,
  ) {}
 
  ngOnInit() {}
 
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/bank/list`, params);
  };

  onDelete(obj: any) {
    if (confirm("Are you sure you want to delete this bank?")) {
      this.httpService.get(`/bank/delete/${obj.id}`)
        .subscribe({
          next: (response) => {
            this.table.refresh();
            this.toast.success("Bank deleted successfully.", 'Success');          
          },
          error: (error) => {
            this.toast.error(error.message, 'Error!');
          }
        });
    }
  }

  onEdit(e: any) {
    this.router.navigate(['/master/bank/editing/' + e.id]);
  }

  onCreate() {
    this.router.navigate(['/master/bank/create']);
  }

  viewBranches(bank: any) {
    this.router.navigate(['/master/bank-branch', bank.id]);
  }

  onManageBranches() {
    this.router.navigate(['/master/bank-branch']);
  }

  checkedItemIds: any[] = [];

  onCheckedItemsChange(checkedItems: any[]): void {
    this.checkedItemIds = checkedItems.map((item) => item.id);
    console.log('Checked item ids:', this.checkedItemIds);
  }

  public columns: Array<NgTableColumn> = [  
    { title: 'Bank Code', name: 'bankCode', sort: true, width: '10%' },
    { title: 'Name (TH)', name: 'nameTh', sort: true, width: '25%' },
    { title: 'Short Name (EN)', name: 'shortNameEn', sort: true, width: '15%' },
    { title: 'Full Name (EN)', name: 'fullNameEn', sort: true, width: '25%' },
    //{ title: 'Branches', template: 'branchCount', align: 'center', width: '10%', sort: false },
    { title: 'Status', align: 'center', name: 'isActive', template: 'status', width: '8%', sort: false },
    { template: 'action', width: '15%', sort: false },
  ];
}