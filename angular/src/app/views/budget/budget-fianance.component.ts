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
    selector: 'app-budget-fianance-component',
     template: `
     <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Balance Sheet</h5>
            <label title="Upload image file2" for="inputImage" class="btn btn-primary">
              <input type="file" #fileInput (change)="onFileSelected($event)" name="file" id="inputImage"
                style="display:none">
              <i class="fa fa-upload"></i> Attach File
            </label>
          </div>
          <div class="card-body" >
          <div class="col-md-3 mb-3">

           
            </div>
            <ng-table 
              #table
              [columns]="columns" 
              [datasource]="datasource" 
              [allowFilter]="false"
              [allowCheckbox]="false"
              [defaultSortColumn]="'id'"              
              >
              <ng-template #action   let-item="row">
                <button class="btn btn-success btn-sm mr-1" (click)="onDownload(item)"><i class="fa fa-download"></i></button>
                <!--<button class="btn btn-info btn-sm mr-1" (click)="onEdit(item)"><i class="fa fa-edit"></i></button>-->
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
      `,
})

export class BudgetFinanceComponent  implements OnInit{

 
  permission: any = {};
  data:any;
  @ViewChild(NgTableComponent, { static: true }) table!: NgTableComponent;
  selectedFile: File | null = null;
  constructor(
 
      private router: Router,
      private httpService: HttpService,
      private authService: AuthService,
      private alertService: AlertService
    ) {
        
  }
 
  ngOnInit() {
    // adding the lifecycle hook ngOnInit
    //this.service.get('fund/list').subscribe(data => {
    //  console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
    ///});
    //console.log(this.router.snapshot.data['title']);
    //this.permission =  getPermission(this.router.url);
   
 
  }
  onDownload(obj: any) {
    this.httpService.download("/finance/download/" + obj.id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${obj.fileName}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success("Download completed.", 'Success.');
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  
  public datasource = (params: any): Observable<any> => {    
    return this.httpService.post(`/finance/list`,params);
  };

 
 
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  
    if (!this.selectedFile) {
      //console.log('No file selected');
      this.alertService.error("No file selected.", 'error.');
      return;
    }
    
    var jsonData ={
       'id':1
    }
  
    this.httpService.upload("/finance/upload",this.selectedFile,jsonData)
    .subscribe(response => {
      this.alertService.success("upload completed.", 'Success.');
      this.table.refresh();
    },error => {
        this.alertService.error(error.error.message, 'Error!');
    });
  
  }
  onDelete(obj: any) {
    if (confirm("Are you sure delete this record?")) {
      this.httpService.get("/finance/delete/"+obj.id)
        .subscribe(response => {
          this.table.refresh()
          this.alertService.success("Delete completed.", 'Success.');          
        },error => {
          this.alertService.error(error.message, 'Error!');
        });
    }
  }
  onEdit(e:any) {
    this.router.navigate(['/budget/finance/editing/'+e.id]);
  }
  onCreate() {
    this.router.navigate(['/budget/finance/create']);
  }
 
  public columns: Array<NgTableColumn> = [  
    { title: 'Year', name: 'bsYear', sort: true },
    { title: 'Month', name: 'bsMonth', sort: true },
    { title :'File Name', name: 'fileName', sort: true },
    { template: 'action',width: '10%',sort: false },
  ];
}
