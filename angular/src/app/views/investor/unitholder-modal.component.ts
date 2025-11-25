import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-unitholder-modal',
  template: `
    <form #myForm="ngForm">
      <div class="row">
        <div class="col-md-6">
          <!-- AMC (Asset Management Company) -->
          <div class="form-group">
            <label class="form-label">Asset Management Company (AMC) <span class="text-danger">*</span></label>
            <ng-select
              [options]="amcList"
              valueProp="id"
              labelProp="name"
              name="amcId"
              [(ngModel)]="item.amcId"
              #amcId="ngModel"
              required
              placeholder="Select AMC"
              (change)="onAmcChange()"
              [class.is-invalid]="amcId.invalid && amcId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="amcId.invalid && amcId.touched">
              Please select AMC
            </div>
          </div>

          <!-- AMC Code (Auto-filled) -->
          <div class="form-group">
            <label class="form-label">AMC Code</label>
            <input type="text" 
                   class="form-control" 
                   name="amcCode"
                   [(ngModel)]="item.amcCode"
                   readonly>
          </div>

          <!-- External Unitholder ID -->
          <div class="form-group">
            <label class="form-label">External Unitholder ID <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="externalUnitholderId"
                   [(ngModel)]="item.externalUnitholderId"
                   #externalUnitholderId="ngModel"
                   required
                   placeholder="Unitholder ID from AMC"
                   [class.is-invalid]="externalUnitholderId.invalid && externalUnitholderId.touched">
            <small class="text-muted">รหัส Unitholder จาก AMC</small>
            <div class="invalid-feedback" *ngIf="externalUnitholderId.invalid && externalUnitholderId.touched">
              Please enter external unitholder ID
            </div>
          </div>

          <!-- Unitholder Type -->
          <div class="form-group">
            <label class="form-label">Unitholder Type</label>
            <ng-select
              [options]="unitholderTypeList"
              valueProp="id"
              labelProp="name"
              name="unitholderType"
              [(ngModel)]="item.unitholderType"
              placeholder="Select Type">
            </ng-select>
          </div>

          <!-- Currency -->
          <div class="form-group">
            <label class="form-label">Currency <span class="text-danger">*</span></label>
            <ng-select
              [options]="currencyList"
              valueProp="id"
              labelProp="name"
              name="currency"
              [(ngModel)]="item.currency"
              #currency="ngModel"
              required
              placeholder="Select Currency"
              [class.is-invalid]="currency.invalid && currency.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="currency.invalid && currency.touched">
              Please select currency
            </div>
          </div>
        </div>

        <div class="col-md-6">
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

          <!-- Open Date -->
          <div class="form-group">
            <label class="form-label">Open Date</label>
            <input type="date" 
                   class="form-control" 
                   name="openDate"
                   [(ngModel)]="item.openDate">
          </div>

          <!-- Close Date -->
          <div class="form-group" *ngIf="item.status === 'CLOSED'">
            <label class="form-label">Close Date</label>
            <input type="date" 
                   class="form-control" 
                   name="closeDate"
                   [(ngModel)]="item.closeDate">
          </div>

          <!-- Account Info (Read-only) -->
          <div class="alert alert-info" *ngIf="accountInfo">
            <strong>Account Information:</strong><br>
            Account Code: {{ accountInfo.accountCode }}<br>
            Account Type: {{ accountInfo.accountType }}<br>
            Customer: {{ accountInfo.customerName }}
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="row mt-3">
        <div class="col-12">
          <div class="alert alert-warning">
            <i class="fas fa-info-circle"></i>
            <strong>หมายเหตุ:</strong>
            <ul class="mb-0 mt-2">
              <li>External Unitholder ID คือรหัสที่ได้รับจาก AMC</li>
              <li>แต่ละ Account สามารถมี Unitholder ได้หลาย AMC</li>
              <li>Unitholder จะถูกใช้ในการทำธุรกรรมซื้อขายกองทุนกับ AMC</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  `
})
export class UnitholderModalComponent implements OnInit {
  data!: any;
  item: any = {
    customerId: null,
    accountId: null,
    amcId: null,
    externalUnitholderId: '',
    unitholderType: 'REGULAR',
    amcCode: null,
    currency: 'THB',
    status: 'ACTIVE',
    openDate: null,
    closeDate: null
  };

  amcList: any[] = [];
  accountInfo: any = null;

  // Lists
  unitholderTypeList = [
    { id: 'REGULAR', name: 'Regular - ทั่วไป' },
    { id: 'OMNIBUS', name: 'Omnibus - รวมศูนย์' },
    { id: 'NOMINEE', name: 'Nominee - ผู้รับมอบอำนาจ' }
  ];

  currencyList = [
    { id: 'THB', name: 'Thai Baht (THB)' },
    { id: 'USD', name: 'US Dollar (USD)' },
    { id: 'EUR', name: 'Euro (EUR)' },
    { id: 'GBP', name: 'British Pound (GBP)' },
    { id: 'JPY', name: 'Japanese Yen (JPY)' },
    { id: 'CNY', name: 'Chinese Yuan (CNY)' },
    { id: 'SGD', name: 'Singapore Dollar (SGD)' },
    { id: 'HKD', name: 'Hong Kong Dollar (HKD)' }
  ];

  statusList = [
    { id: 'PENDING', name: 'Pending - รอดำเนินการ' },
    { id: 'ACTIVE', name: 'Active - ใช้งานได้' },
    { id: 'SUSPENDED', name: 'Suspended - ระงับชั่วคราว' },
    { id: 'CLOSED', name: 'Closed - ปิดบัญชี' }
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
    
    // ถ้าไม่มี customerId หรือ accountId ให้ใช้จาก data
    if (!this.item.customerId && this.data?.customerId) {
      this.item.customerId = this.data.customerId;
    }
    if (!this.item.accountId && this.data?.accountId) {
      this.item.accountId = this.data.accountId;
    }

    // Load AMC list
    this.loadAmcList();

    // Load account info
    if (this.item.accountId) {
      this.loadAccountInfo();
    }
  }

  loadAmcList() {
    this.httpService.get('/amc/getall').subscribe({
      next: (response: any) => {
        this.amcList = response.map((amc: any) => ({
          id: amc.id,
          name: `${amc.shortName} - ${amc.fullNameTh}`,
          code: amc.amcCode
        }));
      },
      error: (err) => {
        console.error('Error loading AMC list:', err);
        this.alertService.error('Failed to load AMC list', 'Error!');
      }
    });
  }

  loadAccountInfo() {
    this.httpService.get(`/account/get/${this.item.accountId}`).subscribe({
      next: (response: any) => {
        this.accountInfo = {
          accountCode: response.accountCode,
          accountType: response.accountType,
          customerName: response.customer?.customerName || 
                       `${response.customer?.titleTh || ''} ${response.customer?.firstNameTh || ''} ${response.customer?.lastNameTh || ''}`
        };
      },
      error: (err) => {
        console.error('Error loading account info:', err);
      }
    });
  }

  onAmcChange() {
    // Auto-fill AMC Code when AMC is selected
    const selectedAmc = this.amcList.find(amc => amc.id === this.item.amcId);
    if (selectedAmc) {
      this.item.amcCode = selectedAmc.code;
    }
  }

  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // ตรวจสอบ required fields
   

      if (!this.item.accountId) {
        this.alertService.error('Account ID is required', 'Error!');
        reject('Account ID is required');
        return;
      }

      if (!this.item.amcId || !this.item.externalUnitholderId || !this.item.currency) {
        this.alertService.error('Please fill in all required fields', 'Error!');
        reject('Form is invalid');
        return;
      }

      const payload = { ...this.item };
      
      this.httpService.post('/unitholder/post', payload).subscribe({
        next: (response: any) => {
          this.alertService.success('Unitholder saved successfully.');
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