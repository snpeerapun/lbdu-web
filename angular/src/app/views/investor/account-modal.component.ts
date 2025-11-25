import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-account-modal',
  template: `
    <form #myForm="ngForm">
      <div class="row">
        <div class="col-md-6">
          <!-- Account Code -->
          <div class="form-group">
            <label class="form-label">Account Code</label>
            <input type="text" 
                   class="form-control" 
                   name="accountCode"
                   [(ngModel)]="item.accountCode"
                   placeholder="Auto-generated if empty">
          </div>

          <!-- Account Type -->
          <div class="form-group">
            <label class="form-label">Account Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="accountTypeList"
              valueProp="id"
              labelProp="name"
              name="accountType"
              [(ngModel)]="item.accountType"
              #accountType="ngModel"
              required
              placeholder="Select Account Type"
              [class.is-invalid]="accountType.invalid && accountType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="accountType.invalid && accountType.touched">
              Please select account type
            </div>
          </div>

          <!-- Account Sub Type -->
          <div class="form-group" *ngIf="item.accountType">
            <label class="form-label">Account Sub Type</label>
            <ng-select
              [options]="accountSubTypeList"
              valueProp="id"
              labelProp="name"
              name="accountSubType"
              [(ngModel)]="item.accountSubType"
              placeholder="Select Sub Type">
            </ng-select>
          </div>

          <!-- Joint Type (แสดงเมื่อเป็น Joint Account) -->
          <div class="form-group" *ngIf="item.accountType === 'JOINT'">
            <label class="form-label">Joint Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="jointTypeList"
              valueProp="id"
              labelProp="name"
              name="jointType"
              [(ngModel)]="item.jointType"
              #jointType="ngModel"
              [required]="item.accountType === 'JOINT'"
              placeholder="Select Joint Type"
              [class.is-invalid]="jointType.invalid && jointType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="jointType.invalid && jointType.touched">
              Please select joint type
            </div>
          </div>

          <!-- IC License -->
          <div class="form-group">
            <label class="form-label">IC License</label>
            <input type="text" 
                   class="form-control" 
                   name="icLicense"
                   [(ngModel)]="item.icLicense"
                   placeholder="Investment Consultant License">
          </div>

          <!-- Investment Objective -->
          <div class="form-group">
            <label class="form-label">Investment Objective</label>
            <ng-select
              [options]="investmentObjectiveList"
              valueProp="id"
              labelProp="name"
              name="investmentObjective"
              [(ngModel)]="item.investmentObjective"
              placeholder="Select Investment Objective">
            </ng-select>
          </div>

          <!-- Investment Objective Other -->
          <div class="form-group" *ngIf="item.investmentObjective === 'OTHER'">
            <label class="form-label">Other Objective</label>
            <input type="text" 
                   class="form-control" 
                   name="investmentObjectiveOther"
                   [(ngModel)]="item.investmentObjectiveOther"
                   placeholder="Please specify">
          </div>

          <!-- Open Date -->
          <div class="form-group">
            <label class="form-label">Open Date</label>
            <input type="date" 
                   class="form-control" 
                   name="openDate"
                   [(ngModel)]="item.openDate">
          </div>
        </div>

        <div class="col-md-6">
          <!-- Mailing Address Same As -->
          <div class="form-group">
            <label class="form-label">Mailing Address Same As</label>
            <ng-select
              [options]="mailingAddressSameAsList"
              valueProp="id"
              labelProp="name"
              name="mailingAddressSameAsFlag"
              [(ngModel)]="item.mailingAddressSameAsFlag"
              placeholder="Select Address Type">
            </ng-select>
          </div>

          <!-- Mailing Method -->
          <div class="form-group">
            <label class="form-label">Mailing Method</label>
            <ng-select
              [options]="mailingMethodList"
              valueProp="id"
              labelProp="name"
              name="mailingMethod"
              [(ngModel)]="item.mailingMethod"
              placeholder="Select Mailing Method">
            </ng-select>
          </div>

          <!-- Account Status -->
          <div class="form-group">
            <label class="form-label">Account Status</label>
            <ng-select
              [options]="accountStatusList"
              valueProp="id"
              labelProp="name"
              name="accountStatus"
              [(ngModel)]="item.accountStatus"
              placeholder="Select Status">
            </ng-select>
          </div>

          <!-- Process Status -->
          <div class="form-group">
            <label class="form-label">Process Status</label>
            <ng-select
              [options]="processStatusList"
              valueProp="id"
              labelProp="name"
              name="processStatus"
              [(ngModel)]="item.processStatus"
              placeholder="Select Process Status">
            </ng-select>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label class="form-label">Status</label>
            <ng-select
              [options]="statusList"
              valueProp="id"
              labelProp="name"
              name="status"
              [(ngModel)]="item.status"
              placeholder="Select Status">
            </ng-select>
          </div>

          <!-- FundConnext Account ID -->
          <div class="form-group">
            <label class="form-label">FundConnext Account ID</label>
            <input type="text" 
                   class="form-control" 
                   name="fcAccountId"
                   [(ngModel)]="item.fcAccountId"
                   placeholder="FC Account ID"
                   readonly>
            <small class="text-muted">Auto-generated by FundConnext</small>
          </div>

          <!-- Open Omnibus Form Flag -->
          <div class="form-group form-check">
            <input id="openOmnibusFormFlag" 
                   type="checkbox" 
                   class="form-check-input" 
                   name="openOmnibusFormFlag"
                   [(ngModel)]="item.openOmnibusFormFlag">
            <label for="openOmnibusFormFlag" class="form-check-label">
              Open Omnibus Form
            </label>
          </div>

          <!-- Approved Date -->
          <div class="form-group" *ngIf="item.id">
            <label class="form-label">Approved Date</label>
            <input type="datetime-local" 
                   class="form-control" 
                   name="approvedDateTime"
                   [(ngModel)]="item.approvedDateTime"
                   readonly>
          </div>

          <!-- Close Date -->
          <div class="form-group" *ngIf="item.accountStatus === 'CLOSED'">
            <label class="form-label">Close Date</label>
            <input type="date" 
                   class="form-control" 
                   name="closeDate"
                   [(ngModel)]="item.closeDate">
          </div>
        </div>
      </div>

      <!-- Additional Information Section -->
      <div class="row mt-3" *ngIf="item.accountType === 'MINOR'">
        <div class="col-12">
          <h6 class="text-muted">Minor Account Information</h6>
          <hr>
        </div>
        
        <div class="col-md-6">
          <!-- By Customer (ผู้ดูแล) -->
          <div class="form-group">
            <label class="form-label">Guardian (By Customer)</label>
            <ng-select
              [options]="customerList"
              valueProp="id"
              labelProp="name"
              name="byCustomerId"
              [(ngModel)]="item.byCustomerId"
              placeholder="Select Guardian"
              >
            </ng-select>
          </div>
        </div>

        <div class="col-md-6">
          <!-- For Customer (ผู้เยาว์) -->
          <div class="form-group">
            <label class="form-label">Minor (For Customer) <span class="text-danger">*</span></label>
            <ng-select
              [options]="customerList"
              valueProp="id"
              labelProp="name"
              name="forCustomerId"
              [(ngModel)]="item.forCustomerId"
              #forCustomerId="ngModel"
              [required]="item.accountType === 'MINOR'"
              placeholder="Select Minor"
              [class.is-invalid]="forCustomerId.invalid && forCustomerId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="forCustomerId.invalid && forCustomerId.touched">
              Please select minor
            </div>
          </div>
        </div>
      </div>
    </form>
  `
})
export class AccountModalComponent implements OnInit {
  data!: any;
  item: any = {};

  customerList: any[] = [];

  // Lists
  accountTypeList = [
    { id: 'INDIVIDUAL', name: 'Individual Account' },
    { id: 'JOINT', name: 'Joint Account' },
    { id: 'MINOR', name: 'Minor Account' },
    { id: 'JURISTIC', name: 'Juristic Account' },
    { id: 'OMNIBUS', name: 'Omnibus Account' }
  ];

  accountSubTypeList = [
    { id: 'REGULAR', name: 'Regular Account' },
    { id: 'SSF', name: 'SSF - Super Savings Fund' },
    { id: 'RMF', name: 'RMF - Retirement Mutual Fund' },
    { id: 'PVD', name: 'PVD - Provident Fund' },
    { id: 'LTF', name: 'LTF - Long Term Equity Fund' }
  ];

  jointTypeList = [
    { id: 'AND', name: 'AND - ลงนามร่วมกัน' },
    { id: 'OR', name: 'OR - ลงนามคนใดคนหนึ่ง' },
    { id: 'EITHER', name: 'EITHER - ลงนามแทนกันได้' }
  ];

  investmentObjectiveList = [
    { id: 'Capital Growth', name: 'Capital Growth - เติบโตของเงินทุน' },
    { id: 'Income', name: 'Income - รายได้' },
    { id: 'Speculation', name: 'Speculation - เก็งกำไร' },
    { id: 'Retirement', name: 'Retirement - เกษียณอายุ' },
    { id: 'Education', name: 'Education - การศึกษา' },
    { id: 'OTHER', name: 'Other - อื่นๆ' }
  ];

  mailingAddressSameAsList = [
    { id: 'REGISTERED', name: 'Registered Address - ที่อยู่ทะเบียนบ้าน' },
    { id: 'CURRENT', name: 'Current Address - ที่อยู่ปัจจุบัน' },
    { id: 'OFFICE', name: 'Office Address - ที่อยู่ที่ทำงาน' },
    { id: 'OTHER', name: 'Other Address - ที่อยู่อื่น' }
  ];

  mailingMethodList = [
    { id: 'EMAIL', name: 'Email' },
    { id: 'POST', name: 'Post - ไปรษณีย์' },
    { id: 'PICKUP', name: 'Pick Up - รับด้วยตนเอง' },
    { id: 'NONE', name: 'None - ไม่ต้องการรับ' }
  ];

  accountStatusList = [
    { id: 'PENDING', name: 'Pending - รอดำเนินการ' },
    { id: 'ACTIVE', name: 'Active - ใช้งานได้' },
    { id: 'SUSPENDED', name: 'Suspended - ระงับชั่วคราว' },
    { id: 'CLOSED', name: 'Closed - ปิดบัญชี' },
    { id: 'DORMANT', name: 'Dormant - ไม่มีการใช้งาน' }
  ];

  processStatusList = [
    { id: 'DRAFT', name: 'Draft - ร่าง' },
    { id: 'SUBMITTED', name: 'Submitted - ส่งแล้ว' },
    { id: 'APPROVED', name: 'Approved - อนุมัติแล้ว' },
    { id: 'REJECTED', name: 'Rejected - ปฏิเสธ' },
    { id: 'COMPLETED', name: 'Completed - เสร็จสมบูรณ์' }
  ];

  statusList = [
    { id: 'ACTIVE', name: 'Active' },
    { id: 'INACTIVE', name: 'Inactive' }
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

    // Load customer list สำหรับ Minor Account
    if (this.data?.customerList) {
      this.customerList = this.data.customerList;
    } else {
      this.loadCustomerList();
    }
  }

  loadCustomerList() {
    // Load customers สำหรับเลือกเป็น Guardian หรือ Minor
    this.httpService.get('/customer/list?status=ACTIVE').subscribe({
      next: (response: any) => {
        this.customerList = response.map((c: any) => ({
          id: c.id,
          name: `${c.titleTh || ''} ${c.firstNameTh || ''} ${c.lastNameTh || ''} (${c.cardNumber || c.taxId || ''})`
        }));
      },
      error: (err) => {
        console.error('Error loading customers:', err);
      }
    });
  }

  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // ตรวจสอบ required fields
      if (!this.item.customerId) {
        this.alertService.error('Customer ID is required', 'Error!');
        reject('Customer ID is required');
        return;
      }

      if (!this.item.accountType) {
        this.alertService.error('Please select account type', 'Error!');
        reject('Form is invalid');
        return;
      }

      // ตรวจสอบ Joint Type สำหรับ Joint Account
      if (this.item.accountType === 'JOINT' && !this.item.jointType) {
        this.alertService.error('Please select joint type for joint account', 'Error!');
        reject('Form is invalid');
        return;
      }

      // ตรวจสอบ For Customer สำหรับ Minor Account
      if (this.item.accountType === 'MINOR' && !this.item.forCustomerId) {
        this.alertService.error('Please select minor for minor account', 'Error!');
        reject('Form is invalid');
        return;
      }

      const payload = { ...this.item };
      
      this.httpService.post('/account/post', payload).subscribe({
        next: (response: any) => {
          this.alertService.success('Account saved successfully.');
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