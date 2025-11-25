import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bank-form',
  template: `
  <div class="container-fluid">
    <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Bank</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <!-- Bank Code -->
              <div class="mb-3">
                <label class="form-label">Bank Code <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  name="bankCode"
                  [(ngModel)]="bank.bankCode"
                  #bankCode="ngModel"
                  required
                  maxlength="10"
                  [class.is-invalid]="bankCode.invalid && (bankCode.dirty || bankCode.touched)"
                  placeholder="Enter bank code (e.g., BBL, SCB)">
                <div class="invalid-feedback" *ngIf="bankCode.invalid && (bankCode.dirty || bankCode.touched)">
                  <span *ngIf="bankCode.errors?.['required']">Bank Code is required</span>
                </div>
              </div>

              <!-- Name Thai -->
              <div class="mb-3">
                <label class="form-label">Bank Name (Thai) <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  name="nameTh"
                  [(ngModel)]="bank.nameTh"
                  #nameTh="ngModel"
                  required
                  maxlength="255"
                  [class.is-invalid]="nameTh.invalid && (nameTh.dirty || nameTh.touched)"
                  placeholder="ชื่อธนาคาร (ภาษาไทย)">
                <div class="invalid-feedback" *ngIf="nameTh.invalid && (nameTh.dirty || nameTh.touched)">
                  Bank Name (Thai) is required
                </div>
              </div>

              <!-- Short Name English -->
              <div class="mb-3">
                <label class="form-label">Short Name (English)</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="shortNameEn"
                  [(ngModel)]="bank.shortNameEn"
                  maxlength="100"
                  placeholder="Short name (e.g., Bangkok Bank)">
              </div>
            </div>

            <div class="col-md-6">
              <!-- Full Name English -->
              <div class="mb-3">
                <label class="form-label">Full Name (English)</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="fullNameEn"
                  [(ngModel)]="bank.fullNameEn"
                  maxlength="255"
                  placeholder="Full name (e.g., Bangkok Bank Public Company Limited)">
              </div>

              <!-- Is Active -->
              <div class="form-group mb-3">
                <label class="form-label">Status</label>
                <div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      [(ngModel)]="bank.isActive" />
                    <span class="slider round"></span>
                  </label>
                  <span class="ms-2">
                    {{ bank.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <!-- Info Box -->
              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> Bank code should match with standard Thai bank codes (e.g., BBL, KBANK, SCB, KTB, TMB)
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
export class BankFormComponent implements OnInit {
  bank: any = {
    id: 0,
    bankCode: '',
    nameTh: '',
    shortNameEn: '',
    fullNameEn: '',
    isActive: true
  };

  isEditMode = false;
  isSubmitting = false;

  constructor(
    private httpService: HttpService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const bankId = this.route.snapshot.params['id'];
    if (bankId) {
      this.isEditMode = true;
      this.getRow(bankId);
    }
  }

  getRow(bankId: number) {
    this.httpService.get(`/bank/get/${bankId}`).subscribe({
      next: (response: any) => {
        this.bank = response;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to load bank data', 'Error!');
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
    
    this.httpService.post("/bank/post", this.bank).subscribe({
      next: (response) => {
        this.toast.success(
          `Bank successfully ${this.isEditMode ? 'updated' : 'created'}`,
          'Success'
        );
        this.onCancel();
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Failed to save bank';
        this.toast.error(errorMessage, 'Error');
        console.error('Error saving bank:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/master/bank']);
  }
}