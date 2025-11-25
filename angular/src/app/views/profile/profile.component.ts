import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  template: `
    <div class="row  ustify-content-center">
      <div class="col-12 col-lg-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">
              <i class="fas fa-user me-2"></i>
              แก้ไขข้อมูลส่วนตัว
            </h5>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <div class="row">
                <div class="col-md-3">
                  <div class="text-center mb-4">
                    <div class="avatar-wrapper">
                      <img [src]="avatarPreview || 'assets/images/default-avatar.png'" 
                          class="avatar-img" 
                          alt="Profile Image">
                      <div class="avatar-overlay">
                        <label class="upload-button" [class.has-file]="!!selectedFile">
                          <i class="fas" [class.fa-camera]="!selectedFile" [class.fa-check]="selectedFile"></i>
                          <input type="file" 
                                accept="image/*" 
                                (change)="onFileSelected($event)" 
                                style="display: none">
                        </label>
                      </div>
                    </div>
                    <small class="text-muted d-block mt-2">
                      อัพโหลดรูปโปรไฟล์ (ไม่เกิน 2MB)
                    </small>
                    <div *ngIf="selectedFile" class="mt-2">
                      <button type="button" 
                              class="btn btn-sm btn-outline-danger" 
                              (click)="removeSelectedFile()">
                        <i class="fas fa-times me-1"></i>ลบรูป
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-md-9">
                  <div class="mb-3">
                    <label class="form-label">ชื่อ-นามสกุล *</label>
                    <input type="text" class="form-control" formControlName="fullName"
                      [ngClass]="{ 'is-invalid': submitted && f['fullName'].errors }">
                    <div *ngIf="submitted && f['fullName'].errors" class="invalid-feedback">
                      กรุณากรอกชื่อ-นามสกุล
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">อีเมล *</label>
                    <input type="email" class="form-control" formControlName="email"
                      [ngClass]="{ 'is-invalid': submitted && f['email'].errors }">
                    <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                      <div *ngIf="f['email'].errors['required']">กรุณากรอกอีเมล</div>
                      <div *ngIf="f['email'].errors['email']">รูปแบบอีเมลไม่ถูกต้อง</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">เบอร์โทรศัพท์ *</label>
                    <input type="tel" class="form-control" formControlName="phone"
                      [ngClass]="{ 'is-invalid': submitted && f['phone'].errors }">
                    <div *ngIf="submitted && f['phone'].errors" class="invalid-feedback">
                      กรุณากรอกเบอร์โทรศัพท์
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">Line ID</label>
                    <input type="text" class="form-control" formControlName="lineId">
                  </div>

                  <div class="text-end">
                    <button type="submit" class="btn btn-primary px-4">
                      <i class="fas fa-save me-2"></i>บันทึกข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
      margin: 0 auto;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.5);
      padding: 8px;
      transition: all 0.3s ease;
      opacity: 0;
    }

    .avatar-wrapper:hover .avatar-overlay {
      opacity: 1;
    }

    .upload-button {
      display: block;
      color: white;
      text-align: center;
      cursor: pointer;
      
      &.has-file {
        color: #28a745;
      }
      
      i {
        font-size: 1.2rem;
      }
    }

    .card {
      border: 1px solid rgba(0,0,0,.125);
      box-shadow: none;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  submitted = false;
  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.profileForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      lineId: ['']
    });
  }

  ngOnInit() {
    // Load user profile data here
  }

  get f() { return this.profileForm.controls; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.avatarPreview = null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }
    
    // Append other form data
    Object.keys(this.profileForm.value).forEach(key => {
      formData.append(key, this.profileForm.value[key]);
    });

    // Save profile data
    console.log('Form data:', this.profileForm.value);
    console.log('Selected file:', this.selectedFile);
  }
}
