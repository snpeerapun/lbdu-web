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
import { NgFor } from '@angular/common';
 
@Component({
    selector: 'app-fundsize-component',
     template: `
     <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">ประมาณการขนาดกองทุน</h5>
            <button class="btn btn-primary btn-sm" (click)="onCreate()">
              <i class="fas fa-plus me-2"></i> Add New
            </button>
          </div>
          <div class="card-body" >
            <ng-table 
            #table
            [columns]="columns" 
            [datasource]="datasource" 
            [allowCheckbox]="false"
            [allowFilter]="false"
            [defaultSortColumn]="'id'"              
           
            >
              <ng-template #status let-item="row">               
                <div class="badge" [ngStyle]="{'background-color': item.statusColor}">{{item.statusName}}</div>
              </ng-template> 
              <ng-template #action   let-item="row">
                <button class="btn btn-info btn-sm mr-1" (click)="onEdit(item)"><i class="fa fa-edit"></i></button>
                <button class="btn btn-danger btn-sm"(click)="onDelete(item)"><i class="fa fa-trash"></i></button>
              </ng-template>    
             
    
            </ng-table>
          </div>
        
        </div>        
    </div>
    </div>
      `
})

export class BudgetFundSizeComponent  implements OnInit{

 
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
    //this.service.get('fundsize/list').subscribe(data => {
    //  console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
    ///});
    //console.log(this.router.snapshot.data['title']);
    //this.permission =  getPermission(this.router.url);
   
 
  }
 
  
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/forecastfundsize/list`,params);
  };

 
 
  onDelete(obj: any) {
     this.alertService.confirm( {title: "Confirm",message: "Are you sure delete this record?"})
     .then((result) => {
       if (result.value) {
         this.httpService.get("/forecastfundsize/delete/" + obj.id)
           .subscribe({
             next: () => {
               this.table.refresh();
               this.alertService.success("Delete completed.", 'Success.');
             },
             error: (error) => {
               this.alertService.error(error.message, 'Error!');
             }
           });
       }
     });
  }
  onEdit(e:any) {
    this.router.navigate(['/budget/fundsize/view/'+e.id]);
  }
  onCreate() {
    this.router.navigate(['/budget/fundsize/create']);
  }

 
  public columns: Array<NgTableColumn> = [ 
    { title :"Document No", name: 'docNo', sort: true },
    { title :"Document Date", name: 'docDate', sort: true ,format:NgTableFormat.DateTime},
    { title: 'FiscalYear', name: 'fiscalYear', sort: true },
    { title: 'valueDate', name: 'valueDate', sort: true ,format:NgTableFormat.DateTime},
    { title: 'Created By', name: 'createdBy', sort: true },
    { title: 'Created Date', name: 'createdAt', sort: true ,format:NgTableFormat.DateTime},
 
    { title: 'Status',align:'center', name: 'statusName',template: 'status',width: '10%',sort: false,},
    { template: 'action',width: '10%',sort: false },
  ];
}
