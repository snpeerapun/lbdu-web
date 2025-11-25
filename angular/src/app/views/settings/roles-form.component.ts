import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
 
@Component({
  selector: 'app-roles-form',
  template: ` 
  <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
    <div class="container-fluid">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Role</h5>
         
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input type="text" class="form-control" 
                    [(ngModel)]="role.name"
                    formControlName="name"
                    [class.is-invalid]="isFieldInvalid('name')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                    Please enter a name
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" 
                    [(ngModel)]="role.description"
                    formControlName="description"
                    [class.is-invalid]="isFieldInvalid('description')">
                  </textarea>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('description')">
                    Please enter a valid description
                  </div>
                </div>
              </div>
               
            </div>
             
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
  </form>
  `
})
export class RolesFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  roles: any[] = [];
  datetime: any = null;
  role: any = {
    name: '',
    description: '',
    permissions: '',
    isActive: 1,
    
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
   
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      this.isEditMode = true;
      this.getRow(userId);
    }
  }

  private initForm() {
    this.myForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      permissions: ['', [Validators.required]],
      isActive: [1, [Validators.required]],
    });
  }
   

  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getRow(userId: number) {
    this.httpService.get("/users/get/"+userId).subscribe({
      next: (response: any) => {
        this.role = response;
     
        this.myForm.patchValue(this.role);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      const role = this.role;
 
      this.httpService.post("/users/post", role).subscribe({
        next: (response) => {
          this.alertService.success(
            `User successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error('Failed to save user');
          console.error('Error saving user:', error);
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
    this.router.navigate(['/settings/users/list']);
  }
}
