// fund-form.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-budget-finance-form',
  template: `  <!-- fund-form.component.html -->
  <div class="container-fluid">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Fund</h5>
      </div>
      <div class="card-body">
        <form #form="ngForm" (ngSubmit)="onSubmit(form)">
          <div class="row">
            <div class="col-md-6">
              <!-- Code -->
              <div class="mb-3">
                <label class="form-label">Code</label>
                <input type="text" name="fundCode" class="form-control"
                  [(ngModel)]="obj.fundCode"
                  #fundCode="ngModel" required
                  [class.is-invalid]="fundCode.invalid && fundCode.touched" />
                <div class="invalid-feedback" *ngIf="fundCode.invalid && fundCode.touched">
                  Please enter a code
                </div>
              </div>
  
              <!-- Name -->
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" name="fundName" class="form-control"
                  [(ngModel)]="obj.fundName"
                  #fundName="ngModel" required
                  [class.is-invalid]="fundName.invalid && fundName.touched" />
                <div class="invalid-feedback" *ngIf="fundName.invalid && fundName.touched">
                  Please enter a name
                </div>
              </div>
  
              <!-- Fund Type -->
              <div class="mb-3">
                <label class="form-label">Fund Type</label>
                <ng-select
                  name="fundTypeId"
                  [(ngModel)]="obj.fundTypeId"
                  [options]="data.fundTypes"
                  [placeholder]="'Select Fund Type'"
                  #fundTypeId="ngModel"
                  required>
                </ng-select>
                <div class="invalid-feedback d-block" *ngIf="fundTypeId.invalid && fundTypeId.touched">
                  Please select a fund type
                </div>
              </div>
  
              <!-- Fee Type -->
              <div class="mb-3">
                <label class="form-label">Fee Type</label>
                <ng-select
                  name="feeTypeId"
                  [(ngModel)]="obj.feeTypeId"
                  [options]="data.feeTypes"
                  [placeholder]="'Select Fee Type'"
                  #feeTypeId="ngModel"
                  required>
                </ng-select>
                <div class="invalid-feedback d-block" *ngIf="feeTypeId.invalid && feeTypeId.touched">
                  Please select a fee type
                </div>
              </div>
  
              <!-- Is Dummy -->
              <div class="form-group mb-3">
                <label class="form-label">Is Dummy</label>
                <div>
                  <label class="switch">
                    <input type="checkbox" name="isDummy"
                      [(ngModel)]="obj.isDummy" [checked]="obj.isDummy == 1" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Submit/Cancel -->
          <div class="row mt-4">
            <div class="col-12">
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
export class BudgetFinanceFormComponent implements OnInit {
  isEditMode = false;
  data: any = {
    fundTypes: [],
    feeTypes: []
  };

  obj: any = {
    fundCode: '',
    fundName: '',
    isDummy: 0,
    fundTypeId: null,
    feeType: null
  };

  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    //  this.loadData();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }
  }
 

  getRow(id: number) {
    this.httpService.get("/finance/get/" + id).subscribe({
      next: (response: any) => {
        this.obj = response;
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  onSubmit(form: any) {
    this.obj.isDummy = this.obj.isDummy ? 1 : 0;
    if (form.valid) {
      this.httpService.post("/finance/post", this.obj).subscribe({
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
    this.router.navigate(['/budget/finance/list']);
  }
}
