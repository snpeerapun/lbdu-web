import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-budget-item',
  template: `
   <!-- Budget Account -->
  <div *ngIf="errors.length > 0" class="alert alert-danger">
  <ul>
    <li *ngFor="let error of errors">{{ error }}</li>
  </ul>
</div> 
<div class="row">
   <div class="col-md-6">
    <div class="form-group">
      <label class="form-label">Budget Account</label>
      <ng-select  [(ngModel)]="budgetItem.accountCodeId"  #accountCodeId="ngModel" [options]="budgetAccounts" [placeholder]="'Select Budget Account'" 
                  (change)="onAccountCodeChange()">
      </ng-select>
      
    </div>

    <!-- Description -->
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" [(ngModel)]="budgetItem.description" #description="ngModel"   ></textarea>
     
    </div>

    <!-- Total Amount -->
    <div class="form-group">
      <label class="form-label">Total Amount</label>
      <input type="text" numberFormat class="form-control" [(ngModel)]="budgetItem.totalAmount" #totalAmount="ngModel"   
             (input)="onTotalAmountChange()">
      
    </div>

    <div class="form-group">
      <label class="form-label">Start Month</label>
      <select class="form-select" [(ngModel)]="budgetItem.startMonth" (change)="onStartMonthChange()">
        <option *ngFor="let month of months; let i = index" [value]="i + 1">
          {{ month }}
        </option>
      </select>
    </div>

    <!-- Distribution Method -->
    <div class="form-group">
      <label class="form-label">Distribution Method</label>
      <select class="form-select" [(ngModel)]="budgetItem.distributionMethod" (change)="onDistributionMethodChange()">
        <option value="">Select Distribution Method</option>
        <option value="equal">Equal Distribution</option>
        <option value="custom">Custom Distribution</option>
      </select>
    </div>
  </div>

    <!-- Monthly Allocations -->
  <div class="col-md-6">
    <label class="form-label">Monthly Allocations</label>
    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
  
    <table class="table table-bordered">
      <thead>
        <tr>
          <th class="text-center">Month</th>
          <th class="text-center">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let month of monthFields; let i = index">
          <td class="text-center">{{ months[i] }}</td>
          <td>
            <input type="text" numberFormat  
                   class="form-control text-end" 
                   style="width: 120px;"
                   [(ngModel)]="budgetItem[month]"
                   [readonly]="isExpenseAccount"
                   (input)="onMonthlyAmountChange()">
          </td>
        </tr>
      </tbody>
    </table>
    </div>
   </div>
</div>
`
})
 
export class BudgetItemComponent implements OnInit {
  budgetItem = {} as any;
  data!: any; // รับค่าที่ถูกส่งมาจาก ModalService
  budgetAccounts: any[] = [];
  months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  monthFields = ['month1', 'month2', 'month3', 'month4', 'month5', 'month6', 'month7', 'month8', 'month9', 'month10', 'month11', 'month12'];
  errors: string[] = [];
  isExpenseAccount = false; // ตรวจสอบว่าเป็นบัญชีค่าใช้จ่ายหรือไม่
 
  constructor(private httpService: HttpService, private alertService: AlertService) {}

  ngOnInit() {
    this.patchData(this.data);
    console.log(this.budgetItem);
    this.loadBudgetAccounts();
  }

  /** ✅ โหลด Budget Accounts */
  private loadBudgetAccounts() {
    this.httpService.get('/accountcode/getall').subscribe({
      next: (response: any) => {
        this.budgetAccounts = Object.values(response).map((item: any) => ({
          id: item.id,
          name: `${item.code} - ${item.nameThai}`,
          code: item.code
        })).sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (error) => {
        this.alertService.error('Failed to load budget accounts');
      }
    });
  }

  /** ✅ เมื่อเปลี่ยน Account Code */
  onAccountCodeChange() {
    const selectedAccount = this.budgetAccounts.find(acc => acc.id === this.budgetItem.accountCodeId);
    if (selectedAccount) {
      // ตรวจสอบว่าเป็นบัญชีค่าใช้จ่าย (รหัสเริ่มต้นด้วย 5)
      this.isExpenseAccount = selectedAccount.code.startsWith('5');
      
      if (this.isExpenseAccount) {
        // ถ้าเป็นค่าใช้จ่าย ให้กระจายเท่าๆ กันทุกเดือนอัตโนมัติ
        this.budgetItem.distributionMethod = 'equal';
        this.distributeEqually();
      } else {
        // ถ้าเป็นสินทรัพย์ ให้เคลียร์ค่าทุกเดือน
        this.clearAllMonths();
      }
    }
  }

  /** ✅ เมื่อเปลี่ยน Total Amount */
  onTotalAmountChange() {
    if (this.isExpenseAccount && this.budgetItem.distributionMethod === 'equal') {
      this.distributeEqually();
    }
  }

  /** ✅ เมื่อเปลี่ยน Start Month */
  onStartMonthChange() {
    if (!this.isExpenseAccount) {
      // ถ้าเป็นสินทรัพย์ ให้ใส่ยอดรวมในเดือนที่เลือก
      this.clearAllMonths();
      const monthField = `month${this.budgetItem.startMonth}`;
      this.budgetItem[monthField] = this.budgetItem.totalAmount || 0;
    }
  }

  /** ✅ อัปเดตค่าหลังจากกด input */
  onMonthlyAmountChange() {
    if (!this.isExpenseAccount) {
      // คำนวณ total amount จากยอดรายเดือน (เฉพาะกรณีไม่ใช่ค่าใช้จ่าย)
      let total = 0;
      this.monthFields.forEach(month => {
        total += parseFloat(this.budgetItem[month]) || 0;
      });
      this.budgetItem.totalAmount = total;
    }
  }

  /** ✅ คำนวณการกระจายงบประมาณแบบเท่าๆ กัน */
  distributeEqually() {
    if (!this.budgetItem.totalAmount) return;
    
    const totalAmount = parseFloat(this.budgetItem.totalAmount);
    const monthlyAmount = Math.floor(totalAmount / 12);
    const remainder = totalAmount - (monthlyAmount * 12);

    // กระจายเท่าๆ กัน 12 เดือน
    this.monthFields.forEach((month, index) => {
      if (index < remainder) {
        this.budgetItem[month] = monthlyAmount + 1;
      } else {
        this.budgetItem[month] = monthlyAmount;
      }
    });
  }

  /** ✅ เคลียร์ค่าทุกเดือน */
  clearAllMonths() {
    this.monthFields.forEach(month => {
      this.budgetItem[month] = 0;
    });
  }

  /** ✅ เมื่อเลือกการกระจายงบประมาณ */
  onDistributionMethodChange() {
    if (this.budgetItem.distributionMethod === 'equal') {
      this.distributeEqually();
    } else {
      // ถ้าเลือก custom ให้เคลียร์ค่าทุกเดือน
      this.clearAllMonths();
    }
  }

  /** ✅ อัปเดตค่า Budget Item จาก API หรือ ModalService */
  patchData(data: any) {
    this.budgetItem = {
      id: data.id || 0,
      budgetId: data.budgetId || null,
      accountCodeId: data.accountCodeId || null,
      description: data.description || '',
      totalAmount: data.totalAmount || 0,
      startMonth: data.startMonth || 1,
      distributionMethod: data.distributionMethod || '',
      month1: data.month1 || 0,
      month2: data.month2 || 0,
      month3: data.month3 || 0,
      month4: data.month4 || 0,
      month5: data.month5 || 0,
      month6: data.month6 || 0,
      month7: data.month7 || 0,
      month8: data.month8 || 0,
      month9: data.month9 || 0,
      month10: data.month10 || 0,
      month11: data.month11 || 0,
      month12: data.month12 || 0
    };
    
    // ตรวจสอบ Account Code เพื่อกำหนด isExpenseAccount
    if (this.budgetItem.accountCodeId) {
      setTimeout(() => {
        this.onAccountCodeChange();
      }, 100);
    }
    
    console.log(this.budgetItem);
  }

  validateField(field: string): boolean {
    return !this.budgetItem[field] || (typeof this.budgetItem[field] === 'number' && this.budgetItem[field] <= 0);
  }
 
  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.errors = [];
  
      if (this.validateField('accountCodeId')) this.errors.push("Please select a budget account.");
      if (this.validateField('description')) this.errors.push("Please enter a description.");
      if (this.validateField('totalAmount')) this.errors.push("Total amount must be greater than zero.");
      if (this.validateField('distributionMethod')) this.errors.push("Please select a distribution method.");
  
      if (this.errors.length > 0) {
        reject(this.errors); // ✅ Reject the promise with validation errors
        return;
      }
  
      this.httpService.post('/budgetrequest/item/post', this.budgetItem).subscribe({
        next: (response: any) => {
          this.alertService.success('Budget item created successfully');
          resolve(response); // ✅ Resolve the promise with response data
        },
        error: (error) => {
          this.alertService.error(error.error.message, 'Error!');
          reject(error.error.message); // ✅ Reject promise with error message
        }
      });
    });
  }
}