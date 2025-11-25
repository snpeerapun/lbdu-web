import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';
import { FormBuilder, Validators } from '@angular/forms';

interface accountCode {
  id: any;
  nameThai: string;
  nameEng: any;
  accountCode: string ;
}

@Component({
  selector: 'app-balance-sheet-item',
  template: `
<!-- Errors -->
 <form [formGroup]="myForm"  >
  <div class="row">
    <div class="col-md-6">
      <!-- Parent -->
      <div class="form-group">
        <label class="form-label">Parent</label>

        <!--loop level intent string-->
        <select  formControlName="parentId" class="form-control form-select" (change)="onParentChange()">
          <option value="">-- Select Parent --</option>
          <option *ngFor="let option of parentOptions" 
                  [ngValue]="option.id" 
                  [disabled]="option.id === item.id">
            {{option.indent}}{{option.itemName}}
          </option>
        </select>
      </div>

      <!-- ItemCode -->
      <div class="form-group">
        <label class="form-label">Code</label>
        <input type="text" class="form-control" formControlName="itemCode" > 
        <div class="invalid-feedback" *ngIf="myForm.get('itemCode').hasError('required')">
          Please enter a code
        </div>
      </div>

      <!-- ItemName -->
      <div class="form-group">
        <label class="form-label">Name</label>
        <input type="text" class="form-control" formControlName="itemName" >
        <div class="invalid-feedback" *ngIf="myForm.get('itemName').hasError('required')">
          Please enter a name
        </div>
      </div>

      <!-- ItemType -->
      <div class="form-group">
        <label class="form-label">Type</label>
        <input type="text" class="form-control"  formControlName="itemType"  placeholder="e.g. ASSET / LIABILITY / EQUITY">
        <div class="invalid-feedback" *ngIf="myForm.get('itemType').hasError('required')">
          Please enter a type
        </div>
      </div>
    
    

      
  
    </div>

    <div class="col-md-6">
      <!-- Calculation -->
      <div class="row">
        <div class="form-group col-6">
          <label class="form-label">Sort Order</label>
          <input type="number" class="form-control"  formControlName="sortOrder" >
          <div class="invalid-feedback" *ngIf="myForm.get('sortOrder').hasError('required')">
            Please enter a sort order
          </div>
        </div>
        <div class="form-group col-6">
          <label class="form-label">Level</label>
          <input type="number" class="form-control"  formControlName="level" >
          <div class="invalid-feedback" *ngIf="myForm.get('level').hasError('required')">
            Please enter a level
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Calculation Method</label>
        <select class="form-select"  formControlName="calculationMethod" (change)="onCalculationMethodChange()"  >
          <option value="">None</option>
          <option value="FORMULA">FORMULA</option>
          <option value="SUBTRACT">SUBTRACT</option>
          <option value="SUM">SUM</option>
        </select>
        <div class="invalid-feedback" *ngIf="myForm.get('calculationMethod').hasError('required')">
          Please select a calculation method
        </div>
      </div>

      <!-- Formula -->
      <div class="form-group">
        <label class="form-label">Formula</label>
        <input type="text"
              class="form-control"
              formControlName="formula"
              [readonly]="isFormulaReadonly">
        <small class="text-muted">เช่น <code>[1001] + [1002] - [2001]</code></small>
        <div class="invalid-feedback" *ngIf="myForm.get('formula').hasError('required')">
          Please enter a formula
        </div>
      </div>
      <div class="form-group  form-check">
          <input id="showInReport" type="checkbox" class="form-check-input"  formControlName="showInReport">
          <label for="showInReport" class="form-check-label">Show In Report</label>
        </div>

        <div class="form-group col-6">
        
          <input id="isActive" type="checkbox" class="form-check-input"  formControlName="isActive">
          <label for="isActive" class="form-check-label ">Is Active</label>
        </div>
      
    </div>
    <div class="row">
      <div class="col-md-12">
      <div class="form-group mb-3">
          <label class="form-label">Account Code</label>
          <ng-multi-select  
            formControlName="selectedItems"
            [availableItems]="availableItems"
            [availableLabel]="'nameThai'"
            [selectedLabel]="'nameThai'"
            [availableValue]="'accountcode'"
            [selectedValue]="'accountcode'">
          </ng-multi-select>
          
        </div>
      </div>
    </div>
  </div>
</form>
`
})
export class BalanceSheetItemComponent implements OnInit {
 
  availableItems: any[] = [];
  selectedItems: any[] = [];
  _selectedItems: any[] = [];
  accountCodes:any[] = [];
  item = {} as any;
  data!: any; // รับค่าที่ถูกส่งมาจาก ModalService
  errors: string[] = [];

  // สำหรับ dropdown parent (tree)
  parentOptions:any[] = [];
  myForm: any;
 
  get isFormulaReadonly(): boolean {
    return !!this.item.isGroup || this.item.calculationMethod !== 'FORMULA';
  }

  constructor(private httpService: HttpService, private alertService: AlertService, private fb: FormBuilder) {
    this.initForm();
  }
  private initForm() {
    this.myForm = this.fb.group({
      //selectedItems: [[], [Validators.required]],
      itemCode: ['', [Validators.required]],
      parentId: ['',  []],
      itemName: ['', [Validators.required]],
      itemType: ['', [Validators.required]],
      sortOrder: ['', [Validators.required]],
      level: ['', [Validators.required]],
      calculationMethod: ['', [Validators.required]],
      formula: ['', []],
      showInReport: [false],
      isActive: [false],
    });
  }
  patchForm(){
    this.myForm.patchValue({
      parentId: this.item.parentId,
      isGroup: this.item.isGroup, 
      itemCode: this.item.itemCode,
      itemName: this.item.itemName,
      itemType: this.item.itemType,
      sortOrder: this.item.sortOrder,
      level: this.item.level,
      calculationMethod: this.item.calculationMethod,
      formula: this.item.formula,
      showInReport: this.item.showInReport,
      isActive: this.item.isActive,
    });
  }
  ngOnInit() {
    this.item = this.data.item;
    this.data = this.data.data;
    this.getAccount(this.item.id);
    //map to data account code and without this.accountCodes.accountCode
    // selectedIds keep array of account code.
 
   
    const items = this.data.items ?? [];
    // Filter templateId ก่อนเข้า buildHierarchy
    const filteredItems = items.filter((item: { templateId: any; }) => item.templateId === this.item.templateId);
    this.parentOptions = this.buildHierarchy(filteredItems);
    this.patchForm();
  
  }
  getAccount(id:any){
    this.httpService.get(`/balancesheettemplate/account/get/${id}`).subscribe({
      next: (response: any) => {
        this._selectedItems=response;
        const selectedIds =  this._selectedItems
        ? this._selectedItems.map((item: any) => item.accountCode)
        : [];
        const all = Array.isArray(this.data?.accountCodes) ? this.data.accountCodes : [];
        const ids = Array.isArray(selectedIds) ? selectedIds : [];

        this.availableItems = all.filter((x: any) => x && !ids.includes(x.code));
        this.selectedItems  = all.filter((x: any) => x &&  ids.includes(x.code));

        //console.log('l:1',this.data?.accountCodes.length)
        //console.log('l:2',this.availableItems.length)
        this.myForm.controls['selectedItems'].setValue(this.selectedItems); // Update FormControl
        this.myForm.controls['selectedItems'].markAsTouched();
        this.myForm.controls['selectedItems'].updateValueAndValidity();  
        
      },
      error: (error) => {
         console.log(error)
      }
    });
  }
  buildHierarchy(items: any[], parentId: any = null, level: number = 0, isLast: boolean = true): any[] {
    const children = items
      .filter(item => item.parentId === parentId) // เอา filter templateId ออก
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return children.reduce((result, item, index) => {
      const isLastChild = index === children.length - 1;
      let prefix = '';
      
      if (level > 0) {
        prefix = '　'.repeat((level - 1) * 2) + (isLastChild ? '└─ ' : '├─ ');
      }
      
      // เพิ่ม item ปัจจุบัน
      result.push({
        ...item,
        level: level,
        indent: prefix
      });
      
      // เพิ่ม children
      result.push(...this.buildHierarchy(items, item.id, level + 1, isLastChild));
      
      return result;
    }, []);
  }
 

  /** === Handlers === */
  onParentChange() {
    const p = this.parentOptions.find(x => x.id === this.item.parentId);
    if (p && p.id != null) {
      this.item.level = (p.level ?? 0) + 1;
      if (this.item.indentLevel == null) this.item.indentLevel = this.item.level;
    } else {
      this.item.level = this.item.level ?? 0;
    }
  }

  onIsGroupChange() {
    if (this.item.isGroup) {
      this.item.calculationMethod = 'sumChildren';
      this.item.formula = '';
    }
  }

  onCalculationMethodChange() {
    if (this.item.calculationMethod !== 'FORMULA') {
      this.item.formula = '';
    }
  }

 
  /** === Submit === */
  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
   

     if(this.myForm.valid){
      const payload = this.myForm.value;
      payload.BalanceSheetTemplateAccounts = this.selectedItems.map((x: any) => {
        return {
          itemId: this.item.id,
          accountCode: x.code,
          isActive: true
        }
      });
      console.log(payload);
      
      this.httpService.post('/balancesheettemplate/item/post', payload).subscribe({
        next: (response: any) => { 
          this.alertService.success('Balance sheet item saved.'); 
          resolve(response); 
        },
        error: (err) => { 
          this.alertService.error(err.error.message, 'Error!');
          reject(err.error.message); // ✅ Reject promise with error message
        }
      });
      
     }  
    });
  }
}
