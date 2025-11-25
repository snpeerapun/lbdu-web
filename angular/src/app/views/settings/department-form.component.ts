import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
 
@Component({
  selector: 'app-department-form',
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
                  <label class="form-label">Code</label>
                  <input type="text" class="form-control" 
                    [(ngModel)]="obj.code"
                    formControlName="code"
                    [class.is-invalid]="isFieldInvalid('code')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('code')">
                    Please enter a code
                  </div>
                </div>
                <div class="mb-3">
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
export class DepartmentFormComponent implements OnInit {
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
   
    const deparmentId = this.route.snapshot.params['id'];
    if (deparmentId) {
      this.isEditMode = true;
      this.getRow(deparmentId);
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

  getRow(deparmentId: number) {
    this.httpService.get("/department/get/"+deparmentId).subscribe({
      next: (response: any) => {
        this.obj = response;
         
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      this.httpService.post("/department/post", this.obj).subscribe({
        next: (response) => {
          this.alertService.success(
            `Deparment successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error('Failed to save deparment');
          console.error('Error saving deparment:', error);
        }
      });
    } else {
      this.myForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/settings/department']);
  }
}
