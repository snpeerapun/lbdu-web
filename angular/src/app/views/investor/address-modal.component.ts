import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-address-modal',
  template: `
    <form #myForm="ngForm">
      <div class="row">
        <div class="col-md-6">
          <!-- Address Type -->
          <div class="form-group">
            <label class="form-label">ประเภทที่อยู่ <span class="text-danger">*</span></label>
            <ng-select
              [options]="addressTypeList"
              valueProp="id"
              labelProp="name"
              name="addressType"
              [(ngModel)]="item.addressType"
              #addressType="ngModel"
              required
              placeholder="เลือกประเภทที่อยู่"
              [class.is-invalid]="addressType.invalid && addressType.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="addressType.invalid && addressType.touched">
              กรุณาเลือกประเภทที่อยู่
            </div>
          </div>

          <!-- Address No -->
          <div class="row g-2 align-items-end">
                <div class="col-md-4">
                    <label class="form-label">บ้านเลขที่</label>
                    <input type="text" class="form-control"
                        name="addressNo"
                        [(ngModel)]="item.addressNo"
                        placeholder="123">
                </div>

                <div class="col-md-4">
                    <label class="form-label">ชั้น</label>
                    <input type="text" class="form-control"
                        name="floor"
                        [(ngModel)]="item.floor"
                        placeholder="5">
                </div>

                <div class="col-md-4">
                    <label class="form-label">ห้อง</label>
                    <input type="text" class="form-control"
                        name="roomNo"
                        [(ngModel)]="item.roomNo"
                        placeholder="501">
                </div>
                </div>

          <!-- Building -->
          <div class="form-group">
            <label class="form-label">อาคาร/หมู่บ้าน</label>
            <input type="text" 
                   class="form-control" 
                   name="building"
                   [(ngModel)]="item.building"
                   placeholder="อาคารเอบีซี">
          </div>

          <!-- Moo -->
          <div class="form-group">
            <label class="form-label">หมู่ที่</label>
            <input type="text" 
                   class="form-control" 
                   name="moo"
                   [(ngModel)]="item.moo"
                   placeholder="5">
          </div>

          <!-- Soi -->
          <div class="form-group">
            <label class="form-label">ซอย</label>
            <input type="text" 
                   class="form-control" 
                   name="soi"
                   [(ngModel)]="item.soi"
                   placeholder="สุขุมวิท 55">
          </div>

          <!-- Road -->
          <div class="form-group">
            <label class="form-label">ถนน</label>
            <input type="text" 
                   class="form-control" 
                   name="road"
                   [(ngModel)]="item.road"
                   placeholder="สุขุมวิท">
          </div>
        </div>

        <div class="col-md-6">
          <!-- Province -->
          <div class="form-group">
            <label class="form-label">จังหวัด <span class="text-danger">*</span></label>
            <ng-select
              [options]="provinceList"
              valueProp="id"
              labelProp="name"
              name="provinceId"
              [(ngModel)]="item.provinceId"
              #provinceId="ngModel"
              required
              placeholder="เลือกจังหวัด"
              (ngModelChange)="onProvinceChange()"
              [class.is-invalid]="provinceId.invalid && provinceId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="provinceId.invalid && provinceId.touched">
              กรุณาเลือกจังหวัด
            </div>
          </div>

          <!-- District -->
          <div class="form-group">
            <label class="form-label">อำเภอ/เขต <span class="text-danger">*</span></label>
            <ng-select
              [options]="districtList"
              valueProp="id"
              labelProp="name"
              name="districtId"
              [(ngModel)]="item.districtId"
              #districtId="ngModel"
              required
              placeholder="เลือกอำเภอ/เขต"
              (ngModelChange)="onDistrictChange()"
              [disabled]="!item.provinceId"
              [class.is-invalid]="districtId.invalid && districtId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="districtId.invalid && districtId.touched">
              กรุณาเลือกอำเภอ/เขต
            </div>
          </div>

          <!-- Subdistrict -->
          <div class="form-group">
            <label class="form-label">ตำบล/แขวง <span class="text-danger">*</span></label>
            <ng-select
              [options]="subdistrictList"
              valueProp="id"
              labelProp="name"
              name="subdistrictId"
              [(ngModel)]="item.subdistrictId"
              #subdistrictId="ngModel"
              required
              placeholder="เลือกตำบล/แขวง"
              (ngModelChange)="onSubdistrictChange()"
              [disabled]="!item.districtId"
              [class.is-invalid]="subdistrictId.invalid && subdistrictId.touched">
            </ng-select>
            <div class="invalid-feedback" *ngIf="subdistrictId.invalid && subdistrictId.touched">
              กรุณาเลือกตำบล/แขวง
            </div>
          </div>

          <!-- Postal Code -->
          <div class="form-group">
            <label class="form-label">รหัสไปรษณีย์</label>
            <input type="text" 
                   class="form-control" 
                   name="postalCode"
                   [(ngModel)]="item.postalCode"
                   placeholder="10110"
                   maxlength="5"
                   readonly>
          
          </div>

          <!-- Country -->
          <div class="form-group">
            <label class="form-label">ประเทศ</label>
            <ng-select
              [options]="countryList"
              valueProp="id"
              labelProp="name"
              name="country"
              [(ngModel)]="item.country"
              placeholder="เลือกประเทศ">
            </ng-select>
          </div>

          <!-- Is Primary -->
          <div class="form-group form-check">
            <input id="isPrimary" 
                   type="checkbox" 
                   class="form-check-input" 
                   name="isPrimary"
                   [(ngModel)]="item.isPrimary">
            <label for="isPrimary" class="form-check-label">ที่อยู่หลัก</label>
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

      <!-- Address Summary -->
      <div class="row mt-3" *ngIf="getFullAddress()">
        <div class="col-12">
          <div class="alert alert-info">
            <strong>ที่อยู่:</strong><br>
            {{ getFullAddress() }}
          </div>
        </div>
      </div>
    </form>
  `
})
export class AddressModalComponent implements OnInit {
  data!: any;
  item: any = {
    customerId: null,
    addressType: 'CURRENT',
    addressNo: '',
    floor: '',
    building: '',
    roomNo: '',
    moo: '',
    soi: '',
    road: '',
    subdistrictId: null,
    districtId: null,
    provinceId: null,
    postalCode: '',
    country: 'TH',
    isPrimary: false,
    isActive: true
  };

  provinceList: any[] = [];
  districtList: any[] = [];
  subdistrictList: any[] = [];

  // Lists
  addressTypeList = [
    { id: 'CURRENT', name: 'ที่อยู่ปัจจุบัน' },
    { id: 'REGISTERED', name: 'ที่อยู่ตามทะเบียนบ้าน' },
    { id: 'OFFICE', name: 'ที่อยู่สำนักงาน' },
    { id: 'MAILING', name: 'ที่อยู่จัดส่งเอกสาร' }
  ];

  countryList = [
    { id: 'TH', name: 'ไทย (Thailand)' },
    { id: 'US', name: 'สหรัฐอเมริกา (United States)' },
    { id: 'GB', name: 'สหราชอาณาจักร (United Kingdom)' },
    { id: 'JP', name: 'ญี่ปุ่น (Japan)' },
    { id: 'CN', name: 'จีน (China)' },
    { id: 'SG', name: 'สิงคโปร์ (Singapore)' },
    { id: 'MY', name: 'มาเลเซีย (Malaysia)' }
  ];

  constructor(
    private httpService: HttpService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // ถ้ามีข้อมูลส่งมา ให้ใช้ข้อมูลนั้น
    if (this.data?.item) {
      this.item = { ...this.item, ...this.data.item };
    }
    
    // ถ้าไม่มี customerId ให้ใช้จาก data
    if (!this.item.customerId && this.data?.customerId) {
      this.item.customerId = this.data.customerId;
    }

    // Load provinces
    this.loadProvinces();

    // ถ้ามีข้อมูล address อยู่แล้ว ให้โหลด cascade
    if (this.item.provinceId) {
      this.loadDistricts(this.item.provinceId);
    }
    if (this.item.districtId) {
      this.loadSubdistricts(this.item.districtId);
    }
  }

  loadProvinces() {
    this.httpService.get('/address/provinces').subscribe({
      next: (response: any) => {
        this.provinceList = response.map((province: any) => ({
          id: province.id,
          name: province.provinceName
        }));
      },
      error: (err) => {
        console.error('Error loading provinces:', err);
        this.alertService.error('Failed to load provinces', 'Error!');
      }
    });
  }

  loadDistricts(provinceId: number) {
    this.httpService.get(`/address/districts/${provinceId}`).subscribe({
      next: (response: any) => {
        this.districtList = response.map((district: any) => ({
          id: district.id,
          name: district.districtName
        }));
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.alertService.error('Failed to load districts', 'Error!');
      }
    });
  }

  loadSubdistricts(districtId: number) {
    this.httpService.get(`/address/subdistricts/${districtId}`).subscribe({
      next: (response: any) => {
        this.subdistrictList = response.map((subdistrict: any) => ({
          id: subdistrict.id,
          name: subdistrict.subDistrictName,
          zipCode: subdistrict.zipCode
        }));
      },
      error: (err) => {
        console.error('Error loading subdistricts:', err);
        this.alertService.error('Failed to load subdistricts', 'Error!');
      }
    });
  }

  onProvinceChange() {
    // Reset district and subdistrict when province changes
    this.item.districtId = null;
    this.item.subdistrictId = null;
    this.item.postalCode = '';
    this.districtList = [];
    this.subdistrictList = [];

    if (this.item.provinceId) {
      this.loadDistricts(this.item.provinceId);
    }
  }

  onDistrictChange() {
    // Reset subdistrict when district changes
    this.item.subdistrictId = null;
    this.item.postalCode = '';
    this.subdistrictList = [];

    if (this.item.districtId) {
      this.loadSubdistricts(this.item.districtId);
    }
  }

  onSubdistrictChange() {
    // Auto-fill postal code
    if (this.item.subdistrictId) {
      const selectedSubdistrict = this.subdistrictList.find(
        sub => sub.id === this.item.subdistrictId
      );
      if (selectedSubdistrict) {
        this.item.postalCode = selectedSubdistrict.zipCode;
      }
    }
  }

  getFullAddress(): string {
    const parts: string[] = [];

    if (this.item.addressNo) parts.push(`เลขที่ ${this.item.addressNo}`);
    if (this.item.floor) parts.push(`ชั้น ${this.item.floor}`);
    if (this.item.roomNo) parts.push(`ห้อง ${this.item.roomNo}`);
    if (this.item.building) parts.push(this.item.building);
    if (this.item.moo) parts.push(`หมู่ ${this.item.moo}`);
    if (this.item.soi) parts.push(`ซ. ${this.item.soi}`);
    if (this.item.road) parts.push(`ถ. ${this.item.road}`);

    const subdistrict = this.subdistrictList.find(s => s.id === this.item.subdistrictId);
    if (subdistrict) parts.push(`ต. ${subdistrict.name}`);

    const district = this.districtList.find(d => d.id === this.item.districtId);
    if (district) parts.push(`อ. ${district.name}`);

    const province = this.provinceList.find(p => p.id === this.item.provinceId);
    if (province) parts.push(`จ. ${province.name}`);

    if (this.item.postalCode) parts.push(this.item.postalCode);

    return parts.length > 0 ? parts.join(' ') : '';
  }

  onSubmit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // ตรวจสอบ required fields
      if (!this.item.customerId) {
        this.alertService.error('Customer ID is required', 'Error!');
        reject('Customer ID is required');
        return;
      }

      if (!this.item.addressType || !this.item.provinceId || 
          !this.item.districtId || !this.item.subdistrictId) {
        this.alertService.error('Please fill in all required fields', 'Error!');
        reject('Form is invalid');
        return;
      }

      const payload = { ...this.item };
      
      this.httpService.post('/address/post', payload).subscribe({
        next: (response: any) => {
          this.alertService.success('Address saved successfully.');
          resolve(response);
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error saving data', 'Error!');
          reject(err.error?.message);
        }
      });
    });
  }
}