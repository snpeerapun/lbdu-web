import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
 
@Component({
  selector: 'app-division-form',
  template: `
    <div class="container-fluid">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Division</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Code</label>
                  <input type="text" class="form-control" 
                    [(ngModel)]="obj.code"
                    formControlName="code"
                    [class.is-invalid]="isFieldInvalid('code')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('code')">
                    Please enter a code
                  </div>
                </div>
                <div class="form-group mb-3">
                  <label class="form-label">Name</label>
                  <input type="name" class="form-control"
                    [(ngModel)]="obj.name" 
                    formControlName="name"
                    [class.is-invalid]="isFieldInvalid('name')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                    Please enter a valid name
                  </div>
                </div>
              
              </div>
            </div>
              
 
           
          </form>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">
            Submit
          </button>
          <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
            Cancel
          </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DivisionFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  divisions: any[] = [];
  roles: any[] = [];
  selectedItems: any[] = [];
  availableItems: any[] = [];
  obj: any = {
    code: '',
    name: '',
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
    
    const divisionId = this.route.snapshot.params['id'];
    if (divisionId) {
      this.isEditMode = true;
      this.getRow(divisionId);
    }
  }

  private initForm() {
    this.myForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
     
    });
  }
  
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getRow(divisionId: number) {
    this.httpService.get("/division/get/" + divisionId).subscribe({
      next: (response: any) => {
        this.obj = response;
  
 // Re-run validation
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  
  onSubmit() {
    if (this.myForm.valid) {
      const obj = this.obj;
      //var selectedItems = this.myForm.controls['selectedItems'].value;
      
      //console.log(this.selectedItems);return;
      this.httpService.post("/division/post", obj).subscribe({
        next: (response) => {
          this.alertService.success(
            `Division successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error('Failed to save division');
          console.error('Error saving division:', error);
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
    this.router.navigate(['/settings/division/list']);
  }
}
