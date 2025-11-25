import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-category-form',
  template: `
    <div class="container-fluid">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Budget Category</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Code</label>
                  <input type="text" class="form-control" formControlName="code" readonly placeholder="Auto Generate" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" />
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                    Please enter a name
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Parent</label>
                  <ng-select  [options]="data.categories" bindLabel="name" bindValue="id"
                             formControlName="parentId" placeholder="Select Parent">
                  </ng-select>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-12 justify-content-end d-flex">
                <button type="submit" class="btn btn-primary">Submit</button>
                <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BudgetCategoryFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  divisions: any[] = [];
  data: any = {
    categories: []
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
    this.getData();
  }

  initForm() {
    this.myForm = this.fb.group({
      code: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      parentId: [null]
    });
  }

  getData() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.httpService.get("/budgetcategory/get/" + id).subscribe({
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

 
      this.httpService.post("/budgetcategory/post", obj).subscribe({
        next: (response: any) => {
          this.alertService.success('Save successfully');
          this.router.navigate(['/budget/category/edit/' + response.id]);
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
    this.router.navigate(['/budget/category/list']);
  }
}
