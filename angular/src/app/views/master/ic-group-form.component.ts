import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ic-group-form',
  template: `
    <div class="container-fluid">
      <form #form="ngForm" (ngSubmit)="onSubmit(form)">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} IC Group</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <!-- Group Code -->
                <div class="mb-3">
                  <label class="form-label">Group Code <span class="text-danger">*</span></label>
                  <input type="text" name="groupCode" class="form-control"
                    [(ngModel)]="obj.groupCode"
                    #groupCode="ngModel" required
                    [class.is-invalid]="groupCode.invalid && groupCode.touched" />
                  <div class="invalid-feedback" *ngIf="groupCode.invalid && groupCode.touched">
                    Please enter group code
                  </div>
                </div>

                <!-- Group Name -->
                <div class="mb-3">
                  <label class="form-label">Group Name <span class="text-danger">*</span></label>
                  <input type="text" name="groupName" class="form-control"
                    [(ngModel)]="obj.groupName"
                    #groupName="ngModel" required
                    [class.is-invalid]="groupName.invalid && groupName.touched" />
                  <div class="invalid-feedback" *ngIf="groupName.invalid && groupName.touched">
                    Please enter group name
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea name="description" class="form-control" rows="3"
                    [(ngModel)]="obj.description"></textarea>
                </div>

                <!-- Parent Group -->
                <div class="mb-3">
                  <label class="form-label">Parent Group</label>
                  <ng-select
                    [options]="parentGroupList"
                    valueProp="id"
                    labelProp="name"
                    name="parentGroupId"
                    [(ngModel)]="obj.parentGroupId"
                    placeholder="Select Parent Group (Optional)">
                  </ng-select>
                  <small class="text-muted">Leave empty for top-level group</small>
                </div>

                <!-- Active Status -->
                <div class="mb-3 form-check">
                  <input id="isActive" type="checkbox" class="form-check-input"
                    name="isActive" [(ngModel)]="obj.isActive">
                  <label for="isActive" class="form-check-label">Active</label>
                </div>
              </div>

              <div class="col-md-6">
                <!-- IC Members -->
                <div class="mb-3">
                  <h6>IC Members</h6>
                  <ng-multi-select
                    [availableItems]="membersAvailableItems"
                    [(ngModel)]="membersSelectedItems"
                    [selectedValue]="'id'"
                    [selectedLabel]="'fullName'"
                    [availableLabel]="'fullName'"
                    name="members">
                  </ng-multi-select>
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
export class IcGroupFormComponent implements OnInit {
  isEditMode = false;

  obj: any = {
    groupCode: '',
    groupName: '',
    description: '',
    parentGroupId: null,
    isActive: true
  };

  membersSelectedItems: any[] = [];
  membersAvailableItems: any[] = [];
  parentGroupList: any[] = [];

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
    this.httpService.get('/icgroup/getdata').subscribe({
      next: (response: any) => {
        // Parent Groups
        this.parentGroupList = response.groups.map((g: any) => ({
          id: g.id,
          name: g.groupName
        }));

        // Available ICs
        this.membersAvailableItems = response.consultants.map((ic: any) => ({
          id: ic.id,
          fullName: `${ic.contactCode} - ${ic.fullNameTh}`
        }));
      },
      error: (error) => {
        this.alertService.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    });
  }

  getRow(id: number) {
    this.httpService.get(`/icgroup/get/${id}`).subscribe({
      next: (response: any) => {
        this.obj = response.group;

        // Members
        const memberIds = response.members ? response.members.map((m: any) => m.investmentConsultantId) : [];
        this.membersSelectedItems = this.membersAvailableItems.filter(
          (item: any) => memberIds.includes(item.id)
        );
        this.membersAvailableItems = this.membersAvailableItems.filter(
          (item: any) => !memberIds.includes(item.id)
        );

        // Remove current group from parent list
        this.parentGroupList = this.parentGroupList.filter(g => g.id !== id);
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'Failed to load data', 'Error!');
      }
    });
  }

  onSubmit(form: any) {
    if (form.valid) {
      const payload = {
        group: this.obj,
        members: this.membersSelectedItems.map((m: any) => m.id)
      };

      this.httpService.post('/icgroup/post', payload).subscribe({
        next: (response) => {
          this.alertService.success(
            `IC Group successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Failed to save IC Group');
          console.error('Error saving:', error);
        }
      });
    } else {
      form.control.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/master/ic-group']);
  }
}