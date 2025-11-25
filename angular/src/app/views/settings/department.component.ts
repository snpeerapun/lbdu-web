import { Component, OnInit,ViewChild,ViewContainerRef } from '@angular/core';
 
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { NgTableColumn, NgTableFormat } from 'src/app/components/forms/ng-table.inferface';
import { NgTableComponent } from 'src/app/components/forms/ng-table.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { HttpService } from 'src/app/shared/services/http.service';
 
@Component({
    selector: 'app-department-component',
     template: `
     <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">User List</h5>
            <button class="btn btn-primary" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New
            </button>
          </div>
          <div class="card-body" >
            <ng-table 
            #table
            [columns]="columns" 
            [datasource]="datasource" 
            [allowCheckbox]="false"
            [defaultSortColumn]="'id'"              
            (checkedItemsChange)="onCheckedItemsChange($event)"
            >
              <ng-template #action   let-item="row">
                <button class="btn btn-info btn-sm mr-1" (click)="onEdit(item)"><i class="fa fa-edit"></i></button>
                <button class="btn btn-danger btn-sm"(click)="onDelete(item)"><i class="fa fa-trash"></i></button>
              </ng-template>    
              <ng-template #status let-item="row">               
                <i class="fa fa-check text-primary" style="font-size:16px"  *ngIf="item.isActive==1"></i>
                <i class="fa fa-times text-danger" style="font-size:16px"  *ngIf="item.isActive==0"></i>
              </ng-template> 
    
            </ng-table>
          </div>
        
        </div>        
    </div>
    </div>
      `
})

export class DepartmentComponent  implements OnInit{

 
  permission: any = {};
  data:any;
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  
  constructor(
 
      private router: Router,
      private httpService: HttpService,
      private authService: AuthService,
      private alertService: AlertService
    ) {
        
  }
 
  ngOnInit() {
    // adding the lifecycle hook ngOnInit
    //this.service.get('department/list').subscribe(data => {
    //  console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
    ///});
    //console.log(this.router.snapshot.data['title']);
    //this.permission =  getPermission(this.router.url);
   
 
  }
 
  
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/department/list`,params);
  };

 
 
  onDelete(obj: any) {
    if (confirm("Are you sure delete this record?")) {
      this.httpService.delete("/department/delete")
        .subscribe(response => {
          this.table.refresh()
          this.alertService.success("Delete completed.", 'Success.');          
        },
        error => {
          this.alertService.error(error.message, 'Error!');
        });
    }
  }
  onEdit(e:any) {
    this.router.navigate(['/settings/department/editing/'+e.id]);
  }
  onCreate() {
    this.router.navigate(['/settings/department/create']);
  }

  checkedItemIds: any[] = []; // Array to store checked item ids

  onCheckedItemsChange(checkedItems: any[]): void {
    this.checkedItemIds = checkedItems.map((item) => item.id);
    console.log('Checked item ids:', this.checkedItemIds);
  }

  public columns: Array<NgTableColumn> = [  
    { title: 'Code', name: 'code', sort: true },
    { title: 'Name', name: 'name', sort: true },
    { template: 'action',width: '10%',sort: false },
  ];
}
