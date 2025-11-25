import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bank-branch-form',
  template: `
  <div class="container-fluid">
    <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Bank Branch</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <!-- Bank Selection -->
              <div class="mb-3">
                <label class="form-label">Bank <span class="text-danger">*</span></label>
                <ng-select
                  [options]="bankList"
                  valueProp="id"
                  labelProp="name"
                  name="bankId"
                  [(ngModel)]="branch.bankId"
                  #bankId="ngModel"
                  required
                  [class.is-invalid]="bankId.invalid && (bankId.dirty || bankId.touched)"
                  placeholder="Select Bank">
                </ng-select>
                <div class="invalid-feedback" *ngIf="bankId.invalid && (bankId.dirty || bankId.touched)">
                  Please select a bank
                </div>
              </div>

              <!-- Branch Code -->
              <div class="mb-3">
                <label class="form-label">Branch Code <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  name="branchCode"
                  [(ngModel)]="branch.branchCode"
                  #branchCode="ngModel"
                  required
                  maxlength="20"
                  [class.is-invalid]="branchCode.invalid && (branchCode.dirty || branchCode.touched)"
                  placeholder="Enter branch code">
                <div class="invalid-feedback" *ngIf="branchCode.invalid && (branchCode.dirty || branchCode.touched)">
                  <span *ngIf="branchCode.errors?.['required']">Branch Code is required</span>
                </div>
              </div>

              <!-- Name Thai -->
              <div class="mb-3">
                <label class="form-label">Branch Name (Thai) <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  name="nameTh"
                  [(ngModel)]="branch.nameTh"
                  #nameTh="ngModel"
                  required
                  maxlength="255"
                  [class.is-invalid]="nameTh.invalid && (nameTh.dirty || nameTh.touched)"
                  placeholder="ชื่อสาขา (ภาษาไทย)">
                <div class="invalid-feedback" *ngIf="nameTh.invalid && (nameTh.dirty || nameTh.touched)">
                  Branch Name (Thai) is required
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <!-- Name English -->
              <div class="mb-3">
                <label class="form-label">Branch Name (English)</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="nameEn"
                  [(ngModel)]="branch.nameEn"
                  maxlength="255"
                  placeholder="Branch name (English)">
              </div>

              <!-- Is Active -->
              <div class="form-group mb-3">
                <label class="form-label">Status</label>
                <div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      [(ngModel)]="branch.isActive" />
                    <span class="slider round"></span>
                  </label>
                  <span class="ms-2">
                    {{ branch.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <!-- Info Box -->
              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> Branch code should be unique within the selected bank
              </div>
            </div>
          </div>
        </div>
      
        <div class="card-footer">
          <div class="d-flex justify-content-end">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="myForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i class="fas fa-save me-1" *ngIf="!isSubmitting"></i>
              {{ isSubmitting ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
              <i class="fas fa-times me-1"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
  `
})
export class BankBranchFormComponent implements OnInit {
  branch: any = {
    id: 0,
    bankId: null,
    branchCode: '',
    nameTh: '',
    nameEn: '',
    isActive: true
  };

  bankList: any[] = [];
  isEditMode = false;
  isSubmitting = false;
  returnBankId: number | null = null;

  constructor(
    private httpService: HttpService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBanks();

    // Check if bankId is passed in query params (from Create button on bank detail page)
    this.route.queryParams.subscribe(params => {
      if (params['bankId']) {
        this.branch.bankId = +params['bankId'];
        this.returnBankId = +params['bankId'];
      }
    });

    // Check if editing
    const branchId = this.route.snapshot.params['id'];
    if (branchId) {
      this.isEditMode = true;
      this.getRow(branchId);
    }
  }

  loadBanks() {
    this.httpService.get('/bank/getall').subscribe({
      next: (response: any) => {
        this.bankList = response.map((bank: any) => ({
          id: bank.id,
          name: `${bank.nameTh} (${bank.bankCode})`
        }));
      },
      error: (error) => {
        console.error('Error loading banks:', error);
        this.toast.error('Failed to load banks', 'Error');
      }
    });
  }

  getRow(branchId: number) {
    this.httpService.get(`/bankbranch/get/${branchId}`).subscribe({
      next: (response: any) => {
        this.branch = response;
        this.returnBankId = response.bankId;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to load branch data', 'Error!');
        this.onCancel();
      }
    });
  }

  onSubmit(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.toast.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    
    this.httpService.post("/bankbranch/post", this.branch).subscribe({
      next: (response) => {
        this.toast.success(
          `Branch successfully ${this.isEditMode ? 'updated' : 'created'}`,
          'Success'
        );
        this.onCancel();
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Failed to save branch';
        this.toast.error(errorMessage, 'Error');
        console.error('Error saving branch:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    if (this.returnBankId) {
      this.router.navigate(['/master/bank-branch', this.returnBankId]);
    } else {
      this.router.navigate(['/master/bank-branch']);
    }
  }
}