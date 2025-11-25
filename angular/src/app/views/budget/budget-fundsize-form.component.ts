import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
 
@Component({
  selector: 'app-fundsize-form',
  template: `
    <div class="container-fluid">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Deparment</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"></label>
                  <ng-datetime-picker
                    [(ngModel)]="obj.valueDate"
                    formControlName="valueDate"
                    [class.is-invalid]="isFieldInvalid('valueDate')"></ng-datetime-picker>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('valueDate')">
                    Please enter a value date
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row mt-4">
              <div class="col-12">
                <button type="submit" class="btn btn-primary">
                  Submit
                </button>
                <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BudgetFundSizeFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  divisions: any[] = [];
  roles: any[] = [];
  selectedItems: any[] = [];
  availableItems: any[] = [];
  obj: any = {
    valueDate: '',
 
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
   // this.loadData();
  
  }

  private initForm() {
    this.myForm = this.fb.group({
      valueDate: ['', [Validators.required]],
     
    });
  }
   
 
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

   
  onSubmit() {
    if (this.myForm.valid) {
      const obj = this.obj;
       
      this.httpService.post("/forecastfundsize/post", obj).subscribe({
        next: (response:any) => {
          this.alertService.success(  `Save successfully` );
          this.router.navigate(['/budget/fundsize/view/'+response.id]);
        },
        error: (error) => {
          this.alertService.error('Failed to save deparment');
          console.error('Error saving deparment:', error);
        }
      });
    } else {
      Object.keys(this.myForm.controls).forEach(key => {
        const control = this.myForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/budget/fundsize/list']);
  }
}
