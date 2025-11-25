import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-relate-person-modal',
  template: `
    <form #myForm="ngForm">
      <div class="row">
        <div class="col-md-6">
          <!-- Relation Type -->
          <div class="form-group">
            <label class="form-label">Relation Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="relationTypeList"
              valueProp="id"
              labelProp="name"
              name="relationType"
              [(ngModel)]="item.relationType"
              #relationType="ngModel"
              required
              placeholder="Select Relation Type"
              [class.is-invalid]="relationType.invalid && relationType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="relationType.invalid && relationType.touched">
              Please select relation type
            </div>
          </div>

          <!-- Identification Card Type -->
          <div class="form-group">
            <label class="form-label">Identification Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="identificationCardTypeList"
              valueProp="id"
              labelProp="name"
              name="identificationCardType"
              [(ngModel)]="item.identificationCardType"
              #identificationCardType="ngModel"
              required
              placeholder="Select Type"
              [class.is-invalid]="identificationCardType.invalid && identificationCardType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="identificationCardType.invalid && identificationCardType.touched">
              Please select identification type
            </div>
          </div>

          <!-- Passport Country (แสดงเมื่อเลือก PASSPORT) -->
          <div class="form-group" *ngIf="item.identificationCardType === 'PASSPORT'">
            <label class="form-label">Passport Country</label>
            <ng-select
              [options]="countryList"
              valueProp="id"
              labelProp="name"
              name="passportCountry"
              [(ngModel)]="item.passportCountry"
              placeholder="Select Country">
            </ng-select>
          </div>

          <!-- Card Number -->
          <div class="form-group">
            <label class="form-label">Card Number <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="cardNumber"
                   [(ngModel)]="item.cardNumber"
                   #cardNumber="ngModel"
                   required
                   [class.is-invalid]="cardNumber.invalid && cardNumber.touched">
            <div class="invalid-feedback" *ngIf="cardNumber.invalid && cardNumber.touched">
              Please enter card number
            </div>
          </div>

          <!-- Title Thai -->
          <div class="form-group">
            <label class="form-label">คำนำหน้า (ไทย) <span class="text-danger">*</span></label>
            <ng-select
              [options]="titleThList"
              valueProp="id"
              labelProp="name"
              name="titleTh"
              [(ngModel)]="item.titleTh"
              #titleTh="ngModel"
              required
              placeholder="เลือกคำนำหน้า"
              [class.is-invalid]="titleTh.invalid && titleTh.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="titleTh.invalid && titleTh.touched">
              กรุณาเลือกคำนำหน้า
            </div>
          </div>

          <!-- First Name Thai -->
          <div class="form-group">
            <label class="form-label">ชื่อ (ไทย) <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="firstNameTh"
                   [(ngModel)]="item.firstNameTh"
                   #firstNameTh="ngModel"
                   required
                   [class.is-invalid]="firstNameTh.invalid && firstNameTh.touched">
            <div class="invalid-feedback" *ngIf="firstNameTh.invalid && firstNameTh.touched">
              กรุณากรอกชื่อ
            </div>
          </div>

          <!-- Last Name Thai -->
          <div class="form-group">
            <label class="form-label">นามสกุล (ไทย) <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="lastNameTh"
                   [(ngModel)]="item.lastNameTh"
                   #lastNameTh="ngModel"
                   required
                   [class.is-invalid]="lastNameTh.invalid && lastNameTh.touched">
            <div class="invalid-feedback" *ngIf="lastNameTh.invalid && lastNameTh.touched">
              กรุณากรอกนามสกุล
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <!-- Title English -->
          <div class="form-group">
            <label class="form-label">Title (English)</label>
            <ng-select
              [options]="titleEnList"
              valueProp="id"
              labelProp="name"
              name="titleEn"
              [(ngModel)]="item.titleEn"
              placeholder="Select Title">
            </ng-select>
          </div>

          <!-- First Name English -->
          <div class="form-group">
            <label class="form-label">First Name (English)</label>
            <input type="text" 
                   class="form-control" 
                   name="firstNameEn"
                   [(ngModel)]="item.firstNameEn">
          </div>

          <!-- Last Name English -->
          <div class="form-group">
            <label class="form-label">Last Name (English)</label>
            <input type="text" 
                   class="form-control" 
                   name="lastNameEn"
                   [(ngModel)]="item.lastNameEn">
          </div>

          <!-- Signature Authority -->
          <div class="form-group">
            <label class="form-label">Signature Authority</label>
            <ng-select
              [options]="signatureAuthorityList"
              valueProp="id"
              labelProp="name"
              name="signatureAuthority"
              [(ngModel)]="item.signatureAuthority"
              placeholder="Select Authority">
            </ng-select>
          </div>

          <!-- Ownership Percentage -->
          <div class="form-group">
            <label class="form-label">Ownership Percentage (%)</label>
            <input type="number" 
                   class="form-control" 
                   name="ownershipPercentage"
                   [(ngModel)]="item.ownershipPercentage"
                   min="0" 
                   max="100" 
                   step="0.01">
          </div>

          <!-- Is Primary -->
          <div class="form-group form-check">
            <input id="isPrimary" 
                   type="checkbox" 
                   class="form-check-input" 
                   name="isPrimary"
                   [(ngModel)]="item.isPrimary">
            <label for="isPrimary" class="form-check-label">Primary Contact</label>
          </div>

          <!-- Is Active -->
          <div class="form-group form-check">
            <input id="isActive" 
                   type="checkbox" 
                   class="form-check-input" 
                   name="isActive"
                   [(ngModel)]="item.isActive">
            <label for="isActive" class="form-check-label">Active</label>
          </div>
        </div>
      </div>
    </form>
  `
})
export class RelatePersonModalComponent implements OnInit {
  data!: any;
  item: any = {
    customerId: null,
    relationType: '',
    identificationCardType: '',
    passportCountry: '',
    cardNumber: '',
    titleTh: '',
    firstNameTh: '',
    lastNameTh: '',
    titleEn: '',
    firstNameEn: '',
    lastNameEn: '',
    signatureAuthority: '',
    ownershipPercentage: null,
    isPrimary: false,
    isActive: true
  };

  // Lists
  relationTypeList = [
    { id: 'DIRECTOR', name: 'กรรมการ' },
    { id: 'SHAREHOLDER', name: 'ผู้ถือหุ้น' },
    { id: 'AUTHORIZED_PERSON', name: 'ผู้มีอำนาจลงนาม' },
    { id: 'BENEFICIAL_OWNER', name: 'ผู้เป็นเจ้าของผลประโยชน์' },
    { id: 'REPRESENTATIVE', name: 'ผู้แทน' },
    { id: 'OTHER', name: 'อื่นๆ' }
  ];

  identificationCardTypeList = [
    { id: 'CITIZEN_CARD', name: 'บัตรประชาชน' },
    { id: 'PASSPORT', name: 'หนังสือเดินทาง' },
    { id: 'ALIEN', name: 'บัตรคนต่างด้าว' }
  ];

  countryList = [
    { id: 'TH', name: 'Thailand' },
    { id: 'US', name: 'United States' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'JP', name: 'Japan' },
    { id: 'CN', name: 'China' }
  ];

  titleThList = [
    { id: 'นาย', name: 'นาย' },
    { id: 'นาง', name: 'นาง' },
    { id: 'นางสาว', name: 'นางสาว' },
    { id: 'OTHER', name: 'อื่นๆ' }
  ];

  titleEnList = [
    { id: 'Mr.', name: 'Mr.' },
    { id: 'Mrs.', name: 'Mrs.' },
    { id: 'Miss', name: 'Miss' },
    { id: 'OTHER', name: 'Other' }
  ];

  signatureAuthorityList = [
    { id: 'SINGLE', name: 'ลงนามเดี่ยว' },
    { id: 'JOINT', name: 'ลงนามร่วม' },
    { id: 'NONE', name: 'ไม่มีอำนาจลงนาม' }
  ];

  constructor(
    private httpService: HttpService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // ถ้ามีข้อมูลส่งมา ให้ใช้ข้อมูลนั้น
    if (this.data?.item) {
      this.item = { ...this.item, ...this.data.item };
    }
    
    // ถ้าไม่มี customerId ให้ใช้จาก data
    if (!this.item.customerId && this.data?.customerId) {
      this.item.customerId = this.data.customerId;
    }
  }

  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // ตรวจสอบ required fields
      if (!this.item.customerId) {
        this.alertService.error('Customer ID is required', 'Error!');
        reject('Customer ID is required');
        return;
      }

      if (!this.item.relationType || !this.item.identificationCardType || 
          !this.item.cardNumber || !this.item.titleTh || 
          !this.item.firstNameTh || !this.item.lastNameTh) {
        this.alertService.error('Please fill in all required fields', 'Error!');
        reject('Form is invalid');
        return;
      }

      const payload = { ...this.item };
      
      this.httpService.post('/customer/relateperson/post', payload).subscribe({
        next: (response: any) => {
          this.alertService.success('Related person saved successfully.');
          resolve(response);
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error saving data', 'Error!');
          reject(err.error?.message);
        }
      });
    });
  }
}