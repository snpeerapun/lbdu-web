import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bank-branch-component',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <div>
              <h5 class="mb-0">Bank Branches</h5>
              <span *ngIf="selectedBank" class="badge bg-primary">
                {{ selectedBank.nameTh }} ({{ selectedBank.bankCode }})
              </span>
            </div>
            <div>
              <button class="btn btn-secondary me-2" (click)="backToBankList()" *ngIf="bankId">
                <i class="fas fa-arrow-left me-2"></i> Back to Banks
              </button>
              <button class="btn btn-primary" (click)="onCreate()">
                <i class="fas fa-plus me-2"></i> Add New Branch
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Bank Filter (if not filtered by bankId) -->
            <div class="row mb-3" *ngIf="!bankId">
              <div class="col-md-4">
                <label class="form-label">Filter by Bank</label>
                <ng-select
                  [options]="bankList"
                  valueProp="id"
                  labelProp="name"
                  [(ngModel)]="selectedBankId"
                  (change)="onBankFilterChange()"
                  placeholder="All Banks">
                </ng-select>
              </div>
            </div>

            <ng-table   
              #table
              tableId="bankBranch"
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
                  <button class="btn btn-outline-danger btn-sm me-1" (click)="onDelete(item)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </ng-template>    
              
              <ng-template #status let-item="row">               
                <i class="fa fa-check text-primary" style="font-size:16px" *ngIf="item.isActive==1"></i>
                <i class="fa fa-times text-danger" style="font-size:16px" *ngIf="item.isActive==0"></i>
              </ng-template>

              <ng-template #bankName let-item="row">
                <span *ngIf="item.bank">
                  {{ item.bank.nameTh }}
                  <small class="text-muted">({{ item.bank.bankCode }})</small>
                </span>
              </ng-template>
            </ng-table>
          </div>
        </div>        
      </div>
    </div>
  `
})
export class BankBranchComponent implements OnInit {

  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  bankId: number | null = null;
  selectedBankId: number | null = null;
  selectedBank: any = null;
  bankList: any[] = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private toast: ToastService,
  ) {}
 
  ngOnInit() {
    // Check if bankId is passed in route params
    this.route.params.subscribe(params => {
      if (params['bankId']) {
        this.bankId = +params['bankId'];
        this.loadBankInfo();
      }
    });

    this.loadBanks();
  }

  loadBankInfo() {
    if (!this.bankId) return;
    
    this.httpService.get(`/bank/get/${this.bankId}`).subscribe({
      next: (response: any) => {
        this.selectedBank = response;
      },
      error: (error) => {
        console.error('Error loading bank:', error);
      }
    });
  }

  loadBanks() {
    this.httpService.get('/bank/getall').subscribe({
      next: (response: any) => {
        this.bankList = response.map((bank: any) => ({
          id: bank.id,
          name: `${bank.nameTh} (${bank.bankCode})`
        }));
      },
      error: (error) => {
        console.error('Error loading banks:', error);
      }
    });
  }

  onBankFilterChange() {
    this.table.refresh();
  }
 
  public datasource = (params: any): Observable<any> => {
    // Add bankId filter if present
    if (this.bankId) {
      params.bankId = this.bankId;
    } else if (this.selectedBankId) {
      params.bankId = this.selectedBankId;
    }
    return this.httpService.post(`/bankbranch/list`, params);
  };

  onDelete(obj: any) {
    if (confirm("Are you sure you want to delete this branch?")) {
      this.httpService.get(`/bankbranch/delete/${obj.id}`)
        .subscribe({
          next: (response) => {
            this.table.refresh();
            this.toast.success("Branch deleted successfully.", 'Success');          
          },
          error: (error) => {
            this.toast.error(error.message, 'Error!');
          }
        });
    }
  }

  onEdit(e: any) {
    this.router.navigate(['/master/bank-branch/editing/' + e.id]);
  }

  onCreate() {
    if (this.bankId) {
      this.router.navigate(['/master/bank-branch/create'], {
        queryParams: { bankId: this.bankId }
      });
    } else {
      this.router.navigate(['/master/bank-branch/create']);
    }
  }

  backToBankList() {
    this.router.navigate(['/master/bank']);
  }

  checkedItemIds: any[] = [];

  onCheckedItemsChange(checkedItems: any[]): void {
    this.checkedItemIds = checkedItems.map((item) => item.id);
    console.log('Checked item ids:', this.checkedItemIds);
  }

  public columns: Array<NgTableColumn> = [  
    { title: 'Bank', template: 'bankName', sort: true, width: '25%' },
    { title: 'Branch Code', name: 'branchCode', sort: true, width: '12%' },
    { title: 'Branch Name (TH)', name: 'nameTh', sort: true, width: '20%' },
    { title: 'Branch Name (EN)', name: 'nameEn', sort: true, width: '25%' },
    { title: 'Status', align: 'center', name: 'isActive', template: 'status', width: '8%', sort: false },
    { template: 'action', width: '15%', sort: false },
  ];
}