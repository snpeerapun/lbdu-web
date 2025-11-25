// ========================================
// Template-driven Forms (ไม่มี Model class)
// ========================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-amc-form',
  template: `
  <div class="container-fluid">
    <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Asset Management Company</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <!-- AMC Code -->
              <div class="mb-3">
                <label class="form-label">AMC Code <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  name="amcCode"
                  [(ngModel)]="amc.amcCode"
                  #amcCode="ngModel"
                  required
                  maxlength="10"
                  [class.is-invalid]="amcCode.invalid && (amcCode.dirty || amcCode.touched)"
                  placeholder="Enter AMC code">
                <div class="invalid-feedback" *ngIf="amcCode.invalid && (amcCode.dirty || amcCode.touched)">
                  <span *ngIf="amcCode.errors?.['required']">AMC Code is required</span>
                </div>
              </div>

              <!-- Short Name -->
              <div class="mb-3">
                <label class="form-label">Short Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  name="shortName"
                  [(ngModel)]="amc.shortName"
                  #shortName="ngModel"
                  required
                  maxlength="100"
                  [class.is-invalid]="shortName.invalid && (shortName.dirty || shortName.touched)"
                  placeholder="Enter short name">
                <div class="invalid-feedback" *ngIf="shortName.invalid && (shortName.dirty || shortName.touched)">
                  Short Name is required
                </div>
              </div>

              <!-- Short Name FundCx -->
              <div class="mb-3">
                <label class="form-label">Short Name (FundCx)</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="shortNameFundCx"
                  [(ngModel)]="amc.shortNameFundCx"
                  maxlength="100"
                  placeholder="Enter short name for FundCx">
              </div>

              <!-- Full Name (Thai) -->
              <div class="mb-3">
                <label class="form-label">Full Name (Thai) <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  name="fullNameTh"
                  [(ngModel)]="amc.fullNameTh"
                  #fullNameTh="ngModel"
                  required
                  maxlength="255"
                  [class.is-invalid]="fullNameTh.invalid && (fullNameTh.dirty || fullNameTh.touched)"
                  placeholder="Enter full name in Thai">
                <div class="invalid-feedback" *ngIf="fullNameTh.invalid && (fullNameTh.dirty || fullNameTh.touched)">
                  Full Name (Thai) is required
                </div>
              </div>

              <!-- Full Name (English) -->
              <div class="mb-3">
                <label class="form-label">Full Name (English)</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="fullNameEn"
                  [(ngModel)]="amc.fullNameEn"
                  maxlength="255"
                  placeholder="Enter full name in English">
              </div>
            </div>

            <div class="col-md-6">
              <!-- Email -->
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control"
                  name="email"
                  [(ngModel)]="amc.email"
                  #email="ngModel"
                  email
                  maxlength="200"
                  [class.is-invalid]="email.invalid && (email.dirty || email.touched)"
                  placeholder="Enter email address">
                <div class="invalid-feedback" *ngIf="email.invalid && (email.dirty || email.touched)">
                  Please enter a valid email address
                </div>
              </div>

              <!-- Contact Name -->
              <div class="mb-3">
                <label class="form-label">Contact Person</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="contactName"
                  [(ngModel)]="amc.contactName"
                  maxlength="200"
                  placeholder="Enter contact person name">
              </div>

              <!-- Phone Number -->
              <div class="mb-3">
                <label class="form-label">Phone Number</label>
                <input 
                  type="text" 
                  class="form-control"
                  name="phoneNo"
                  [(ngModel)]="amc.phoneNo"
                  maxlength="50"
                  placeholder="Enter phone number">
              </div>

              <!-- Default Cutoff Time -->
              <div class="mb-3">
                <label class="form-label">Default Cutoff Time</label>
                <input 
                  type="time" 
                  class="form-control"
                  name="defaultCutoffTime"
                  [(ngModel)]="amc.defaultCutoffTime"
                  placeholder="HH:MM">
                <small class="form-text text-muted">Format: HH:MM (24-hour)</small>
              </div>

              <!-- Is Active -->
              <div class="form-group mb-3">
                <label class="form-label">Status</label>
                <div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      [(ngModel)]="amc.isActive" />
                    <span class="slider round"></span>
                  </label>
                  <span class="ms-2">
                    {{ amc.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
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
export class AmcFormComponent implements OnInit {
  // ✅ ใช้ object ธรรมดา ไม่มี class
  amc: any = {
    id: 0,
    amcCode: '',
    shortName: '',
    shortNameFundCx: '',
    fullNameTh: '',
    fullNameEn: '',
    email: '',
    contactName: '',
    phoneNo: '',
    defaultCutoffTime: '',
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
    const amcId = this.route.snapshot.params['id'];
    if (amcId) {
      this.isEditMode = true;
      this.getRow(amcId);
    }
  }

  getRow(amcId: number) {
    this.httpService.get(`/amc/get/${amcId}`).subscribe({
      next: (response: any) => {
        // ✅ กำหนดค่าตรงๆ ไม่ต้อง patchValue
        this.amc = response;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to load AMC data', 'Error!');
        this.onCancel();
      }
    });
  }

  onSubmit(form: any) {
    // ✅ ตรวจสอบ form validity
    if (form.invalid) {
      // Mark all fields as touched
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.toast.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    
    // ✅ ส่ง object ตรงๆ (Backend จะ validate อีกที)
    this.httpService.post("/amc/post", this.amc).subscribe({
      next: (response) => {
        this.toast.success(
          `AMC successfully ${this.isEditMode ? 'updated' : 'created'}`,
          'Success'
        );
        this.onCancel();
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Failed to save AMC';
        this.toast.error(errorMessage, 'Error');
        console.error('Error saving AMC:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/master/amc']);
  }
}
 