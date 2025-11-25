import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-budget-fundsize-item',
  template: `
   <!-- Budget Account -->
  <div *ngIf="errors.length > 0" class="alert alert-danger">
  <ul>
    <li *ngFor="let error of errors">{{ error }}</li>
  </ul>
</div>
<ul class="nav nav-tabs" id="myTab" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="general-tab" data-bs-toggle="tab" data-bs-target="#general" type="button" role="tab" aria-controls="general" aria-selected="true">General</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="fee-tab" data-bs-toggle="tab" data-bs-target="#fee" type="button" role="tab" aria-controls="fee" aria-selected="false">Fee</button>
  </li>
  
</ul>
<div class="tab-content" id="myTabContent">
  <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
  <div class="row">
   <div class="col-md-6">
   <div class="form-group">
      <label class="form-label">FundCode</label>
      <input type="text"   class="form-control" [(ngModel)]="item.fundCode"  #fundCode="ngModel" >
    </div>
    <div class="form-group">
      <label class="form-label">Fee Type</label>
      <ng-select  [(ngModel)]="item.feeTypeId"  #feeTypeId="ngModel" [options]="data.feetypes" [placeholder]="'Select Fee Type'" >
      </ng-select>
      
    </div>
    <div class="form-group">
      <label class="form-label">Fund Type</label>
      <ng-select  [(ngModel)]="item.fundTypeId"  #fundTypeId="ngModel" [options]="data.fundtypes" [placeholder]="'Select Fund Type'" >
      </ng-select>
      
    </div>
    <!-- Total Amount -->
    <div class="form-group">
      <label class="form-label">Total Nav</label>
      <input type="text"  readonly class="form-control bg-light" [(ngModel)]="item.totalNav" #totalNav="ngModel"   >
      
    </div>
    <!-- Total Amount -->
    <div class="form-group">
      <label class="form-label">Total Amount</label>
      <input type="text"    class="form-control " [(ngModel)]="item.totalAmount" #totalAmount="ngModel"   >
      
    </div>
   </div>
   
  </div>
  </div>
  <div class="tab-pane fade mt-2" id="fee" role="tabpanel" aria-labelledby="fee-tab">
      <div class="row">
          <div class="col-md-6">
          <div class="form-group">
              <label class="form-label">CommissionFee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.commissionFee"  #commissionFee="ngModel" >
            </div>
            <div class="form-group">
              <label class="form-label">FrontEndFee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.frontEndFee"  #frontEndFee="ngModel" >
            </div>
            <div class="form-group">
              <label class="form-label">FrontEnd Fee Pay</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.frontEndFeePay"  #frontEndFeePay="ngModel" >
            </div>
          </div>
          <div class="col-md-6">
          
            <div class="form-group">
              <label class="form-label">Management Fee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.managementFee"  #managementFee="ngModel" >
            </div>
            <div class="form-group">
              <label class="form-label">Registrar Fee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.registrarFee"  #registrarFee="ngModel" >
            </div>
            <div class="form-group">
              <label class="form-label">Trailing Fee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.trailingFee"  #trailingFee="ngModel" >
            </div>
            <div class="form-group">
              <label class="form-label">TSD Fee</label>
              <input type="text"  numberFormat  class="form-control" [(ngModel)]="item.tsdFee"  #tsdFee="ngModel" >
            </div>
            
          </div>
      
  </div>
  
</div>
  
</div>

`
})

export class BudgetFundSizeItemComponent implements OnInit {
  item = {} as any;
  data!: any; // รับค่าที่ถูกส่งมาจาก ModalService
  budgetAccounts: any[] = [];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  errors: string[] = [];

  constructor(private httpService: HttpService, private alertService: AlertService) { }

  ngOnInit() {
   
    this.item = this.data.obj;
    this.data = this.data.data;
    //console.log(this.item)
    // Initialize monthly values if not exists
    for (let i = 1; i <= 12; i++) {
      if (!this.item['month' + i]) {
        this.item['month' + i] = 0;
      }
    }
    
    // Calculate initial total
    //this.onMonthlyAmountChange(this.item);
  }
  
  selectTab(tabId: string) {
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.classList.add('active');
    }
  }

  /** ✅ อัปเดตค่าหลังจากกด input */
  onMonthlyAmountChange(item: any) {
    let total = 0;
    for (let i = 1; i <= 12; i++) {
      const value = item['month' + i];
      const numValue = parseFloat(value) || 0;
      total += numValue;
    }
    item.totalAmount =parseFloat(item.totalNav)+ total;
  }

  validateField(field: string): boolean {
    return !this.item[field] || (typeof this.item[field] === 'number' && this.item[field] <= 0);
  }

  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.errors = [];

      if (this.validateField('fundCode')) this.errors.push("Please enter fundcode.");
      if (this.validateField('feeTypeId')) this.errors.push("Please enter fee type.");
      if (this.validateField('fundTypeId')) this.errors.push("Please enter fund type.");
      if (this.validateField('totalAmount')) this.errors.push("Total amount must be greater than zero.");

      if (this.errors.length > 0) {
        reject(this.errors); // ✅ Reject the promise with validation errors
        return;
      }

      this.httpService.post('/forecastfundsize/item', this.item).subscribe({
        next: (response: any) => {
          this.alertService.success('item save successfully');
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