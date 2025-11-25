// fund-form.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
import { NgcColumnDef } from 'src/app/components/forms/ng-checkbox-list.component';

@Component({
  selector: 'app-saleteam-form',
  template: `  <!-- fund-form.component.html -->
  <div class="container-fluid">  
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Sales Team</h5>
      </div>
      <div class="card-body">
      
          <div class="row">
            <div class="col-md-6">
              <!-- Code -->
              <div class="mb-3">
                <label class="form-label">Code</label>
                <input type="text" name="teamCode" class="form-control"
                  [(ngModel)]="obj.teamCode"
                  #teamCode="ngModel" required
                  [class.is-invalid]="teamCode.invalid && teamCode.touched" />
                <div class="invalid-feedback" *ngIf="teamCode.invalid && teamCode.touched">
                  Please enter a code
                </div>
              </div>
  
              <!-- Name -->
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" name="teamName" class="form-control"
                  [(ngModel)]="obj.teamName"
                  #teamName="ngModel" required
                  [class.is-invalid]="teamName.invalid && teamName.touched" />
                <div class="invalid-feedback" *ngIf="teamName.invalid && teamName.touched">
                  Please enter a name
                </div>
              </div>
               <div class="mb-3">
                <label class="form-label">Description</label>
                 <textarea name="description" class="form-control"
                  [(ngModel)]="obj.description"
                  #description="ngModel" ></textarea>
                
                </div>
                <div class="mb-3">
                <h6>Sales </h6>
                <ng-multi-select
                    [availableItems]="salesAvailableItems"
                    [(ngModel)]="salesSelectedItems" 
                    [selectedValue]="'id'"
                    [selectedLabel]="'fullName'"
                    [availableLabel]="'fullName'"
                    name="sales"
                    >
                  </ng-multi-select>
              </div>
              <div class="mb-3">
                <h6>Fund SubType</h6>
                <ng-multi-select
                    [selectedValue]="'id'"
                    [availableItems]="fundSubTypesAvailableItems"
                    [availableLabel]="'name'"
                    [selectedLabel]="'name'"
                    name="fundSubTypes"
                    [(ngModel)]="fundSubTypesSelectedItems" >
                  </ng-multi-select>
              </div>
              
            </div>
          </div>
        
       
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
   </form>
  </div>
  `
})
export class SaleTeamFormComponent implements OnInit {
  isEditMode = false;
  data: any = {
    fundTypes: [],
    feeTypes: []
  };
  fundSubTypes: any = [];
  fundSubTypesFilters: any = [];
  salesSelectedItems: any = [];
  salesAvailableItems: any = [];
 
  fundSubTypesSelectedItems: any = [];
  fundSubTypesAvailableItems: any = [];
  obj: any = {
    teamCode: '',
    teamName: '',
    description: '',
  };
  selected: number[] = [];
  selectedSales: number[] = [];
  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  cols: NgcColumnDef<any>[] = [
    
    { field: 'fundTypeName', header: 'Fund Type', width: '20%' },
    { field: 'name', header: 'Team',  },
  ];
  salesColumn: NgcColumnDef<any>[] = [
   
    { field: 'fullName', header: 'Name',  },
    { field:'departmentName',header:'Department'}
  ];
  sales: any = [];
  ngOnInit() {
    this.loadData();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }
  }
  onRowSelected(row: any) {
    console.log('row clicked', row);
  }
 
  loadData() {
    this.httpService.get('/salesteams/getdata').subscribe({
      next: (response: any) => {
        this.fundSubTypes = response.fundSubTypes;
        this.sales = response.sales;
        },
      error: (error) => {
        this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }

  getRow(id: number) {
    this.httpService.get("/salesteams/get/" + id).subscribe({
      next: (response: any) => {
        this.obj = response.salesTeam;
        this.selected = response.mappings.map((v: any) => v.fundSubTypeId);
        this.selectedSales = response.sales.map((v: any) => v.userId);

        const SalesIds = response.sales 
        ? response.sales.map((item: any) => item.userId) 
        : [];

        const FundSubTypeIds = response.mappings 
        ? response.mappings.map((item: any) => item.fundSubTypeId) 
        : [];


        // ✅ Filter `selectedItems` based on availableItems
        this.salesSelectedItems = this.sales.filter((item: any) => SalesIds.includes(item.id));

        // ✅ Update `availableItems` by removing selectedItems
        this.salesAvailableItems = this.sales.filter((item: any) => !SalesIds.includes(item.id));

        // ✅ Filter `selectedItems` based on availableItems
        this.fundSubTypesSelectedItems = this.fundSubTypes.filter((item: any) => FundSubTypeIds.includes(item.id));

        // ✅ Update `availableItems` by removing selectedItems
        this.fundSubTypesAvailableItems = this.fundSubTypes.filter((item: any) => !FundSubTypeIds.includes(item.id));  
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit(form: any) {
    
    if (form.valid) {
      var obj = {
        salesTeam:this.obj,
        mappings:this.selected.map((v: any) => v),
        sales:this.selectedSales.map((v: any) => v)
      }
      //console.log(obj);return;
      this.httpService.post("/salesteams/post", obj).subscribe({
        next: (response) => {
          this.alertService.success(
            `Fund successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error('Failed to save fund');
          console.error('Error saving fund:', error);
        }
      });
    } else {
      form.control.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/settings/sales-teams/list']);
  }
}
