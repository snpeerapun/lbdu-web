import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";

interface UserData {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number | null;
  divisionId: number | null;
  departmentId: number | null;
}

@Component({
  selector: 'app-budget-request-form',
  template: `
    <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
            
    <div class="container-fluid">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Budget</h5>
        
            <div class="row mt-3">
               
                <div class="col-sm-6">
                <label class="form-label text-muted small mb-1">Division</label>
                <ng-select
                  [(ngModel)]="obj.divisionId"
                  formControlName="divisionId"
                  [showFilter]="true"
                  [options]="data.divisions"
                  [required]="true"
                  [class.is-invalid]="isFieldInvalid('divisionId')"
                  (onSelectionChange)="onDivisionChange($event)"
                  [placeholder]="'Select Division'">
                </ng-select>
                <div *ngIf="isFieldInvalid('divisionId')" class="text-danger">
                  Division is required
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-sm-6">
              <label class="form-label text-muted small mb-1">Department</label>
                <ng-select
                  [(ngModel)]="obj.departmentId"
                  formControlName="departmentId"
                  [options]="departments"
                  [required]="true"
                  [class.is-invalid]="isFieldInvalid('departmentId')"
                  [placeholder]="'Select Department'">
                </ng-select>
                <div *ngIf="isFieldInvalid('departmentId')" class="text-danger">
                  Department is required
                </div>
              </div>  
            </div>
            <div class="row mt-3">
              <div class="col-sm-6">
              <label class="form-label text-muted small mb-1">Template</label>
                <ng-select
                  [(ngModel)]="obj.templateId"
                  formControlName="templateId"
                  [options]="data.budgetTemplates"
                  [placeholder]="'Select Template'">
                </ng-select>
              </div>  
            </div>
            <div class="row mt-3">
              <div class="col-sm-6">
              <label class="form-label text-muted small mb-1">Remark</label>
                <textarea class="form-control" formControlName="remark" ></textarea>
              </div>  
            </div>
        </div>
        <div class="card-footer">
          <div  class="d-flex justify-content-end ">
              <button type="submit" class="btn btn-primary">
                 Submit
              </button>
              <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
                Back
              </button>
          </div>
        </div>
      </div>
    </div>
    </form>
  `
})
export class BudgetRequestFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  types: any[] = [];
  obj: any = {};
  departments: any[] = [];
  data: any = {
    divisions: [],
    departments: [],
    budgetTemplates: []
  };

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadData();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }
  }

  onDivisionChange(divisionId: any) {
    
    if(divisionId) this.departments = this.data.departments.filter((d: any) => d.divisionId == divisionId);
    else this.departments = [];
 
  }
  private initForm() {
    this.myForm = this.fb.group({
       divisionId: [null, [Validators.required]],
       departmentId: [null, [Validators.required]],
       templateId: [null, []],
       remark: [null, []],
    });
  }

  loadData() {
    this.httpService.get('/budgetrequest/getdata').subscribe({
      next: (response: any) => {
        this.data = response;
      
      },
      error: (error) => {
        //this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
  
  getRow(userId: number) {
    this.httpService.get("/budgetrequest/get/"+userId).subscribe({
      next: (response: any) => {
        this.obj = response;
        this.onDivisionChange(this.obj.divisionId);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit() {
     if(this.myForm.valid) {
      this.httpService.post("/budgetrequest/post", this.obj).subscribe({
        next: (response: any) => {
          this.alertService.success(
            `User successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.router.navigate(['/budget/requests/detail', response.id]);
        },
        error: (error) => {
          this.alertService.error('Failed to save user');
          console.error('Error saving user:', error);
        }
      });
     } else {
      this.myForm.markAllAsTouched(); 
     }
  }

  onCancel() {
    this.router.navigate(['/budget/requests/list']);
  }
}
