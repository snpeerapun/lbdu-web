import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';

@Component({
  selector: 'app-fund',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Fund Management</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New Fund
            </button>
          </div>
          
          <!-- Filter Section -->
          <div class="card-body pb-0">
            <div class="row g-3 mb-3">
              <div class="col-md-3">
                <label class="form-label">AMC</label>
                <select class="form-select" [(ngModel)]="filters.amcId" (change)="onFilterChange()">
                  <option value="">All AMCs</option>
                  <option *ngFor="let amc of amcList" [value]="amc.id">
                    {{ amc.amcCode }} - {{ amc.shortName }}
                  </option>
                </select>
              </div>
              
              <div class="col-md-3">
                <label class="form-label">Fund Type</label>
                <select class="form-select" [(ngModel)]="filters.fundTypeId" (change)="onFilterChange()">
                  <option value="">All Types</option>
                  <option *ngFor="let type of fundTypeList" [value]="type.id">
                    {{ type.fundTypeNameTh }}
                  </option>
                </select>
              </div>
              
              <div class="col-md-2">
                <label class="form-label">Risk Level</label>
                <select class="form-select" [(ngModel)]="filters.riskLevel" (change)="onFilterChange()">
                  <option value="">All Levels</option>
                  <option value="1">1 (Lowest)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8 (Highest)</option>
                </select>
              </div>
              
              <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select" [(ngModel)]="filters.isActive" (change)="onFilterChange()">
                  <option value="">All</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
              
              <div class="col-md-2">
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
              tableId="fund"
              [columns]="columns" 
              [datasource]="datasource" 
              [allowCheckbox]="false"
              [allowExport]="true"
              [defaultSortColumn]="'fundCodeSa'"
              (checkedItemsChange)="onCheckedItemsChange($event)"
            >
              <!-- Action Template -->
              <ng-template #action let-item="row">
                <button class="btn btn-info btn-sm me-1" (click)="onEdit(item)" title="Edit">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-warning btn-sm me-1" (click)="onView(item)" title="View Details">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" (click)="onDelete(item)" title="Delete">
                  <i class="fa fa-trash"></i>
                </button>
              </ng-template>    
              
              <!-- Status Template -->
              <ng-template #status let-item="row">               
                <span class="badge" [class.bg-success]="item.isActive" [class.bg-secondary]="!item.isActive">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </ng-template>
              
              <!-- Risk Level Template -->
              <ng-template #riskLevel let-item="row">
                <span class="badge" 
                      [class.bg-success]="item.riskLevel <= 3"
                      [class.bg-warning]="item.riskLevel > 3 && item.riskLevel <= 6"
                      [class.bg-danger]="item.riskLevel > 6">
                  {{ item.riskLevel || '-' }}
                </span>
              </ng-template>
              
              <!-- Open Ended Template -->
              <ng-template #openEnded let-item="row">
                <i class="fa fa-check text-success" *ngIf="item.isOpenEnded"></i>
                <i class="fa fa-times text-danger" *ngIf="!item.isOpenEnded"></i>
              </ng-template>
            </ng-table>
          </div>
        </div>        
      </div>
    </div>
  `
})
export class FundComponent implements OnInit {
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  // Filter state
  filters: any = {
    amcId: '',
    fundTypeId: '',
    riskLevel: '',
    isActive: ''
  };
  
  // Master data
  amcList: any[] = [];
  fundTypeList: any[] = [];
  
  constructor(
    private router: Router,
    private httpService: HttpService,
    private alertService: AlertService
  ) {}
 
  ngOnInit() {
    this.loadMasterData();
  }
  
  loadMasterData() {
    // Load AMC list
    this.httpService.get('/amc/getall').subscribe({
      next: (data: any) => {
        this.amcList = data;
      },
      error: (error) => {
        console.error('Failed to load AMC list', error);
      }
    });
    
    // Load Fund Type list
    this.httpService.get('/fundtype/getall').subscribe({
      next: (data: any) => {
        this.fundTypeList = data;
      },
      error: (error) => {
        console.error('Failed to load Fund Type list', error);
      }
    });
  }
  
  onFilterChange() {
    this.table.refresh();
  }
  
  onClearFilter() {
    this.filters = {
      amcId: '',
      fundTypeId: '',
      riskLevel: '',
      isActive: ''
    };
    this.table.refresh();
  }
 
  public datasource = (params: any): Observable<any> => {    
    // Merge filters with pagination params
    const requestParams = {
      ...params,
      ...this.filters
    };
    return this.httpService.post(`/fund/list`, requestParams);
  };

  onDelete(obj: any) {
    if (confirm(`Are you sure you want to delete fund "${obj.fundNameShortTh}"?`)) {
      this.httpService.delete(`/fund/delete/${obj.id}`)
        .subscribe({
          next: (response) => {
            this.table.refresh();
            this.alertService.success("Fund deleted successfully.", 'Success');          
          },
          error: (error) => {
            this.alertService.error(error?.error?.message || 'Failed to delete fund', 'Error!');
          }
        });
    }
  }

  onEdit(item: any) {
    this.router.navigate(['/master/fund/editing', item.id]);
  }
  
  onView(item: any) {
    this.router.navigate(['/master/fund/view', item.id]);
  }

  onCreate() {
    this.router.navigate(['/master/fund/create']);
  }

  onExport() {
    this.httpService.export("/fund/export")
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `funds_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    /*{ 
      title: 'Fund Code (SA)', 
      name: 'fundCodeSa', 
      sort: true, 
      width: '10%' 
    },
    */
    { 
      title: 'Fund Code', 
      name: 'fundCodeAmc', 
      sort: true, 
      width: '10%' 
    },
    { 
      title: 'Fund Name', 
      name: 'fundNameShortTh', 
      sort: true 
    },
    { 
      title: 'AMC', 
      name: 'amcShortName', 
      sort: true, 
      width: '12%' 
    },
    { 
      title: 'Fund Type', 
      name: 'fundTypeNameTh', 
      sort: true, 
      width: '12%' 
    },
    { 
      title: 'Risk', 
      name: 'riskLevel', 
      template: 'riskLevel', 
      align: 'center', 
      width: '8%', 
      sort: true 
    },
    { 
      title: 'Open Ended', 
      name: 'isOpenEnded', 
      template: 'openEnded', 
      align: 'center', 
      width: '8%', 
      sort: true 
    },
    { 
      title: 'Status', 
      align: 'center', 
      name: 'isActive', 
      template: 'status', 
      width: '8%', 
      sort: false 
    },
    { 
      template: 'action', 
      width: '12%', 
      sort: false 
    },
  ];
}