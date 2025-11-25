import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fee-scheme-form',
  template: `
    <div class="container-fluid">
      <form #form="ngForm" (ngSubmit)="onSubmit(form)">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Fee Scheme</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-6">
                <!-- Scheme Code -->
                <div class="mb-3">
                  <label class="form-label">Scheme Code <span class="text-danger">*</span></label>
                  <input type="text" name="schemeCode" class="form-control"
                    [(ngModel)]="obj.schemeCode"
                    #schemeCode="ngModel" required
                    [class.is-invalid]="schemeCode.invalid && schemeCode.touched" />
                  <div class="invalid-feedback" *ngIf="schemeCode.invalid && schemeCode.touched">
                    Please enter scheme code
                  </div>
                </div>

                <!-- Scheme Name -->
                <div class="mb-3">
                  <label class="form-label">Scheme Name <span class="text-danger">*</span></label>
                  <input type="text" name="schemeName" class="form-control"
                    [(ngModel)]="obj.schemeName"
                    #schemeName="ngModel" required
                    [class.is-invalid]="schemeName.invalid && schemeName.touched" />
                  <div class="invalid-feedback" *ngIf="schemeName.invalid && schemeName.touched">
                    Please enter scheme name
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea name="description" class="form-control" rows="3"
                    [(ngModel)]="obj.description"></textarea>
                </div>

                <!-- Fee Type -->
                <div class="mb-3">
                  <label class="form-label">Fee Type <span class="text-danger">*</span></label>
                  <ng-select
                    [options]="feeTypeList"
                    valueProp="id"
                    labelProp="name"
                    name="feeType"
                    [(ngModel)]="obj.feeType"
                    #feeType="ngModel" required
                    [class.is-invalid]="feeType.invalid && feeType.touched"
                    placeholder="Select Fee Type">
                  </ng-select>
                  <div class="invalid-feedback" *ngIf="feeType.invalid && feeType.touched">
                    Please select fee type
                  </div>
                </div>

                <!-- Rate Method -->
                <div class="mb-3">
                  <label class="form-label">Rate Method <span class="text-danger">*</span></label>
                  <ng-select
                    [options]="rateMethodList"
                    valueProp="id"
                    labelProp="name"
                    name="rateMethod"
                    [(ngModel)]="obj.rateMethod"
                    #rateMethod="ngModel" required
                    [class.is-invalid]="rateMethod.invalid && rateMethod.touched"
                    placeholder="Select Rate Method">
                  </ng-select>
                  <div class="invalid-feedback" *ngIf="rateMethod.invalid && rateMethod.touched">
                    Please select rate method
                  </div>
                  <small class="text-muted">
                    <strong>Fixed:</strong> Single rate<br>
                    <strong>Step:</strong> Different rates by amount tiers<br>
                    <strong>Range:</strong> Rates by amount ranges
                  </small>
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <!-- Calculation Basis -->
                <div class="mb-3">
                  <label class="form-label">Calculation Basis <span class="text-danger">*</span></label>
                  <ng-select
                    [options]="calculationBasisList"
                    valueProp="id"
                    labelProp="name"
                    name="calculationBasis"
                    [(ngModel)]="obj.calculationBasis"
                    #calculationBasis="ngModel" required
                    [class.is-invalid]="calculationBasis.invalid && calculationBasis.touched"
                    placeholder="Select Calculation Basis">
                  </ng-select>
                  <div class="invalid-feedback" *ngIf="calculationBasis.invalid && calculationBasis.touched">
                    Please select calculation basis
                  </div>
                  <small class="text-muted">
                    <strong>On Volume:</strong> Calculate from transaction amount<br>
                    <strong>On Fee:</strong> Calculate from fee received<br>
                    <strong>On Outstanding:</strong> Calculate from portfolio balance
                  </small>
                </div>

                <!-- Effective From -->
                <div class="mb-3">
                  <label class="form-label">Effective From <span class="text-danger">*</span></label>
                  <input type="date" name="effectiveFrom" class="form-control"
                    [(ngModel)]="obj.effectiveFrom"
                    #effectiveFrom="ngModel" required
                    [class.is-invalid]="effectiveFrom.invalid && effectiveFrom.touched" />
                  <div class="invalid-feedback" *ngIf="effectiveFrom.invalid && effectiveFrom.touched">
                    Please enter effective from date
                  </div>
                </div>

                <!-- Effective To -->
                <div class="mb-3">
                  <label class="form-label">Effective To</label>
                  <input type="date" name="effectiveTo" class="form-control"
                    [(ngModel)]="obj.effectiveTo" />
                  <small class="text-muted">Leave empty for no expiry</small>
                </div>

                <!-- Active Status -->
                <div class="mb-3 form-check">
                  <input id="isActive" type="checkbox" class="form-check-input"
                    name="isActive" [(ngModel)]="obj.isActive">
                  <label for="isActive" class="form-check-label">Active</label>
                </div>
              </div>
            </div>

            <!-- Fee Rates Section -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Fee Rates Configuration</h6>
                    <button type="button" class="btn btn-sm btn-primary" (click)="addRate()">
                      <i class="fas fa-plus me-1"></i> Add Rate
                    </button>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-bordered table-sm">
                        <thead>
                          <tr>
                            <th width="20%">AMC</th>
                            <th width="20%">Fund</th>
                            <th width="15%">Min Amount</th>
                            <th width="15%">Max Amount</th>
                            <th width="12%">Rate (%)</th>
                            <th width="12%">Fixed Amount</th>
                            <th width="6%">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let rate of rates; let i = index">
                            <td>
                              <ng-select
                                [options]="amcList"
                                valueProp="id"
                                labelProp="name"
                                [(ngModel)]="rate.amcId"
                                [name]="'amcId_' + i"
                                placeholder="All AMCs">
                              </ng-select>
                            </td>
                            <td>
                              <ng-select
                                [options]="fundList"
                                valueProp="id"
                                labelProp="name"
                                [(ngModel)]="rate.fundId"
                                [name]="'fundId_' + i"
                                placeholder="All Funds">
                              </ng-select>
                            </td>
                            <td>
                              <input type="number" class="form-control form-control-sm"
                                [(ngModel)]="rate.minAmount"
                                [name]="'minAmount_' + i"
                                step="0.01" min="0" />
                            </td>
                            <td>
                              <input type="number" class="form-control form-control-sm"
                                [(ngModel)]="rate.maxAmount"
                                [name]="'maxAmount_' + i"
                                step="0.01" min="0" />
                            </td>
                            <td>
                              <input type="number" class="form-control form-control-sm"
                                [(ngModel)]="rate.ratePercentage"
                                [name]="'ratePercentage_' + i"
                                step="0.01" min="0" max="100" />
                            </td>
                            <td>
                              <input type="number" class="form-control form-control-sm"
                                [(ngModel)]="rate.fixedAmount"
                                [name]="'fixedAmount_' + i"
                                step="0.01" min="0" />
                            </td>
                            <td class="text-center">
                              <button type="button" class="btn btn-danger btn-sm" (click)="removeRate(i)">
                                <i class="fa fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                          <tr *ngIf="rates.length === 0">
                            <td colspan="7" class="text-center text-muted">
                              No rates configured. Click "Add Rate" to add rates.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="d-flex justify-content-end">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save me-1"></i> Submit
              </button>
              <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
                <i class="fas fa-times me-1"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class FeeSchemeFormComponent implements OnInit {
  isEditMode = false;

  obj: any = {
    schemeCode: '',
    schemeName: '',
    description: '',
    feeType: '',
    rateMethod: '',
    calculationBasis: '',
    effectiveFrom: null,
    effectiveTo: null,
    isActive: true
  };

  rates: any[] = [];

  // Dropdown lists
  feeTypeList = [
    { id: 'COMMISSION', name: 'Commission - ค่า Fee ที่คิดในช่วง IPO' },
    { id: 'FRONT_END', name: 'Front End - ค่า Fee ที่ได้สำหรับรายการซื้อ' },
    { id: 'BACK_END', name: 'Back End - ค่า Fee ที่ได้สำหรับรายการขาย' },
    { id: 'ONGOING', name: 'On Going (Trailing Fee) - ค่า Fee ที่ได้กรณีลูกค้า Balance ใน Port' },
    { id: 'SWITCH_IN', name: 'Switch In - ค่า Fee ที่ได้สำหรับรายการสับเปลี่ยนเข้า' },
    { id: 'SWITCH_OUT', name: 'Switch Out - ค่า Fee ที่ได้สำหรับรายการสับเปลี่ยนออก' }
  ];

  rateMethodList = [
    { id: 'FIXED', name: 'Fixed Rate - เป็นการคำนวณ โดยคิด Rate แบบคงตัว' },
    { id: 'STEP', name: 'Step Rate - เป็นการคำนวณ โดยคิด Rate แบบขั้นบันได' },
    { id: 'RANGE', name: 'Range Rate - เป็นการคำนวณ โดยคิด Rate แบบช่วง' }
  ];

  calculationBasisList = [
    { id: 'ON_VOLUME', name: 'On Volume - คำนวณจากยอด Volumn ของแต่ละรายการ' },
    { id: 'ON_FEE', name: 'On Fee - คำนวณ On Top ค่า Fee ที่ได้รับจาก บลจ.' },
    { id: 'ON_OUTSTANDING', name: 'On Outstanding - คำนวณจาก Outstanding Portfolio' }
  ];

  amcList: any[] = [];
  fundList: any[] = [];

  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }
  }

  loadData() {
    this.httpService.get('/feescheme/getdata').subscribe({
      next: (response: any) => {
        // AMCs
        this.amcList = [
          { id: null, name: 'All AMCs' },
          ...response.amcs.map((amc: any) => ({
            id: amc.id,
            name: amc.shortName
          }))
        ];

        // Funds
        this.fundList = [
          { id: null, name: 'All Funds' },
          ...response.funds.map((fund: any) => ({
            id: fund.id,
            name: fund.fundNameShortTh
          }))
        ];
      },
      error: (error) => {
        this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }

  getRow(id: number) {
    this.httpService.get(`/feescheme/get/${id}`).subscribe({
      next: (response: any) => {
        this.obj = response.scheme;
        this.rates = response.rates || [];
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'Failed to load data', 'Error!');
      }
    });
  }

  addRate() {
    this.rates.push({
      amcId: null,
      fundId: null,
      minAmount: null,
      maxAmount: null,
      ratePercentage: null,
      fixedAmount: null,
      displayOrder: this.rates.length + 1,
      isActive: true
    });
  }

  removeRate(index: number) {
    if (confirm('Remove this rate?')) {
      this.rates.splice(index, 1);
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      const payload = {
        scheme: this.obj,
        rates: this.rates
      };

      this.httpService.post('/feescheme/post', payload).subscribe({
        next: (response) => {
          this.alertService.success(
            `Fee Scheme successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Failed to save Fee Scheme');
          console.error('Error saving:', error);
        }
      });
    } else {
      form.control.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/master/fee-scheme']);
  }
}