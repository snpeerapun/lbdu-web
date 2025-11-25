import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { NgTableColumn, NgTableFormat } from 'src/app/components/forms/ng-table.inferface';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { NgFor, NgClass } from '@angular/common';

interface StatusFilter {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-plan-component',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Budget Plan List</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New
            </button>
          </div>
          
          <!-- Status Filter Chips -->
          <div class="filter-section">
            <div class="filter-chips-container">
              <button 
                class="filter-chip"
                [class.active]="selectedStatusId === 0"
                (click)="selectStatusFilter(0)">
                All
              </button>
              <button 
                *ngFor="let status of statusFilters" 
                class="filter-chip"
                [class.active]="selectedStatusId === status.id"
                (click)="selectStatusFilter(status.id)">
                {{ status.name }}
              </button>
            </div>
          </div>

          <div class="card-body">
            <ng-table
              #table
              [columns]="columns"
              [datasource]="datasource"
              [allowCheckbox]="false"
              [allowFilter]="false"
              [defaultSortColumn]="'id'">
              
              <ng-template #status let-item="row">
                <div class="badge" [ngStyle]="{'background-color': item.statusColor}">
                  {{ item.statusName }}
                </div>
              </ng-template>
              
              <ng-template #action let-item="row">
                <button class="btn btn-secondary btn-sm mr-1" (click)="onEdit(item)">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" (click)="onDelete(item)">
                  <i class="fa fa-trash"></i>
                </button>
              </ng-template>
            </ng-table>
          </div>
        </div>
      </div>
    </div>
  `,
  
})
export class BudgetPlanComponent implements OnInit {
  permission: any = {};
  data: any;
  statusFilters: StatusFilter[] =[];
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  // Status filter configuration
  
  selectedStatusId: number = 0;
  constructor(
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    //this.loadStatusOptions();
    this.getData()
  }

 

  public datasource = (params: any): Observable<any> => {
    // Add status filter to params if not 'all'
    params.status = this.selectedStatusId;
    return this.httpService.post(`/budgetplan/list`, params);
  };

  // Select status filter (single selection like Flutter chips)
  selectStatusFilter(statusId: number) {
    this.selectedStatusId = statusId;
    this.refreshTable();
  }

  // Refresh table data
  private refreshTable() {
    if (this.table) {
      this.table.refresh();
    }
  }
  getData() {
  
      this.httpService.get("/budgetplan/getdata").subscribe({
        next: (response: any) => {
          this.data = response;
          this.data.statuses.forEach((status: any) => {
            this.statusFilters.push({ id: status.id, name: status.name, selected: false });
          });
        },
        error: (error) => {
          //this.alertService.error('Failed to load data');
          console.error('Error loading data:', error);
        }
      });
   
  }

  onDelete(obj: any) {
    if (confirm("Are you sure delete this record?")) {
      this.httpService.get("/budgetplan/delete/" + obj.id)
        .subscribe(() => {
          this.table.refresh();
          this.alertService.success("Delete completed.", 'Success.');
        },
        error => {
          this.alertService.error(error.message, 'Error!');
        });
    }
  }

  onEdit(e: any) {
    this.router.navigate(['/budget/plan/detail/' + e.id]);
  }

  onCreate() {
    this.router.navigate(['/budget/plan/create']);
  }

  public columns: Array<NgTableColumn> = [
    { title: 'Document No', name: 'docNo', sort: true },
    { title: 'Document Date', name: 'docDate', sort: true },
    { title: 'Fiscal Year', name: 'fiscalYear', sort: true },
    { title: 'Plan Name', name: 'planName', sort: true },
    { title: 'Budget Amount', name: 'totalBudget', sort: true, format: NgTableFormat.Number },
    { title: 'Status', template: 'status', sort: true },
    { template: 'action', width: '10%', sort: false },
  ];
}