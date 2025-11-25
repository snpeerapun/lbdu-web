import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, tap } from 'rxjs';

 

@Component({
  selector: 'app-users-form',
  template: ` 
  <div class="container-fluid">
    <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} User</h5>
        </div>
        <div class="card-body">
          <div class="row">
              <div class="col-md-6">
                <!-- Username -->
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" 
                    formControlName="userName"
                    [class.is-invalid]="isFieldInvalid('userName')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('userName')">
                    Please enter a username
                  </div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control"
                    formControlName="email"
                    [class.is-invalid]="isFieldInvalid('email')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                    Please enter a valid email
                  </div>
                </div>

                <!-- First Name -->
                <div class="mb-3">
                  <label class="form-label">First Name</label>
                  <input type="text" class="form-control"
                    formControlName="firstName"
                    [class.is-invalid]="isFieldInvalid('firstName')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('firstName')">
                    Please enter first name
                  </div>
                </div>

                <!-- Last Name -->
                <div class="mb-3">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-control"
                      
                    formControlName="lastName"
                    [class.is-invalid]="isFieldInvalid('lastName')">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('lastName')">
                    Please enter last name
                  </div>
                </div>
                <!-- License code -->
                <div class="mb-3">
                  <label class="form-label">License Code</label>
                  <input type="text" class="form-control"
                    formControlName="licenseCode"
                >
                  
                </div>
                <!-- Role -->
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <ng-select
                
                    formControlName="roleId"
                    valueProp="id"
                    labelProp="roleName"
                    [options]="roles"
                    [placeholder]="'Select Role'"
                    [class.is-invalid]="isFieldInvalid('roleId')">
                  </ng-select>
                  <div class="invalid-feedback d-block" *ngIf="isFieldInvalid('roleId')">
                    Please select a role
                  </div>
                </div>

                <!-- Division -->
                <div class="mb-3">
                  <label class="form-label">Division</label>
                  <ng-select
                  
                    formControlName="divisionId"
                    valueProp="id"
                    labelProp="divisionName"
                    [options]="divisions"
                    [placeholder]="'Select Division'"
                    [class.is-invalid]="isFieldInvalid('divisionId')"
                    (ngModelChange)="onDivisionChange($event)">
                  </ng-select>
                  <div class="invalid-feedback d-block" *ngIf="isFieldInvalid('divisionId')">
                    Please select a division
                  </div>
                </div>

                <!-- Department -->
                <div class="mb-3">
                  <label class="form-label">Department</label>
                  <ng-select
                  
                    formControlName="departmentId"
                    valueProp="id"
                    labelProp="departmentName"
                    [options]="departmentOptions"
                    [placeholder]="'Select Department'"
                    [class.is-invalid]="isFieldInvalid('departmentId')">
                  </ng-select>
                  <div class="invalid-feedback d-block" *ngIf="isFieldInvalid('departmentId')">
                    Please select a department
                  </div>
                </div>

                <!-- Is Dummy -->
                <div class="form-group mb-3">
                  <label class="form-label">Active</label>
                  <div>
                    <label class="switch">
                      <input type="checkbox" name="isActive"   formControlName="isActive"  />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
              
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
export class UsersFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  divisions: any[] = [];
  departments: any[] = [];
  departmentOptions: any[] = [];
  roles: any[] = [];
  availableItems: any[] = [];
  funds: any[] = [];
  selectedItems: any[] = [];
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
    this.loadData().subscribe({
      next: () => {
        if (userId) {
          this.isEditMode = true;
          this.getRow(userId);
        }
      },
      error: () => this.alertService.error('Failed to load data')
    });
  }

  private initForm() {
    this.myForm = this.fb.group({
      id: [0],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      licenseCode: [''],
      isActive: [true], // ให้ default เป็น true
      roleId: [null, [Validators.required]],
      divisionId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      selectedItems: [[], []]
    });
  }

  loadData(): Observable<any> {
    return this.httpService.get('/users/getdata').pipe(
      tap((response: any) => {
        this.divisions = response.divisions ?? [];
        this.departments = response.departments ?? [];
        this.roles = response.roles ?? [];
        this.departmentOptions = this.departments;
        this.funds = response.funds ?? [];
      })
    );
  }

  onDivisionChange(divisionId: number | null) {
    if (divisionId === null) {
      this.departmentOptions = [];
      this.myForm.patchValue({ departmentId: null });
      return;
    }
    
    this.filterDepartments(divisionId);
    // Clear department selection when division changes
    this.myForm.patchValue({ departmentId: null });
  }

  private filterDepartments(divisionId: number) {
    const filteredDepts = this.departments.filter(
      dept => dept.divisionId === divisionId
    );
    this.departmentOptions = filteredDepts;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getRow(userId: number) {
    this.httpService.get("/users/get/" + userId).subscribe({
      next: (response: any) => {
        // Convert isActive from 1/0 to boolean
        const userData = {
          ...response,
          isActive: response.isActive === 1
        };
        this.myForm.patchValue(userData);

        // Update form with fetched data
        console.log( this.funds)
        this.selectedItems = this.funds.filter((item: any) => item.userId == userId) 
        console.log(this.selectedItems);  
        const selectedIds  =  this.selectedItems 
        ?  this.selectedItems.map((item: any) => item.id)
        : [];
 
        this.availableItems = this.funds.filter((x: any) => x && !selectedIds.includes(x.id));
        //this.selectedItems  = all.filter((x: any) => x &&  ids.includes(x.id));
        //console.log( this.availableItems);
        //console.log('l:1',this.data?.accountCodes.length)
        //console.log('l:2',this.availableItems.length)
        //this.myForm.controls['selectedItems'].setValue(this.selectedItems); // Update FormControl
        //this.myForm.controls['selectedItems'].markAsTouched();
        this.myForm.controls['selectedItems'].updateValueAndValidity();
        this.myForm.controls['selectedItems'].setValue(this.selectedItems); // Update FormControl
        this.myForm.controls['selectedItems'].markAsTouched();
  
        // Update department options based on selected division
        if (userData.divisionId) {
          this.filterDepartments(userData.divisionId);
        }
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      // ใช้ค่าจาก form แทน userData
      const formData = this.myForm.value;
      const selectedItems = this.myForm.get('selectedItems')?.value;
      //console.log(selectedItems);
      // Convert boolean to 1/0 for backend
      const submitData = {
        ...formData,
        isActive: formData.isActive ? 1 : 0
      };
      const funds = selectedItems.map((x: any) => x.id);
      //console.log(this.selectedItems);
      const payload={
        user:submitData,  
        funds: funds
      }
     
      this.httpService.post("/users/post", payload).subscribe({
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
      // Mark all fields as touched to show validation errors
      Object.keys(this.myForm.controls).forEach(key => {
        const control = this.myForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/settings/users']);
  }
}