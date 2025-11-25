import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ModalService } from 'src/app/shared/services/modal.service';
import { BudgetTemplateItemComponent } from './budget-template-item.component';
 

@Component({
  selector: 'app-budget-template-form',
  template: `
    <div class="container-fluid"> 
      <form #myForm="ngForm" (ngSubmit)="onSubmit()" novalidate>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Budget Template</h5>
         
          <div class="row mt-3">
            <div class="col-sm-6">
              <label class="form-label text-muted small mb-1">Name</label>
              <input type="text" class="form-control" [(ngModel)]="obj.name" name="name" required #name="ngModel">
              <div *ngIf="name.invalid && name.touched" class="text-danger">
                Name is required.
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-sm-6">
              <label class="form-label text-muted small mb-1">Description</label>
              <textarea class="form-control" [(ngModel)]="obj.description" name="description"></textarea>
            </div>
          </div>

          <!-- Table for Budget Items -->
          <div class="row mt-3">
            <div class="col-md-12">
              <h6>Budget Items</h6>
              <div class="mb-2">
                <span class="me-2">Filter:</span>
                <button 
                  class="btn btn-sm" type="button"
                  [ngClass]="{ 'btn-primary': filterStatus === 'active', 'btn-outline-primary': filterStatus !== 'active' }"
                  (click)="filterStatus = 'active'">
                  Active ({{ activeItemCount }})
                </button>
                <button 
                  class="btn btn-sm ms-2" type="button"
                  [ngClass]="{ 'btn-danger': filterStatus === 'inactive', 'btn-outline-danger': filterStatus !== 'inactive' }"
                  (click)="filterStatus = 'inactive'">
                  Inactive ({{ inactiveItemCount }})
                </button>
              </div>
             <div class="mb-2">
               <div class="col-md-6">
                <input
                type="text"
                class="form-control mt-2"
                placeholder="Search items..."
                [(ngModel)]="searchTerm"
                (keydown.enter)="onEnterKey($event)"
                (keyup)="onSearchKeyUp($event)">
               </div>
              </div>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead class="bg-light">
                    <tr>
                      <th></th>
                      <th class="text-center">AccountCode</th>
                      <th class="text-center">AccountName</th>
                      <th class="text-center">Description</th>
                      <th class="text-end">Total</th>
                      <th style="width:120px">#</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of filteredBudgetItems; let i = index">
                      <td>
                        <label class="switch">
                          <input name="isActive{{ i }}" [(ngModel)]="item.isActive" type="checkbox" (ngModelChange)="onToggleActive(item)">
                          <span class="slider round"></span>
                        </label>
                      </td>
                      <td class="fw-medium">
                        <span class="text-muted">{{ item.accountCode.code }}</span>
                      </td>
                      <td class="text-left">
                        <span class="text-muted">{{ item.accountCode.nameThai }}</span>
                      </td>
                      <td class="text-left">
                        {{ item.description }}
                      </td>
                      <td class="text-end fw-bold">
                        {{ formatCurrency(item.defaultAmount) }}
                      </td>
                      <td>
                        <button class="btn btn-sm btn-danger mr-2" type="button" (click)="onDeleteItem(item)">
                          <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" type="button" (click)="onEditItem(item)">
                          <i class="fas fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="filteredBudgetItems.length === 0">
                      <td colspan="6">No Data</td>
                    </tr>
                  </tbody>
                  <tfoot *ngIf="filteredBudgetItems.length > 0">
                    <tr class="bg-light">
                      <td colspan="4" class="fw-bold">Total</td>
                      <td class="text-end fw-bold">
                        {{ filteredBudgetItems | sum: 'defaultAmount' }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <button type="button" class="btn btn-success btn-sm mt-3 mr-2 mb-3" (click)="onAddItem()">
                <i class="fas fa-edit me-2"></i>Add Items
              </button>
            </div>
          </div>

          <!-- Submit and Cancel Buttons -->
          <div class="card-footer">
            <div class="d-flex justify-content-end">
              <button class="btn btn-secondary me-2" type="button" (click)="onCancel()">
                <i class="fas fa-arrow-left me-2"></i>Cancel
              </button>
              <button class="btn btn-primary me-2" type="submit" [disabled]="myForm.invalid">
                <i class="fas fa-edit me-2"></i>Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      </form>
    </div>
  `
})
export class BudgetTemplateFormComponent implements OnInit {
  myForm: FormGroup = new FormGroup({});
  isEditMode = false;
  types: any[] = [];
  obj: any = {};
  filterStatus: 'active' | 'inactive' = 'active';
  budgetAccounts: any[] = [];
  departments: any[] = [];
  data: any = {
    divisions: [],
    departments: [],
    budgetAccounts: []
  };
  searchTerm: string = ''; //
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private router: Router
  ) {
    //this.initForm();
  }

  ngOnInit() {
  
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }
    this.loadData();
  }

 
  get activeItemCount(): number {
    return this.obj.budgetTemplateItems.filter((item: any) => item.isActive).length;
  }

  // Getter to calculate the number of inactive items
  get inactiveItemCount(): number {
    return this.obj.budgetTemplateItems.filter((item: any) => !item.isActive).length;
  }

  get filteredBudgetItems() {
    return this.obj.budgetTemplateItems.filter((item: any) => {
      const matchesStatus = this.filterStatus === 'active' ? item.isActive : !item.isActive;
      const matchesSearch = this.searchTerm
        ? item.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }
  onSearchKeyUp(event: any) {
    this.searchTerm = event.target.value.trim().toLowerCase();  
  }
  onEnterKey(event: any) {
    event.preventDefault();
 
  }
  onToggleActive(item: any) {
    // Toggle the isActive property
    item.isActive = !item.isActive;
    this.obj.budgetTemplateItems = [...this.obj.budgetTemplateItems];

    var obj= item;
    obj.isActive = item.isActive?0:1;
  

    // Call API to update status
    this.httpService.post('/budgettemplate/item/update', obj).subscribe({
      next: () => {
        
      },
      error: (error) => {
        this.alertService.error("Failed to update item status.");
        console.error("Error updating item status:", error);
      }
    });
  }
  
  private initForm() {
    this.myForm = this.fb.group({
       name: [null, []],
       description: [null, []],
    });
  }

  formatCurrency(value: number): string {
    if (value)
      return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
    return '';
    //return value;
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
  
  getRow(userId: number) {
    this.httpService.get("/budgettemplate/get/"+userId).subscribe({
      next: (response: any) => {
        this.obj = response;
        console.log(this.obj)
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  loadData() {
    this.httpService.get('/budgettemplate/getdata').subscribe({
      next: (response: any) => {
        this.data = response;
        this.data.accountCodes = Object.values(this.data.accountCodes).map((item: any) => ({
          id: item.id,
          name: `${item.code} - ${item.nameThai}`,
          code: item.code
        })).sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (error) => {
        //this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }
  
  onSubmit() {
    if (!this.obj.name) {
      this.alertService.error('Please enter a name.');
      return;
    }
  
    this.httpService.post("/budgettemplate/post", this.obj).subscribe({
      next: (response) => {
        this.alertService.success(`Template successfully ${this.isEditMode ? 'updated' : 'created'}`);
        this.onCancel();
      },
      error: (error) => {
        this.alertService.error('Failed to save template');
        console.error('Error saving template:', error);
      }
    });
  }
  
  onAddItem() {
    console.log('id:',this.obj.id )
    this.modalService.show({
      component: BudgetTemplateItemComponent,
      title: 'Add Budget Item',
      size: 'lg',
      data: { obj:{templateId: this.obj.id },data: this.data }
    }).then(result => {
      if (result) {
        this.getRow(this.obj.id);
      }
    });

  }
  
  /** ✅ โหลด Budget Accounts */
   
  onEditItem(obj: any) {

    this.modalService.show({
      component: BudgetTemplateItemComponent,
      title: 'Add Budget Item',
      size: 'lg',
      data: {obj: obj, data: this.data}
    }).then(result => {
      console.log('result', result)
      if (result) {
        this.getRow(this.obj.id);
      }
    });
  }
  async onDeleteItem(arg0: any) {
    var result = await this.alertService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
    });
    
    if (result.isConfirmed) {
      this.httpService.get("/budget/item/delete/" + arg0)
        .subscribe(response => {
          this.getRow(this.obj.id);
          this.alertService.success("Delete completed.", 'Success.');
        },
        error => {
          this.alertService.error(error.message, 'Error!');
        });
    }
  }
  onCancel() {
    this.router.navigate(['/budget/template/list']);
  }
}
