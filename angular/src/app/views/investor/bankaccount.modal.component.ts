import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
@Component({
  selector: 'app-bankaccount-modal',
  template: `
    <form #myForm="ngForm">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label class="form-label">Tx Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="txTypeList"
              valueProp="id"
              labelProp="name"
              name="txType"
              [(ngModel)]="item.txType"
              #txType="ngModel"
              required
              placeholder="Select Account Type"
              [class.is-invalid]="txType.invalid && txType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="txType.invalid && txType.touched">
              Please select tx type
            </div>
          </div>

          <!-- Bank Account Type -->
          <div class="form-group">
            <label class="form-label">Account Type <span class="text-danger">*</span></label>
            <ng-select
              [options]="bankAccountTypeList"
              name="bankAccountType"
              [(ngModel)]="item.bankAccountType"
              #bankAccountType="ngModel"
              required
              placeholder="Select Account Type"
              [class.is-invalid]="bankAccountType.invalid && bankAccountType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="bankAccountType.invalid && bankAccountType.touched">
              Please select account type
            </div>
          </div>
 

           <!-- Bank  -->
          <div class="form-group">
            <label class="form-label">Bank <span class="text-danger">*</span></label>
            <ng-select
              [options]="bankList"
              name="bankId"
              [(ngModel)]="item.bankId"
              #bankId="ngModel"
              required
              (ngModelChange)="onChangeBank()"
              placeholder="Select Bank"
              [class.is-invalid]="bankId.invalid && bankId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="bankId.invalid && bankId.touched">
              Please select bank
            </div>
          </div>
          <!-- Bank Branch -->
          <div class="form-group">
            <label class="form-label">Branch <span class="text-danger">*</span></label>
            <ng-select
              [options]="bankBrachList"
              name="bankBranchId"
              [(ngModel)]="item.bankBranchId"
              #bankBranchId="ngModel"
              required
              (ngModelChange)="onChangeBank()"
              placeholder="Select Branch"
              [class.is-invalid]="bankBranchId.invalid && bankBranchId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="bankBranchId.invalid && bankBranchId.touched">
              Please select branch.
            </div>
          </div>
          <!-- Bank Account No -->
          <div class="form-group">
            <label class="form-label">Account Number <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="bankAccountNo"
                   [(ngModel)]="item.bankAccountNo"
                   #bankAccountNo="ngModel"
                   required
                   placeholder="e.g. 1234567890"
                   [class.is-invalid]="bankAccountNo.invalid && bankAccountNo.touched">
            <div class="invalid-feedback" *ngIf="bankAccountNo.invalid && bankAccountNo.touched">
              Please enter account number
            </div>
          </div>

          <!-- Bank Account Name -->
          <div class="form-group">
            <label class="form-label">Account Name <span class="text-danger">*</span></label>
            <input type="text" 
                   class="form-control" 
                   name="bankAccountName"
                   #bankAccountName="ngModel"
                   [(ngModel)]="item.bankAccountName"
                   placeholder="Name on bank account"
                  [class.is-invalid]="bankAccountName.invalid && bankAccountName.touched">
                <div class="invalid-feedback" *ngIf="bankAccountName.invalid && bankAccountName.touched">
                  Please enter account name
                </div>
          </div>
        </div>

        <div class="col-md-6">
          <!-- Currency -->
          <div class="form-group">
            <label class="form-label">Currency</label>
            <ng-select
              [options]="currencyList"
              valueProp="id"
              labelProp="name"
              name="currency"
              [(ngModel)]="item.currency"
              placeholder="Select Currency">
            </ng-select>
          </div>

          <!-- Finnet Customer No -->
          <div class="form-group">
            <label class="form-label">Finnet Customer No</label>
            <input type="text" 
                   class="form-control" 
                   name="finnetCustomerNo"
                   [(ngModel)]="item.finnetCustomerNo"
                   placeholder="Finnet reference number">
          </div>

          <!-- SA Reference Log -->
          <div class="form-group">
            <label class="form-label">SA Reference Log</label>
            <input type="text" 
                   class="form-control" 
                   name="saReferenceLog"
                   [(ngModel)]="item.saReferenceLog"
                   placeholder="SA reference">
          </div>

          <!-- DDR Timestamp Reference -->
          <div class="form-group">
            <label class="form-label">DDR Timestamp Reference</label>
            <input type="text" 
                   class="form-control" 
                   name="ddrTimestampReference"
                   [(ngModel)]="item.ddrTimestampReference"
                   placeholder="DDR reference">
          </div>

          <!-- Is Default -->
          <div class="form-group form-check">
            <input id="isDefault" 
                   type="checkbox" 
                   class="form-check-input" 
                   name="isDefault"
                   [(ngModel)]="item.isDefault">
            <label for="isDefault" class="form-check-label">Default Bank Account</label>
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
export class BankAccountModalComponent implements OnInit {
  data!: any;
  bankList: Array<any> = [];
  bankBrachList: Array<any> = [];
  item: any = {
    isDefault: false,
    isActive: true
  };

  // Lists
  bankAccountTypeList = [
    { id: 'SAVINGS', name: 'บัญชีออมทรัพย์ (Savings)' },
    { id: 'CURRENT', name: 'บัญชีกระแสรายวัน (Current)' },
    { id: 'FIXED_DEPOSIT', name: 'บัญชีฝากประจำ (Fixed Deposit)' }
  ];
  txTypeList = [
    { id: 'SUBSCRIPTION', name: 'บัญชีจองซื้อ (Subscription)' },
    { id: 'REDEMPTION', name: 'บัญชีขายคืน (Redemption)' }, 
  ];
 

  currencyList = [
    { id: 'THB', name: 'Thai Baht (THB)' },
    { id: 'USD', name: 'US Dollar (USD)' },
    { id: 'EUR', name: 'Euro (EUR)' },
    { id: 'GBP', name: 'British Pound (GBP)' },
    { id: 'JPY', name: 'Japanese Yen (JPY)' }
  ];

  constructor(
    private httpService: HttpService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // ถ้ามีข้อมูลส่งมา ให้ใช้ข้อมูลนั้น
    this.loadData();
    if (this.data?.item) {
      this.item = { ...this.item, ...this.data.item };
    }
    
    // ถ้าไม่มี accountId ให้ใช้จาก data
    if (!this.item.accountId && this.data?.accountId) {
      this.item.accountId = this.data.accountId;
    }

    this.onChangeBank();
  }
  loadData() {
    // โหลดรายการธนาคารจาก API
      this.httpService.get('/bank/getall').subscribe({  
        next: (response: any) => {
          this.bankList = response.map((bank: any) => ({
            id: bank.id,
            name: `${bank.bankCode} - ${bank.nameTh}`
          }));
        },
        error: (error) => {
          this.toast.error('Failed to load bank list', 'Error!');
        } 
    });
  }

  onChangeBank() {
    // โหลดรายการสาขาธนาคารจาก API
    if (this.item.bankId) {
      this.httpService.get(`/bankbranch/getbybank/${this.item.bankId}`).subscribe({
        next: (response: any) => {
          this.bankBrachList = response.map((branch: any) => ({
            id: branch.id,
            name: `${branch.branchCode} - ${branch.nameTh}`
          }));
        },
        error: (error) => {
          this.toast.error('Failed to load bank branch list', 'Error!');
        }
      }); 
    }
  } 
    // โหลดรายการสาขาธนาคารจาก API
  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // ตรวจสอบ required fields
      if (!this.item.accountId) {
        this.toast.error('Account ID is required', 'Error!');
        reject('Account ID is required');
        return;
      }

      if (!this.item.bankAccountType ||!this.item.txType || !this.item.bankId || !this.item.bankAccountNo) {
        this.toast.error('Please fill in all required fields', 'Error!');
        reject('Form is invalid');
        return;
      }

      const payload = { ...this.item };
      
      this.httpService.post('/bankaccount/post', payload).subscribe({
        next: (response: any) => {
          this.toast.success('Bank account saved successfully.');
          resolve(response);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error saving data', 'Error!');
          reject(err.error?.message);
        }
      });
    });
  }
}