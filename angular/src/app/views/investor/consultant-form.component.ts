import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';
@Component({
  selector: 'app-consultant-form',
  template: `
    <div class="container-fluid">
      <form #form="ngForm" (ngSubmit)="onSubmit(form)">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              {{ isEditMode ? 'Edit' : 'Add' }} Investment Consultant
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-6">
                <!-- Contact Code -->
                <div class="">
                  <label class="form-label">Contact Code <span class="text-danger">*</span></label>
                  <input type="text" name="contactCode" class="form-control"
                    [(ngModel)]="obj.contactCode"
                    #contactCode="ngModel" required
                    [class.is-invalid]="contactCode.invalid && contactCode.touched" />
                  <div class="invalid-feedback" *ngIf="contactCode.invalid && contactCode.touched">
                    Please enter contact code
                  </div>
                </div>

                <!-- Full Name Thai -->
                <div class="">
                  <label class="form-label">Full Name (Thai) <span class="text-danger">*</span></label>
                  <input type="text" name="fullNameTh" class="form-control"
                    [(ngModel)]="obj.fullNameTh"
                    #fullNameTh="ngModel" required
                    [class.is-invalid]="fullNameTh.invalid && fullNameTh.touched" />
                  <div class="invalid-feedback" *ngIf="fullNameTh.invalid && fullNameTh.touched">
                    Please enter full name in Thai
                  </div>
                </div>

                <!-- Full Name English -->
                <div class="">
                  <label class="form-label">Full Name (English)</label>
                  <input type="text" name="fullNameEn" class="form-control"
                    [(ngModel)]="obj.fullNameEn" />
                </div>

                <!-- Nick Name -->
                <div class="">
                  <label class="form-label">Nick Name</label>
                  <input type="text" name="nickName" class="form-control"
                    [(ngModel)]="obj.nickName" />
                </div>

                <!-- Position Title -->
                <div class="">
                  <label class="form-label">Position Title</label>
                  <input type="text" name="positionTitle" class="form-control"
                    [(ngModel)]="obj.positionTitle" />
                </div>

                <!-- Department -->
                <div class="">
                  <label class="form-label">Department</label>
                  <input type="text" name="department" class="form-control"
                    [(ngModel)]="obj.department" />
                </div>

                <!-- Branch Code -->
                <div class="">
                  <label class="form-label">Branch Code</label>
                  <input type="text" name="branchCode" class="form-control"
                    [(ngModel)]="obj.branchCode" />
                </div>

                <!-- Channel Code -->
                <div class="">
                  <label class="form-label">Channel Code</label>
                  <input type="text" name="channelCode" class="form-control"
                    [(ngModel)]="obj.channelCode" />
                </div>

                <!-- Contact Information -->
                <div class="">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control"
                    [(ngModel)]="obj.email" />
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="">
                      <label class="form-label">Mobile No</label>
                      <input type="text" name="mobileNo" class="form-control"
                        [(ngModel)]="obj.mobileNo" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="">
                      <label class="form-label">Phone No</label>
                      <input type="text" name="phoneNo" class="form-control"
                        [(ngModel)]="obj.phoneNo" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <!-- License Information -->
                <div class="">
                  <label class="form-label">License No <span class="text-danger">*</span></label>
                  <input type="text" name="licenseNo" class="form-control"
                    [(ngModel)]="obj.licenseNo"
                    #licenseNo="ngModel" required
                    [class.is-invalid]="licenseNo.invalid && licenseNo.touched" />
                  <div class="invalid-feedback" *ngIf="licenseNo.invalid && licenseNo.touched">
                    Please enter license number
                  </div>
                </div>

                <div class="">
                  <label class="form-label">License Type <i class="fa fa-info-circle">?</i></label>
                  <ng-select
                    [options]="licenseTypeList"
                    valueProp="id"
                    labelProp="name"
                    name="licenseType"
                    [(ngModel)]="obj.licenseType"
                    placeholder="Select License Type">
                  </ng-select>
                </div>

                <div class="">
                  <label class="form-label">License Expiry Date <span class="text-danger">*</span></label>
                  <input type="date" name="licenseExpiryDate" class="form-control"
                    [(ngModel)]="obj.licenseExpiryDate"
                    #licenseExpiryDate="ngModel" required
                    [class.is-invalid]="licenseExpiryDate.invalid && licenseExpiryDate.touched" />
                  <div class="invalid-feedback" *ngIf="licenseExpiryDate.invalid && licenseExpiryDate.touched">
                    Please enter license expiry date
                  </div>
                </div>

                <!-- SA Code -->
                <div class="">
                  <label class="form-label">SA Code</label>
                  <input type="text" name="saCode" class="form-control"
                    [(ngModel)]="obj.saCode" />
                </div>

                <!-- External Agent Code -->
                <div class="">
                  <label class="form-label">External Agent Code</label>
                  <input type="text" name="externalAgentCode" class="form-control"
                    [(ngModel)]="obj.externalAgentCode" />
                </div>

                <!-- User Link -->
                <div class="">
                  <label class="form-label">Link to User Account</label>
                  <ng-select
                    [options]="userList"
                    valueProp="id"
                    labelProp="name"
                    name="userId"
                    [(ngModel)]="obj.userId"
                    placeholder="Select User">
                  </ng-select>
                </div>

                <!-- Status -->
                <div class="">
                  <label class="form-label">Status <span class="text-danger">*</span></label>
                  <ng-select
                    [options]="statusList"
                    valueProp="id"
                    labelProp="name"
                    name="status"
                    [(ngModel)]="obj.status"
                    #status="ngModel" required
                    [class.is-invalid]="status.invalid && status.touched"
                    placeholder="Select Status">
                  </ng-select>
                  <div class="invalid-feedback" *ngIf="status.invalid && status.touched">
                    Please select status
                  </div>
                </div>

                <!-- Date Range -->
                <div class="row">
                  <div class="col-md-6">
                    <div class="">
                      <label class="form-label">Start Date</label>
                      <input type="date" name="startDate" class="form-control"
                        [(ngModel)]="obj.startDate" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="">
                      <label class="form-label">End Date</label>
                      <input type="date" name="endDate" class="form-control"
                        [(ngModel)]="obj.endDate" />
                    </div>
                  </div>
                </div>

                <!-- Parent IC (Hierarchy) -->
                <div class="">
                  <label class="form-label">Parent IC (Upline)</label>
                  <ng-select
                    [options]="parentIcList"
                    valueProp="id"
                    labelProp="name"
                    name="parentIcId"
                    [(ngModel)]="obj.parentIcId"
                    placeholder="Select Parent IC">
                  </ng-select>
                  <small class="text-muted">Leave empty if this is a top-level IC</small>
                </div>

                <!-- Tier Level -->
                <div class="" *ngIf="obj.parentIcId">
                  <label class="form-label">Tier Level</label>
                  <ng-select
                    [options]="tierList"
                    valueProp="id"
                    labelProp="name"
                    name="tierLevel"
                    [(ngModel)]="obj.tierLevel"
                    placeholder="Select Tier">
                  </ng-select>
                </div>

                <!-- Override Percentage -->
                <div class="" *ngIf="obj.parentIcId">
                  <label class="form-label">Override Percentage (%)</label>
                  <input type="number" name="overridePercentage" class="form-control"
                    [(ngModel)]="obj.overridePercentage"
                    min="0" max="100" step="0.01"
                    placeholder="0.00" />
                  <small class="text-muted">Percentage that parent IC receives from this IC's commission</small>
                </div>
              </div>
            </div>

            <!-- Groups Assignment -->
            <div class="row mt-3">
              <div class="col-12">
                <h6>IC Groups</h6>
                <ng-multi-select
                  [availableItems]="groupsAvailableItems"
                  [(ngModel)]="groupsSelectedItems"
                  [selectedValue]="'id'"
                  [selectedLabel]="'groupName'"
                  [availableLabel]="'groupName'"
                  name="groups">
                </ng-multi-select>
              </div>
            </div>

            <!-- Fee Schemes Assignment -->
            <div class="row mt-3">
              <div class="col-12">
                <h6>Fee Schemes</h6>
                <ng-multi-select
                  [availableItems]="feeSchemesAvailableItems"
                  [(ngModel)]="feeSchemesSelectedItems"
                  [selectedValue]="'id'"
                  [selectedLabel]="'schemeName'"
                  [availableLabel]="'schemeName'"
                  name="feeSchemes">
                </ng-multi-select>
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
export class ConsultantFormComponent implements OnInit {
  isEditMode = false;

  obj: any = {
    contactCode: '',
    fullNameTh: '',
    fullNameEn: '',
    nickName: '',
    positionTitle: '',
    department: '',
    branchCode: '',
    channelCode: '',
    licenseNo: '',
    licenseType: '',
    licenseExpiryDate: null,
    saCode: '',
    externalAgentCode: '',
    userId: null,
    email: '',
    mobileNo: '',
    phoneNo: '',
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    parentIcId: null,
    tierLevel: null,
    overridePercentage: null
  };

  // Multi-select items
  groupsSelectedItems: any[] = [];
  groupsAvailableItems: any[] = [];
  feeSchemesSelectedItems: any[] = [];
  feeSchemesAvailableItems: any[] = [];

  // Dropdown lists
  licenseTypeList = [
    { id: 'IC_BASIC', name: 'IC Basic License' },
    { id: 'IC_COMPLEX', name: 'IC Complex License' },
    { id: 'IC_COMPLEX_2', name: 'IC Complex 2 License' },
    { id: 'IP', name: 'IP License' }
  ];

  statusList = [
    { id: 'ACTIVE', name: 'Active' },
    { id: 'INACTIVE', name: 'Inactive' },
    { id: 'SUSPENDED', name: 'Suspended' }
  ];

  tierList = [
    { id: 1, name: 'Tier 1 - Manager' },
    { id: 2, name: 'Tier 2 - Senior' },
    { id: 3, name: 'Tier 3 - Junior' }
  ];

  userList: any[] = [];
  parentIcList: any[] = [];

  constructor(
    private httpService: HttpService,
    private toast: ToastService,
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
    this.httpService.get('/investmentconsultant/getdata').subscribe({
      next: (response: any) => {
        // Users
        this.userList = response.users.map((u: any) => ({
          id: u.id,
          name: u.fullName
        }));

        // Parent ICs
        this.parentIcList = response.consultants.map((ic: any) => ({
          id: ic.id,
          name: `${ic.contactCode} - ${ic.fullNameTh}`
        }));

        // Groups
        this.groupsAvailableItems = response.groups || [];

        // Fee Schemes
        this.feeSchemesAvailableItems = response.feeSchemes || [];
      },
      error: (error) => {
        this.toast.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }

  getRow(id: number) {
    this.httpService.get(`/investmentconsultant/get/${id}`).subscribe({
      next: (response: any) => {
        this.obj = response.consultant;

        // Groups
        const groupIds = response.groups ? response.groups.map((g: any) => g.icGroupId) : [];
        this.groupsSelectedItems = this.groupsAvailableItems.filter(
          (item: any) => groupIds.includes(item.id)
        );
        this.groupsAvailableItems = this.groupsAvailableItems.filter(
          (item: any) => !groupIds.includes(item.id)
        );

        // Fee Schemes
        const feeSchemeIds = response.feeAssignments
          ? response.feeAssignments.map((f: any) => f.feeSchemeId)
          : [];
        this.feeSchemesSelectedItems = this.feeSchemesAvailableItems.filter(
          (item: any) => feeSchemeIds.includes(item.id)
        );
        this.feeSchemesAvailableItems = this.feeSchemesAvailableItems.filter(
          (item: any) => !feeSchemeIds.includes(item.id)
        );

        // Hierarchy
        if (response.hierarchy) {
          this.obj.parentIcId = response.hierarchy.parentIcId;
          this.obj.tierLevel = response.hierarchy.tierLevel;
          this.obj.overridePercentage = response.hierarchy.overridePercentage;
        }
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to load data', 'Error!');
      }
    });
  }

  onSubmit(form: any) {
    if (form.valid) {
      const payload = {
        consultant: this.obj,
        groups: this.groupsSelectedItems.map((g: any) => g.id),
        feeSchemes: this.feeSchemesSelectedItems.map((f: any) => f.id),
        hierarchy: {
          parentIcId: this.obj.parentIcId,
          tierLevel: this.obj.tierLevel,
          overridePercentage: this.obj.overridePercentage
        }
      };

      this.httpService.post('/investmentconsultant/post', payload).subscribe({
        next: (response) => {
          this.toast.success(
            `Investment Consultant successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.toast.error(
            error.error?.message || 'Failed to save Investment Consultant'
          );
          console.error('Error saving:', error);
        }
      });
    } else {
      form.control.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/investor/consultant']);
  }
}