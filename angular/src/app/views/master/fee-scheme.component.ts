import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-fee-scheme',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Fee Schemes List</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New Scheme
            </button>
          </div>
          <div class="card-body">
            <ng-table 
              #table
              [columns]="columns" 
              [datasource]="datasource"
              [allowCheckbox]="false"
              [defaultSortColumn]="'id'">
              
              <!-- Action Buttons -->
              <ng-template #action let-item="row">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-info" (click)="onEdit(item)" title="Edit">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn btn-success" (click)="viewRates(item)" title="View Rates">
                    <i class="fa fa-list"></i>
                  </button>
                  <button class="btn btn-warning" (click)="duplicate(item)" title="Duplicate">
                    <i class="fa fa-copy"></i>
                  </button>
                  <button class="btn btn-danger" (click)="onDelete(item)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </ng-template>

              <!-- Status Badge -->
              <ng-template #status let-item="row">
                <i class="fa fa-check text-primary" style="font-size:16px" *ngIf="item.isActive"></i>
                <i class="fa fa-times text-danger" style="font-size:16px" *ngIf="!item.isActive"></i>
              </ng-template>

              <!-- Fee Type Badge -->
              <ng-template #feeType let-item="row">
                <span class="badge" [ngClass]="{
                  'bg-primary': item.feeType === 'COMMISSION',
                  'bg-success': item.feeType === 'FRONT_END',
                  'bg-warning text-dark': item.feeType === 'BACK_END',
                  'bg-info': item.feeType === 'ONGOING',
                  'bg-secondary': item.feeType === 'SWITCH_IN' || item.feeType === 'SWITCH_OUT'
                }">
                  {{ getFeeTypeName(item.feeType) }}
                </span>
              </ng-template>

              <!-- Rate Method -->
              <ng-template #rateMethod let-item="row">
                <span class="badge bg-light text-dark">
                  {{ getRateMethodName(item.rateMethod) }}
                </span>
              </ng-template>

              <!-- Calculation Basis -->
              <ng-template #calcBasis let-item="row">
                {{ getCalculationBasisName(item.calculationBasis) }}
              </ng-template>

              <!-- Effective Date -->
              <ng-template #effectiveDate let-item="row">
                {{ item.effectiveFrom | date:'dd/MM/yyyy' }}
                <span *ngIf="item.effectiveTo"> - {{ item.effectiveTo | date:'dd/MM/yyyy' }}</span>
              </ng-template>

            </ng-table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeeSchemeComponent implements OnInit {
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private alertService: AlertService
  ) {}

  ngOnInit() {}

  public datasource = (params: any): Observable<any> => {
    return this.httpService.post(`/feescheme/list`, params);
  };

  public columns: Array<NgTableColumn> = [
    { title: 'Scheme Code', name: 'schemeCode', sort: true, width: '12%' },
    { title: 'Scheme Name', name: 'schemeName', sort: true, width: '18%' },
    { title: 'Fee Type', template: 'feeType', sort: true, width: '12%' },
    { title: 'Rate Method', template: 'rateMethod', sort: false, width: '10%' },
    { title: 'Calculation', template: 'calcBasis', sort: false, width: '12%' },
    { title: 'Effective Date', template: 'effectiveDate', sort: false, width: '15%' },
    { title: 'Active', template: 'status', sort: true, width: '8%' },
    { template: 'action', width: '13%', sort: false }
  ];

  onCreate() {
    this.router.navigate(['/master/fee-scheme/create']);
  }

  onEdit(item: any) {
    this.router.navigate(['/master/fee-scheme/editing', item.id]);
  }

  viewRates(item: any) {
    this.router.navigate(['/master/fee-scheme/rates', item.id]);
  }

  duplicate(item: any) {
    if (confirm(`Duplicate scheme "${item.schemeName}"?`)) {
      this.httpService.post(`/feescheme/duplicate/${item.id}`, {}).subscribe({
        next: () => {
          this.table.refresh();
          this.alertService.success('Fee Scheme duplicated successfully.', 'Success!');
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Failed to duplicate', 'Error!');
        }
      });
    }
  }

  onDelete(item: any) {
    if (confirm(`Are you sure you want to delete scheme "${item.schemeName}"?`)) {
      this.httpService.get(`/feescheme/delete/${item.id}`).subscribe({
        next: () => {
          this.table.refresh();
          this.alertService.success('Fee Scheme deleted successfully.', 'Success!');
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Failed to delete', 'Error!');
        }
      });
    }
  }

  getFeeTypeName(type: string): string {
    const types: any = {
      'COMMISSION': 'Commission',
      'FRONT_END': 'Front End',
      'BACK_END': 'Back End',
      'ONGOING': 'Ongoing Fee',
      'SWITCH_IN': 'Switch In',
      'SWITCH_OUT': 'Switch Out'
    };
    return types[type] || type;
  }

  getRateMethodName(method: string): string {
    const methods: any = {
      'FIXED': 'Fixed',
      'STEP': 'Step',
      'RANGE': 'Range'
    };
    return methods[method] || method;
  }

  getCalculationBasisName(basis: string): string {
    const bases: any = {
      'ON_VOLUME': 'On Volume',
      'ON_FEE': 'On Fee',
      'ON_OUTSTANDING': 'On Outstanding'
    };
    return bases[basis] || basis;
  }
}