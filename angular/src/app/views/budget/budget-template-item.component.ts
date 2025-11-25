 

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

 

@Component({
  selector: 'app-budget-template-item',
  template: `
   <!-- Budget Account -->
  <div *ngIf="errors.length > 0" class="alert alert-danger">
  <ul>
    <li *ngFor="let error of errors">{{ error }}</li>
  </ul>
</div>
   <div class="col-md-6">
    <div class="form-group">
      <label class="form-label">Budget Account</label>
      <ng-select  
      [(ngModel)]="budgetItem.accountCodeId"  
       #accountCodeId="ngModel" 
       [options]="data.data.accountCodes" 
       [searchFields]="['nameTh','nameEn','code']"
       [placeholder]="'Select Budget Account'" 
       >
      </ng-select>
      
    </div>

    <!-- Description -->
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" [(ngModel)]="budgetItem.description" #description="ngModel"   ></textarea>
     
    </div>

    <!-- Total Amount -->
    <div class="form-group">
      <label class="form-label">Default Amount</label>
      <input type="text" numberFormat class="form-control" [(ngModel)]="budgetItem.defaultAmount" #defaultAmount="ngModel"   >
      
    </div>

    <div class="form-group">
      <label class="form-label">Start Month</label>
      <select class="form-select" [(ngModel)]="budgetItem.startMonth">
        <option *ngFor="let month of months; let i = index" [value]="i + 1">
          {{ month }}
        </option>
      </select>
    </div>
    <div class="form-group">
       
      <label class="switch">
        <input name="isActive" [(ngModel)]="budgetItem.isActive" type="checkbox"  [checked]="budgetItem.isActive==1">
        <span class="slider round"></span>
      </label>
    </div>
  </div>
 
`
})
 
export class BudgetTemplateItemComponent implements OnInit {
  budgetItem = {} as any;
  data!:  {obj: any, data: any}; // รับค่าที่ถูกส่งมาจาก ModalService
  budgetAccounts: any[] = [];
  months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  errors: string[] = [];
 
  constructor(private httpService: HttpService, private alertService: AlertService) {}

  ngOnInit() {
    console.log(this.data)
    this.patchData(this.data.obj);
   
  }

 

  /** ✅ อัปเดตค่า Budget Item จาก API หรือ ModalService */
  patchData(data: any) {
    this.budgetItem = {
      id:data.id||0,
      templateId: data.templateId || null,
      accountCodeId: data.accountCodeId || null,
      description: data.description || '',
      defaultAmount: data.defaultAmount || 0,
      startMonth: data.startMonth || 1,
      isActive: data.isActive || 0,
    };
    console.log(this.budgetItem)
  }

  validateField(field: string): boolean {
    return !this.budgetItem[field] || (typeof this.budgetItem[field] === 'number' && this.budgetItem[field] <= 0);
  }
 
  
  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.errors = [];
  
      if (this.validateField('accountCodeId')) this.errors.push("Please select a budget account.");
      if (this.validateField('description')) this.errors.push("Please enter a description.");
      //if (this.validateField('defaultAmount')) this.errors.push("Default amount must be greater than zero.");
      //if (this.validateField('distributionMethod')) this.errors.push("Please select a distribution method.");
  
      if (this.errors.length > 0) {
        reject(this.errors); // ✅ Reject the promise with validation errors
        return;
      }
  
      this.budgetItem.isActive = this.budgetItem.isActive ? 1 : 0;
      this.httpService.post('/budgettemplate/item/post', this.budgetItem).subscribe({
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
 
 