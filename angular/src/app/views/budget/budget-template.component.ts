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
    selector: 'app-budget-component',
     template: `
     <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Budget List</h5>
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
            [allowFilter]="false"
            [defaultSortColumn]="'id'"              
            >
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

export class BudgetTemplateComponent  implements OnInit{

 
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
    //this.service.get('budget/list').subscribe(data => {
    //  console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
    ///});
    //console.log(this.router.snapshot.data['title']);
    //this.permission =  getPermission(this.router.url);
   
 
  }
 
  
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/budgettemplate/list`,params);
  };

 
  async onDelete(item: any) {
    var result = await this.alertService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
    });
    if (result) {
      this.httpService.get("/budgettemplate/delete/"+item.id)
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
    this.router.navigate(['/budget/template/edit/'+e.id]);
  }
  onCreate() {
    this.router.navigate(['/budget/template/create']);
  }

 
  public columns: Array<NgTableColumn> = [  
    { title: 'TemplateName', name: 'name', sort: true },
    { template: 'action',width: '10%',sort: false },
  ];
}
