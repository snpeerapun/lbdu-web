import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgTableColumn } from 'src/app/components/forms/ng-table.inferface';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-ic-group',
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">IC Groups List</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New Group
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
                <div class="btn-group" role="group">
                  <button class="btn btn-info btn-sm" (click)="onEdit(item)" title="Edit">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn btn-success btn-sm" (click)="viewMembers(item)" title="View Members">
                    <i class="fa fa-users"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="onDelete(item)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </ng-template>

              <!-- Status Badge -->
              <ng-template #status let-item="row">
                <i class="fa fa-check text-primary" style="font-size:16px" *ngIf="item.isActive"></i>
                <i class="fa fa-times text-danger" style="font-size:16px" *ngIf="!item.isActive"></i>
              </ng-template>

              <!-- Parent Group -->
              <ng-template #parent let-item="row">
                <span *ngIf="item.parentGroup">
                  {{ item.parentGroup.groupName }}
                </span>
                <span *ngIf="!item.parentGroup" class="text-muted">-</span>
              </ng-template>

              <!-- Member Count -->
              <ng-template #memberCount let-item="row">
                <span class="badge bg-info">{{ item.memberCount || 0 }} members</span>
              </ng-template>

            </ng-table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IcGroupComponent implements OnInit {
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private toast: ToastService
  ) {}

  ngOnInit() {}

  public datasource = (params: any): Observable<any> => {
    return this.httpService.post(`/icgroup/list`, params);
  };

  public columns: Array<NgTableColumn> = [
    { title: 'Group Code', name: 'groupCode', sort: true, width: '15%' },
    { title: 'Group Name', name: 'groupName', sort: true, width: '20%' },
    { title: 'Description', name: 'description', sort: false, width: '25%' },
    { title: 'Parent Group', template: 'parent', sort: false, width: '15%' },
    { title: 'Members', template: 'memberCount', sort: false, width: '10%' },
    { title: 'Active', template: 'status', sort: true, width: '8%' },
    { template: 'action', width: '12%', sort: false }
  ];

  onCreate() {
    this.router.navigate(['/master/ic-group/create']);
  }

  onEdit(item: any) {
    this.router.navigate(['/master/ic-group/editing', item.id]);
  }

  viewMembers(item: any) {
    this.router.navigate(['/master/ic-group/members', item.id]);
  }

  onDelete(item: any) {
    if (confirm(`Are you sure you want to delete group "${item.groupName}"?`)) {
      this.httpService.get(`/icgroup/delete/${item.id}`).subscribe({
        next: () => {
          this.table.refresh();
          this.toast.success('IC Group deleted successfully.', 'Success!');
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Failed to delete', 'Error!');
        }
      });
    }
  }
}