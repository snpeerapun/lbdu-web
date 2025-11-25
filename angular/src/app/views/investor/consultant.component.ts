import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { HttpService } from 'src/app/shared/services/http.service';
import { Toast } from 'ngx-toastr';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-consultant',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Investment Consultant List</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New IC
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
                
                  <button class="btn btn-outline-info btn-sm me-1" (click)="onEdit(item)" title="Edit">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-success btn-sm me-1" (click)="viewHierarchy(item)" title="Hierarchy">
                    <i class="fa fa-sitemap"></i>
                  </button>
                  <button class="btn btn-outline-warning btn-sm me-1" (click)="manageFees(item)" title="Manage Fees">
                    <i class="fa fa-dollar-sign"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm me-1" (click)="onDelete(item)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
               
              </ng-template>

              <!-- Status Badge -->
              <ng-template #status let-item="row">
                <span class="badge" [ngClass]="{
                  'bg-success': item.status === 'ACTIVE',
                  'bg-secondary': item.status === 'INACTIVE',
                  'bg-warning text-dark': item.status === 'SUSPENDED'
                }">
                  {{ item.status }}
                </span>
              </ng-template>

              <!-- License Status -->
              <ng-template #license let-item="row">
                <div>
                  <strong>{{ item.licenseNo }}</strong>
                  <br>
                  <small [ngClass]="{
                    'text-success': isLicenseValid(item.licenseExpiryDate),
                    'text-warning': isLicenseExpiringSoon(item.licenseExpiryDate),
                    'text-danger': isLicenseExpired(item.licenseExpiryDate)
                  }">
                    Exp: {{ item.licenseExpiryDate | date:'dd/MM/yyyy' }}
                  </small>
                </div>
              </ng-template>

              <!-- Groups -->
              <ng-template #groups let-item="row">
                <span *ngFor="let group of item.groups" class="badge bg-info me-1">
                  {{ group.groupName }}
                </span>
                <span *ngIf="!item.groups || item.groups.length === 0" class="text-muted">
                  No groups
                </span>
              </ng-template>

              <!-- Tier Level -->
              <ng-template #tier let-item="row">
                <span *ngIf="item.hierarchy" class="badge bg-primary">
                  Tier {{ item.hierarchy.tierLevel }} - {{ item.hierarchy.tierName }}
                </span>
                <span *ngIf="!item.hierarchy" class="text-muted">-</span>
              </ng-template>

            </ng-table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConsultantComponent implements OnInit {
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private toast: ToastService
  ) {}

  ngOnInit() {}

  public datasource = (params: any): Observable<any> => {
    return this.httpService.post(`/investmentconsultant/list`, params);
  };

  public columns: Array<NgTableColumn> = [
    { title: 'Contact Code', name: 'contactCode', sort: true, width: '10%' },
    { title: 'Full Name (TH)', name: 'fullNameTh', sort: true, width: '15%' },
    { title: 'Full Name (EN)', name: 'fullNameEn', sort: true, width: '15%' },
    { title: 'License', template: 'license', sort: false, width: '12%' },
    { title: 'Groups', template: 'groups', sort: false, width: '15%' },
    { title: 'Tier', template: 'tier', sort: false, width: '10%' },
    { title: 'Status', template: 'status', sort: true, width: '8%' },
    { template: 'action', width: '15%', sort: false }
  ];

  onCreate() {
    this.router.navigate(['/investor/consultant/create']);
  }

  onEdit(item: any) {
    this.router.navigate(['/investor/consultant/editing', item.id]);
  }

  viewHierarchy(item: any) {
    this.router.navigate(['/investor/consultant/hierarchy', item.id]);
  }

  manageFees(item: any) {
    this.router.navigate(['/investor/consultant/fees', item.id]);
  }

  onDelete(item: any) {
    if (confirm(`Are you sure you want to delete "${item.fullNameTh}"?`)) {
      this.httpService.get(`/investmentconsultant/delete/${item.id}`).subscribe({
        next: () => {
          this.table.refresh();
          this.toast.success('Investment Consultant deleted successfully.', 'Success!');
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Failed to delete', 'Error!');
        }
      });
    }
  }

  // License status helpers
  isLicenseValid(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const days = this.getDaysUntilExpiry(expiryDate);
    return days > 30;
  }

  isLicenseExpiringSoon(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const days = this.getDaysUntilExpiry(expiryDate);
    return days >= 0 && days <= 30;
  }

  isLicenseExpired(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const days = this.getDaysUntilExpiry(expiryDate);
    return days < 0;
  }

  private getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}