import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { ToastService } from 'src/app/shared/services/toast.service';
@Component({
  selector: 'app-amc-component',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Asset Management Companies</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New AMC
            </button>
          </div>
          <div class="card-body">
            <ng-table   
              #table
              tableId="amc"
              [columns]="columns" 
              [datasource]="datasource" 
              [allowCheckbox]="false"
              [allowExport]="true"
              [defaultSortColumn]="'id'"              
              (checkedItemsChange)="onCheckedItemsChange($event)"
            >
              <ng-template #action let-item="row">
                <button class="btn btn-info btn-sm mr-1" (click)="onEdit(item)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" (click)="onDelete(item)">
                  <i class="fa fa-trash"></i>
                </button>
              </ng-template>    
              
              <ng-template #status let-item="row">               
                <i class="fa fa-check text-primary" style="font-size:16px" *ngIf="item.isActive==1"></i>
                <i class="fa fa-times text-danger" style="font-size:16px" *ngIf="item.isActive==0"></i>
              </ng-template>
              
              <ng-template #cutoffTime let-item="row">
                <span *ngIf="item.defaultCutoffTime">
                  {{ item.defaultCutoffTime | date:'HH:mm' }}
                </span>
                <span *ngIf="!item.defaultCutoffTime" class="text-muted">-</span>
              </ng-template>
            </ng-table>
          </div>
        </div>        
      </div>
    </div>
  `
})
export class AmcComponent implements OnInit {

  permission: any = {};
  data: any;
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  constructor(
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}
 
  ngOnInit() {
    // Initialize component
  }
 
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/amc/list`, params);
  };

  onDelete(obj: any) {
    if (confirm("Are you sure you want to delete this AMC?")) {
      this.httpService.get(`/amc/delete/${obj.id}`)
        .subscribe({
          next: (response) => {
            this.table.refresh();
            this.toast.success("AMC deleted successfully.", 'Success');          
          },
          error: (error) => {
            this.toast.error(error.message, 'Error!');
          }
        });
    }
  }

  onEdit(e: any) {
    this.router.navigate(['/master/amc/editing/' + e.id]);
  }

  onCreate() {
    this.router.navigate(['/master/amc/create']);
  }

  onExport() {
    this.httpService.export("/amc/export")
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `amc_${new Date().toISOString()}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.toast.error('Failed to export data', 'Error');
        }
      });
  }

  checkedItemIds: any[] = [];

  onCheckedItemsChange(checkedItems: any[]): void {
    this.checkedItemIds = checkedItems.map((item) => item.id);
    console.log('Checked item ids:', this.checkedItemIds);
  }

  public columns: Array<NgTableColumn> = [  
    { title: 'AMC Code', name: 'amcCode', sort: true, width: '10%' },
    { title: 'Short Name', name: 'shortName', sort: true },
    //{ title: 'Short Name (FundCx)', name: 'shortNameFundCx', sort: true },
    { title: 'Full Name (TH)', name: 'fullNameTh', sort: true },
    //{ title: 'Full Name (EN)', name: 'fullNameEn', sort: true },
    { title: 'Contact', name: 'contactName', sort: true },
    { title: 'Phone', name: 'phoneNo', sort: true, width: '10%' },
    //{ title: 'Cutoff Time', name: 'defaultCutoffTime', template: 'cutoffTime', align: 'center', width: '10%', sort: true },
    { title: 'Status', align: 'center', name: 'isActive', template: 'status', width: '8%', sort: false },
    { template: 'action', width: '10%', sort: false },
  ];
}