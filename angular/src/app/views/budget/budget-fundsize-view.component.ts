import { Component, OnInit, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BudgetFundSizeItemComponent } from './budget-fundsize-item.component';
import { NgTreeTable3Component, ColumnDefinition, NgTreeTable3Format, CellEditEvent } from 'src/app/components/forms/ng-tree-table3.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-budget-fundsize-view-component',
  template: `
 <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Fund Size Details  <div class="badge" [ngStyle]="{'background-color': obj.statusColor}">{{obj.statusName}}</div></h5>
          <div>
          
            <button class="btn btn-warning btn-sm me-2" type="button" *ngIf="obj.statusCode == '01'" (click)="onChangeStatus('02')">
              <i class="fas fa-check me-2"></i>Confirm
            </button>
            <button class="btn btn-danger btn-sm me-2" type="button" *ngIf="obj.statusCode == '02'" (click)="onChangeStatus('03')">
              <i class="fas fa-times me-2"></i>Cancel
            </button>
          
          </div>
        </div>
        <div class="card-body">
              
            <div class="row  g-3">
              <div class="col-6 mb-3 ">
                <label class="form-label text-muted small mb-1" >Document No.</label>
                <p class="mb-0">{{ obj.docNo }}</p>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label text-muted small mb-1">Document Date</label>
                <p class="mb-0">{{ obj.docDate }}</p>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label text-muted small mb-1">Fiscal Year</label>
                <p class="mb-0">{{ obj.fiscalYear }}</p>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label text-muted small mb-1">Value Date</label>
                <p class="mb-0">{{ obj.valueDate }}</p>
              </div>
            </div>
            <div class="mb-3">
              
                <div class="d-flex align-items-center justify-content-end" *ngIf="obj.statusCode == '01'" >
                <button type="button" class="btn btn-primary btn-sm me-2" (click)="onCalculationSummaryFee()">
                    <i class="fas fa-calculator me-2"></i>Calculation Summary Fee
                  </button>
                  <button type="button" class="btn btn-primary btn-sm me-2" (click)="onAddItem()">
                    <i class="fas fa-plus me-2"></i>Add Item
                  </button>
                  <!--<button class="btn btn-success btn-sm" (click)="exportExcel()">
                    <i class="fas fa-file-excel me-2"></i>Export Excel
                  </button>    -->
                </div>
            </div>
            
            <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Addition Fund</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Summary Fee</button>
            </li>
            
          </ul>
          <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
            <div class="table-responsive mt-3" [style.width.px]="screenWidth">
                    <ng-tree-table3 
                          #treeTable
                          [data]="fundAdditionData" 
                          [columns]="columns" 
                          [trackBy]="trackByItem"
                          [allowSummary]="true"
                          [showFilter]="false"
                          [allowCellEdit]="true"
                          [showGroupingControls]="true"
                          (cellValueChanged)="onCellValueChanged($event)"
                          (filterChanged)="onFilterChanged($event)"
                          (groupingChanged)="onGroupingChanged($event)">
                            <ng-template #action let-node let-column="column" >
                                <div class="gap-2" *ngIf="!node.isGroupRow" style="width: 100px">
                                  <button class="btn btn-sm btn-outline-primary mr-2" 
                                        type="button"
                                        (click)="editItem(node)"
                                        [title]="'Edit ' + node.code">
                                            <i class="fas fa-edit"></i>
                                  </button>
                                  <button class="btn btn-sm btn-outline-danger"  *ngIf="obj.statusCode == '01'"
                                        type="button"
                                          (click)="deleteItem(node)"
                                          [title]="'Delete ' + node.code">
                                    <i class="fas fa-trash"></i>
                                  </button>
                                </div>
                              </ng-template>
                              
                              <ng-template #summary let-node let-column="column" let-summary="summary">
                                  <div class="summary-display">
                                    <strong class="text-primary">{{ summary | number:'1.2-2' }}</strong>
                                    <small class="d-block text-muted">{{ getSummaryType(column) }}</small>
                                  </div>
                                </ng-template>
                    </ng-tree-table3>
                </div>
            </div>
            <div class="tab-pane fade "  id="profile" role="tabpanel" aria-labelledby="profile-tab">
              <div class="table-responsive mt-3" [style.width.px]="screenWidth">
                    <ng-tree-table3 
                      #treeTable2
                          [data]="fundData" 
                          [columns]="columns2" 
                          [trackBy]="trackByItem"
                          [allowSummary]="true"
                          [showFilter]="false"
                          [showGroupingControls]="true"
                          (groupingChanged)="onGroupingChanged($event)">
                              <ng-template #summary let-node let-column="column" let-summary="summary">
                                  <div class="summary-display">
                                    <strong class="text-primary">{{ summary | number:'1.2-2' }}</strong>
                                    <small class="d-block text-muted">{{ getSummaryType(column) }}</small>
                                  </div>
                                </ng-template>
                    </ng-tree-table3>
                </div>
            </div>
          </div>
          
      </div>
        
          <div class="card-footer">
            <div  class="d-flex justify-content-end ">
                <button type="submit" class="btn btn-primary"  >
                  Submit
                </button>
                <button type="button" class="btn btn-secondary ms-2" (click)="onBack()">
                  Back
                </button>
            </div>
          </div>
      </div>
  </div>
  </div>
</form>
  `,
  styles: [`
    .tree-table td {
      font-size: 12px;
    }
    .tree-table th {
      font-size: 12px;
    }
  `]
})
export class BudgetFundSizeViewComponent implements OnInit {
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild('treeTable') treeTableComponent!: NgTreeTable3Component;
  @ViewChild('treeTable2') treeTableComponent2!: NgTreeTable3Component;

  screenWidth: number = 0;
  myForm: FormGroup = new FormGroup({});
  obj: any = { items: [] };
  fundData: any[] = [];
  fundAdditionData: any[] = [];
  fundChanges: any[] = [];
  columns: ColumnDefinition[] = [];
  columns2: ColumnDefinition[] = [];
  changedItems: any[] = [];
  data: any[] = [];
  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
    this.initializeColumns();
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getRow(id);
    }
    this.getData();
    this.updateScreenWidth();
    window.addEventListener('resize', this.updateScreenWidth.bind(this));
  }
  updateScreenWidth() {
    this.screenWidth = window.innerWidth-300;
  }
   // ===== แก้ไข onCellValueChanged method =====
 // ===== แก้ไข onCellValueChanged แบบง่าย ไม่ sum month fields =====
  // ===== Updated onCellValueChanged Method =====
  onCellValueChanged(event: CellEditEvent) {
    
  
  }
  onCalculationSummaryFee () {
    this.httpService.get("/forecastfundsize/calculationSummaryFee/" + this.obj.id)
    .subscribe({
      next: (response: any) => {
        this.alertService.success("Update completed.", 'Success.');
        this.getRow(this.obj.id);
        //this.router.navigate(['/budget/fundsize/view/'+this.obj.id]);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
 
  onSubmit() {
    this.fundChanges = this.treeTableComponent.getChangedLeafNodes();
    //console.log(this.fundChanges)
    //return;
    this.httpService.post("/forecastfundsize/update", this.fundChanges)
    .subscribe({    
      next: (response: any) => {
        this.alertService.success("Update completed.", 'Success.');
        this.getRow(this.obj.id);
        //this.router.navigate(['/budget/fundsize/view/'+this.obj.id]);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
 
  getData() {
    this.httpService.get("/forecastfundsize/getdata"  )
    .subscribe({    
      next: (response: any) => {
        this.data = response;
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  initializeColumns() {
    this.columns = [
   
      {
        key:"fundTypeName",
        header:"Fund Type",
        width:'140px',
        isGroup:true
      },
     
      {
        key:"fundCode",
        header:"Fund Code",
        width:'140px',

      },
      {
        key:"totalNav",
        header:"Total NAV",
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month1',
        header:'Jan',
        width:'140px',
        format:NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        editable: true,
        class:'text-end'
      },
      {
        key:'month2',
        header:'Feb',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        editable: true,
        class:'text-end'
      },
      {
        key:'month3',
        header:'Mar',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month4',
        header:'Apr',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month5',
        header:'May',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month6',
        header:'Jun',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        editable: true,
        class:'text-end'
      },
      {
        key:'month7',
        header:'Jul',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        editable: true,
        class:'text-end'
      },
      {
        key:'month8',
        header:'Aug',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month9',
        header:'Sep',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month10',
        header:'Oct',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month11',
        header:'Nov',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        editable: true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month12',
        header:'Dec',
        width:'140px',
        editable: true,
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key: 'totalAmount',
        header: 'Total',
        width: '140px',
        format: NgTreeTable3Format.number,
        showSummary: true,
        isGrandTotal: true, // ระบุว่าเป็น Total column
        summaryType: 'sum',
        editable: false,
        class: 'text-end'
      },
      {
        key:'action',
        header:'Action',
        template: 'action',
        width:'200px',
        class:'text-center'
      }
    ];
    this.columns2 = [
      {
        key:"fundFeeTypeName",
        header:"Fund Fee Type",
        width:'140px',
        isGroup:true
      },
      {
        key:"fundTypeName",
        header:"Fund Type",
        width:'140px',
        isGroup:true
      },
      {
        key:"fundCode",
        header:"Fund Code",
        width:'140px',

      },
      {
        key:"feeRate",
        header:"FeeRate",
        width:'140px',
        format: NgTreeTable3Format.number,
        class:'text-center'
      },
      {
        key:'month1',
        header:'Jan',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month2',
        header:'Feb',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month3',
        header:'Mar',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month4',
        header:'Apr',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month5',
        header:'May',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month6',
        header:'Jun',
        width:'140px',
        format: NgTreeTable3Format.number,    
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month7',
        header:'Jul',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month8',
        header:'Aug',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month9',
        header:'Sep',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month10',
        header:'Oct',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month11',
        header:'Nov',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key:'month12',
        header:'Dec',
        width:'140px',
        format: NgTreeTable3Format.number,
        showSummary:true,
        summaryType:'sum',
        class:'text-end'
      },
      {
        key: 'totalAmount',
        header: 'Total',
        width: '140px',
        format: NgTreeTable3Format.number,
        showSummary: true,
        summaryType: 'sum',
        class: 'text-end'
      },
      
    ];
  }

  getRow(id: number) {
    this.httpService.get("/forecastfundsize/get/" + id).subscribe({
      next: (response: any) => {
        this.obj = response.forecastFundSize;
        this.fundData = response.forecastFundSizeItems;
        this.fundAdditionData = response.forecastFundSizeAdditionItems;
        //console.log(this.fundData)
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  // Event handlers
  trackByItem = (index: number, item: any): any => {
    return item.id;
  };
 
  onFilterChanged(filterText: string) {
    console.log('Filter changed:', filterText);
  }

  onGroupingChanged(groupFields: string[]) {
    console.log('Grouping changed:', groupFields);
  }


  async deleteItem(node: any) {
    if (!node.isGroupRow && node.originalData) {
      const result = await this.alertService.confirm({
        title: 'Delete Fund Item',
        message: `Are you sure you want to delete fund ${node.code}?`,
      });
      
      if (result) {
        this.httpService.get("/forecastfundsize/item/delete/" + node.originalData.id)
          .subscribe({
            next: (response) => {
              this.getRow(this.obj.id);
              this.alertService.success("Delete completed.", 'Success.');
            },
            error: (error) => {
              this.alertService.error(error.message, 'Error!');
            }
          });
      }
    }
  }

  viewGroupSummary(node: any) {
    //console.log('View group summary:', node);
    this.alertService.info(`Group: ${node.description}\nItems: ${node.children?.length || 0}`, 'Group Summary');
  }

  exportGroup(node: any) {
    console.log('Export group:', node);
  }
 
  editItem(node: any) {
    if (!node.isGroupRow && node.originalData) {
      console.log(node)
      this.modalService.show({
        component: BudgetFundSizeItemComponent,
        title: 'Edit Fund Item',
        size: 'lg',
        data: { 
          data: this.data,
          obj: node.originalData, 
          isEdit: true 
        }
      }).then(result => {
        if (result) {
          this.getRow(this.obj.id);
        }
      });
    }
  }
  onAddItem() {
    this.modalService.show({
      component: BudgetFundSizeItemComponent,
      title: 'Add Fund Item',
      size: 'lg',
      data: { 
        data: this.data,
        obj: { forecastFundSizeId: this.obj.id },
        isEdit: false
      }
    }).then(result => {
      if (result) {
        this.getRow(this.obj.id);
      }
    });
  }

  exportExcel() {
    this.httpService.download("/forecastfundsize/export-excel/" + this.obj.id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fundsize_${this.obj.id}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success("Export completed.", 'Success.');
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  getSummaryType(column: ColumnDefinition): string {
    switch (column.summaryType) {
      case 'sum': return 'Total';
      case 'avg': return 'Average';
      case 'count': return 'Count';
      default: return 'Summary';
    }
  }
  async onChangeStatus(status: string) {
   var result= await this.alertService.confirm({
      title: 'Confirm Change Status',
      message: 'Are you sure you want to change status?',
    });
    if(result.isConfirmed){
      this.httpService.get("/forecastfundsize/change-status/" + this.obj.id + "/" + status)
      .subscribe({
        next: (response) => {
          this.getRow(this.obj.id);
          this.alertService.success("Change status completed.", 'Success.');
        },
        error: (error) => {
          this.alertService.error(error.error.message, 'Error!');
        }
      });
    }
  }
  onBack(): void {
    this.router.navigate(['/budget/fundsize/list']);
  }
}

