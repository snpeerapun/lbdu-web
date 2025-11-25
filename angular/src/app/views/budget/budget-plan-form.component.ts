import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
 
@Component({
  selector: 'app-plan-form',
  template: `
   <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
    <div class="container-fluid">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">Budget Plan</h5>
        </div>
        <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Name <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    placeholder="eg. แผนงบประมาณ 2568 หรือ แผนงบประมาณ 2568 (1)"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('planName')"
                    formControlName="planName" />
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('planName')">
                    Please enter a name
                  </div>
               
                  <div class="row mt-3">
                    <div class="col-sm-6">
                      <label class="form-label">Fiscal Year <span class="text-danger">*</span></label>
                      <ng-select  formControlName="fiscalYear" [options]="data.fiscalYears" [valueProp]="'id'" [labelProp]="'year'" >
                      
                      </ng-select>
                      <div *ngIf="isFieldInvalid('fiscalYear')" class="text-danger">
                        Please select a fiscal year
                      </div>
                    </div>
                  </div>  
                  <div class="row mt-3">
                    <div class="col-sm-6">
                      <label class="form-label">Upload Balance Sheet <span class="text-danger">*</span></label>
                      <input type="file" class="form-control" formControlName="balanceSheet" />
                    </div>
                    <div *ngIf="isFieldInvalid('balanceSheet')" class="text-danger">
                      Please select a balance sheet
                    </div>
                  </div>  

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
    </div>
    </form>
  `
})
export class BudgetPlanFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  divisions: any[] = [];
  data: any = {
    categories: [],
    fiscalYears: []
  };


  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.getRow();
    this.getData();
  }

  getData() {
    this.httpService.get("/budgetplan/getdata").subscribe({
      next: (response: any) => {
        this.data = response;
      },
      error: (error) => {
        this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }

  initForm() {
    this.myForm = this.fb.group({
      planName: ['', Validators.required],
      fiscalYear: ['', Validators.required],
      balanceSheet: ['', Validators.required],
    });
  }

  getRow() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.httpService.get("/budgetplan/get/" + id).subscribe({
        next: (response: any) => {
          this.myForm.patchValue({
            code: response.code,
            name: response.name,
            parentId: response.parentId
          });
        },
        error: (error) => {
          this.alertService.error('Failed to load data');
          console.error('Error loading data:', error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.myForm.valid) {
      const obj = this.myForm.getRawValue(); // getRawValue จะรวม field ที่ disabled ด้วย (เช่น code)

 
      this.httpService.post("/budgetplan/post", obj).subscribe({
        next: (response: any) => {
          this.alertService.success('Save successfully');
          this.router.navigate(['/budget/plan/detail/' + response.id]);
        },
        error: (error) => {
          this.alertService.error('Failed to save department');
          console.error('Error saving department:', error);
        }
      });
    } else {
      this.myForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/budget/plan/list']);
  }
}
