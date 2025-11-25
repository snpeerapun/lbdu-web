import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from 'src/app/shared/services/toast.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { RelatePersonModalComponent } from './relate-person.modal.component';
import { BankAccountModalComponent } from './bankaccount.modal.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AccountModalComponent } from './account-modal.component';
import { AddressModalComponent } from './address-modal.component';
import { UnitholderModalComponent } from './unitholder-modal.component';
import { DocPreviewModalComponent } from './doc-preview-modal.component';
declare var bootstrap: any;

@Component({
  selector: 'app-customer-form',
  template: `
  <div class="container-fluid">
    <!-- Loading Spinner -->
   

    <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
 
       <div class="text-center py-5"  *ngIf="loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        

      <div class="card"  *ngIf="!loading">
        <!-- Header with Tabs -->
       
        <div class="card-header pb-0">
          <ul class="nav nav-tabs card-header-tabs border-bottom-0">
            <li class="nav-item">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'basic'"
                (click)="activeTab = 'basic'"
                type="button">
                <i class="fas fa-user me-1"></i> Basic Information
              </button>
            </li>
            <li class="nav-item" *ngIf="customer.customerType === 'Individual'">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'personal'"
                (click)="activeTab = 'personal'"
                type="button">
                <i class="fas fa-id-card me-1"></i> Personal Details
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'addresses'"
                (click)="activeTab = 'addresses'"
                type="button">
                <i class="fas fa-map-marker-alt me-1"></i> Addresses
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'investment'"
                (click)="activeTab = 'investment'"
                type="button">
                <i class="fas fa-chart-line me-1"></i> Investment Profile
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'compliance'"
                (click)="activeTab = 'compliance'"
                type="button">
                <i class="fas fa-shield-alt me-1"></i> Compliance
              </button>
            </li>
            <li class="nav-item" *ngIf="customer.customerType === 'Juristic' && isEditMode">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'related'"
                (click)="activeTab = 'related'"
                type="button">
                <i class="fas fa-users me-1"></i> Related Persons <span class="badge bg-primary">{{ customer.customerRelationsPersons.length }}</span>
              </button>
            </li>
            <!--<li class="nav-item" *ngIf="isEditMode">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'banks'"
                (click)="activeTab = 'banks'"
                type="button">
                <i class="fas fa-university me-1"></i> Bank Accounts
              </button>
            </li>-->
            <li class="nav-item" *ngIf="isEditMode">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'accounts'"
                (click)="activeTab = 'accounts'"
                type="button">
                <i class="fas fa-folder me-1"></i> Accounts <span class="badge bg-primary" *ngIf="customer.customerRelationsPersons.length">{{ customer.customerRelationsPersons.length }}</span>
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'documents'"
                (click)="activeTab = 'documents'"
                type="button">
                <i class="fas fa-file me-1"></i> Documents <span class="badge bg-primary" *ngIf="customer.documents.length>0">{{ customer.documents.length }}</span>
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'audit'"
                (click)="activeTab = 'audit'"
                type="button">
                <i class="fas fa-history me-1"></i> Audit Trail
              </button>
            </li>
          </ul>
        </div>

        <!-- Tab Content -->
        <div class="card-body">
          
          <!-- Tab 1: Basic Information -->
          <div *ngIf="activeTab === 'basic'" class="tab-pane fade show active">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Customer Type & Identification</h6>
                
                <!-- Customer Type -->
                <div class="">
                  <label class="form-label">Customer Type <span class="text-danger">*</span></label>
                 <ng-select
                  [options]="customerTypeList"
                  valueProp="id"
                  labelProp="name"
                  name="customerType"
                  [(ngModel)]="customer.customerType"
                  #customerType="ngModel"
                  placeholder="Select Customer Type"
                  [required]="true"
                  [disabled]="isEditMode"
                  [class.is-invalid]="customerType.invalid && (customerType.dirty || customerType.touched)">
                </ng-select>
                  <div class="invalid-feedback" *ngIf="customerType.invalid && (customerType.dirty || customerType.touched)">
                    Customer Type is required
                  </div>
                </div>

                <!-- Individual/Minor Fields -->
                <div *ngIf="customer.customerType === 'Individual' || customer.customerType === 'Minor' || customer.customerType === 'Foreign'">
                  <!-- Identification Type -->
                  <div class="">
                    <label class="form-label">Identification Type <span class="text-danger">*</span></label>
                    <ng-select
                      [options]="identificationCardTypeList"
                      valueProp="id"
                      labelProp="name"
                      name="identificationCardType"
                      [(ngModel)]="customer.identificationCardType"
                      #identificationCardType="ngModel"
                      placeholder="Select Type"
                      [required]="true"
                      [class.is-invalid]="identificationCardType.invalid && (identificationCardType.dirty || identificationCardType.touched)">
                    </ng-select>
                  </div>

                  <!-- Passport Country (if Passport) -->
                  <div class="" *ngIf="customer.identificationCardType === 'PASSPORT'">
                    <label class="form-label">Passport Country <span class="text-danger">*</span></label>
                    <ng-select
                      [options]="countryList"
                      valueProp="id"
                      labelProp="name"
                      name="passportCountry"
                      [(ngModel)]="customer.passportCountry"
                      placeholder="Select Country">
                    </ng-select>
                  </div>

                  <!-- Card Number -->
                  <div class="">
                    <label class="form-label">
                      {{ customer.identificationCardType === 'PASSPORT' ? 'Passport Number' : 
                         customer.identificationCardType === 'ALIEN' ? 'Alien Card Number' : 
                         'Citizen ID' }} 
                      <span class="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="cardNumber"
                      [(ngModel)]="customer.cardNumber"
                      #cardNumber="ngModel"
                      required
                      [maxlength]="customer.identificationCardType === 'CITIZEN_CARD' ? 13 : 20"
                      [class.is-invalid]="cardNumber.invalid && (cardNumber.dirty || cardNumber.touched)">
                  </div>

                  <!-- Card Expiry Date -->
                  <div class="">
                    <label class="form-label">Card Expiry Date</label>
                    <input 
                      type="date" 
                      class="form-control"
                      name="cardExpiryDate"
                      [(ngModel)]="customer.cardExpiryDate">
                  </div>

                  <h6 class="border-bottom pb-2  mt-4">Personal Information (Thai)</h6>

                  <!-- Title (TH) -->
                  <div class="">
                    <label class="form-label">Title <span class="text-danger">*</span></label>
                     <!-- Title Thai -->
                    <ng-select
                      [options]="titleThList"
                      valueProp="id"
                      labelProp="name"
                      name="titleTh"
                      [(ngModel)]="customer.titleTh"
                      #titleTh="ngModel"
                      placeholder="Select Title"
                      [required]="true">
                    </ng-select>
                  </div>

                  <!-- Title Other (TH) -->
                  <div class="" *ngIf="customer.titleTh === 'OTHER'">
                    <label class="form-label">Title Other (TH)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="titleOtherTh"
                      [(ngModel)]="customer.titleOtherTh"
                      maxlength="100">
                  </div>

                  <!-- First Name (TH) -->
                  <div class="">
                    <label class="form-label">First Name (TH) <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="firstNameTh"
                      [(ngModel)]="customer.firstNameTh"
                      #firstNameTh="ngModel"
                      required
                      maxlength="100"
                      [class.is-invalid]="firstNameTh.invalid && (firstNameTh.dirty || firstNameTh.touched)">
                  </div>

                  <!-- Last Name (TH) -->
                  <div class="">
                    <label class="form-label">Last Name (TH) <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="lastNameTh"
                      [(ngModel)]="customer.lastNameTh"
                      #lastNameTh="ngModel"
                      required
                      maxlength="100"
                      [class.is-invalid]="lastNameTh.invalid && (lastNameTh.dirty || lastNameTh.touched)">
                  </div>

                  <h6 class="border-bottom pb-2  mt-4">Personal Information (English)</h6>

                  <!-- Title (EN) -->
                  <div class="">
                    <label class="form-label">Title <span class="text-danger">*</span></label>
                    <ng-select
                      [options]="titleEnList"
                      valueProp="id"
                      labelProp="name"
                      name="titleEn"
                      [(ngModel)]="customer.titleEn"
                      placeholder="Select Title">
                    </ng-select>
                  </div>

                  <!-- First Name (EN) -->
                  <div class="">
                    <label class="form-label">First Name (EN) <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="firstNameEn"
                      [(ngModel)]="customer.firstNameEn"
                      #firstNameEn="ngModel"
                      required
                      maxlength="100"
                      [class.is-invalid]="firstNameEn.invalid && (firstNameEn.dirty || firstNameEn.touched)">
                  </div>

                  <!-- Last Name (EN) -->
                  <div class="">
                    <label class="form-label">Last Name (EN) <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="lastNameEn"
                      [(ngModel)]="customer.lastNameEn"
                      #lastNameEn="ngModel"
                      required
                      maxlength="100"
                      [class.is-invalid]="lastNameEn.invalid && (lastNameEn.dirty || lastNameEn.touched)">
                  </div>
                </div>

                <!-- Juristic Fields -->
                <div *ngIf="customer.customerType === 'Juristic'">
                  <!-- Tax ID -->
                  <div class="">
                    <label class="form-label">Tax ID <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="taxId"
                      [(ngModel)]="customer.taxId"
                      #taxId="ngModel"
                      required
                      maxlength="13"
                      [class.is-invalid]="taxId.invalid && (taxId.dirty || taxId.touched)">
                  </div>

                  <!-- Registration Number -->
                  <div class="">
                    <label class="form-label">Registration Number</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="registrationNumber"
                      [(ngModel)]="customer.registrationNumber"
                      maxlength="50">
                  </div>

                  <!-- Company Type -->
                  <div class="">
                    <label class="form-label">Company Type</label>
                    <ng-select
                      [options]="companyTypeList"
                      valueProp="id"
                      labelProp="name"
                      name="companyType"
                      [(ngModel)]="customer.companyType"
                      placeholder="Select Type">
                    </ng-select>
                  </div>

                  <h6 class="border-bottom pb-2  mt-4">Company Information</h6>

                  <!-- Company Name (TH) -->
                  <div class="">
                    <label class="form-label">Company Name (TH) <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="companyNameTh"
                      [(ngModel)]="customer.companyNameTh"
                      #companyNameTh="ngModel"
                      required
                      maxlength="255"
                      [class.is-invalid]="companyNameTh.invalid && (companyNameTh.dirty || companyNameTh.touched)">
                  </div>

                  <!-- Company Name (EN) -->
                  <div class="">
                    <label class="form-label">Company Name (EN)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="companyNameEn"
                      [(ngModel)]="customer.companyNameEn"
                      maxlength="255">
                  </div>

                  <!-- Establishment Date -->
                  <div class="">
                    <label class="form-label">Establishment Date</label>
                    <input 
                      type="date" 
                      class="form-control"
                      name="establishmentDate"
                      [(ngModel)]="customer.establishmentDate">
                  </div>

                  <!-- Registered Capital -->
                  <div class="">
                    <label class="form-label">Registered Capital (THB)</label>
                    <input 
                      type="number" 
                      class="form-control"
                      name="registeredCapital"
                      [(ngModel)]="customer.registeredCapital"
                      step="0.01">
                  </div>

                  <!-- Business Type -->
                  <div class="">
                    <label class="form-label">Business Type</label>
                    <ng-select
                      
                      [options]="businessTypeList"
                      valueProp="id"
                      labelProp="businessTypeNameTh"
                      name="businessTypeId"
                      [(ngModel)]="customer.businessTypeId">
                    </ng-select>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Contact Information</h6>

                <div *ngIf="customer.customerType === 'Individual' || customer.customerType === 'Minor' || customer.customerType === 'Foreign'">
                  <!-- Birth Date -->
                  <div class="">
                    <label class="form-label">Birth Date <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control"
                      name="birthDate"
                      [(ngModel)]="customer.birthDate"
                      #birthDate="ngModel"
                      required
                      [class.is-invalid]="birthDate.invalid && (birthDate.dirty || birthDate.touched)">
                  </div>

                  <!-- Nationality -->
                  <div class="">
                    <label class="form-label">Nationality <span class="text-danger">*</span></label>
                     <ng-select
                      [options]="countryList"
                      valueProp="id"
                      labelProp="name"
                      name="nationality"
                      [(ngModel)]="customer.nationality"
                      placeholder="Select Nationality">
                    </ng-select>
                  </div>
                </div>

                <!-- Mobile Number -->
                <div class="">
                  <label class="form-label">Mobile Number <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="mobileNo"
                    [(ngModel)]="customer.mobileNo"
                    #mobileNo="ngModel"
                    required
                    maxlength="20"
                    [class.is-invalid]="mobileNo.invalid && (mobileNo.dirty || mobileNo.touched)"
                    placeholder="08X-XXX-XXXX">
                </div>

                <!-- Email -->
                <div class="">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <input 
                    type="email" 
                    class="form-control"
                    name="email"
                    [(ngModel)]="customer.email"
                    #email="ngModel"
                    required
                    email
                    maxlength="100"
                    [class.is-invalid]="email.invalid && (email.dirty || email.touched)">
                </div>

                <!-- Phone -->
                <div class="">
                  <label class="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="phoneNo"
                    [(ngModel)]="customer.phoneNo"
                    maxlength="20">
                </div>

                <!-- Fax -->
                <div class="">
                  <label class="form-label">Fax</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fax"
                    [(ngModel)]="customer.fax"
                    maxlength="20">
                </div>

                <h6 class="border-bottom pb-2  mt-4">Status</h6>

                <!-- Status -->
                <div class="">
                  <label class="form-label">Status</label>
                  <div>
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        name="status"
                        [(ngModel)]="customer.isActive">
                      <span class="slider round"></span>
                    </label>
                     
                  </div>
                </div>

                <!-- Approved Date (Read Only) -->
                <div class="" *ngIf="isEditMode">
                  <label class="form-label">Approved Date</label>
                  <input 
                    type="text" 
                    class="form-control"
                    [value]="customer.approvedDate | date:'dd/MM/yyyy HH:mm:ss'"
                    readonly>
                </div>

                <!-- Created Date (Read Only) -->
                <div class="" *ngIf="isEditMode">
                  <label class="form-label">Created Date</label>
                  <input 
                    type="text" 
                    class="form-control"
                    [value]="customer.createdAt | date:'dd/MM/yyyy HH:mm:ss'"
                    readonly>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Personal Details (Individual Only) -->
      
          <div *ngIf="activeTab === 'personal' && customer.customerType === 'Individual'" class="tab-pane fade show active">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Marital Status</h6>
                
                <!-- Marital Status -->
                <div class="">
                  <label class="form-label">Marital Status</label>
                 <ng-select
                  [options]="maritalStatusList"
                  valueProp="id"
                  labelProp="name"
                  name="maritalStatus"
                  [(ngModel)]="customer.maritalStatus"
                  placeholder="Select Status">
                </ng-select>
                </div>

                <!-- Spouse Information (if Married) -->
                <div *ngIf="customer.maritalStatus === 'Married'">
                  <h6 class="text-muted ">Spouse Information</h6>
                  
                  <div class="">
                    <label class="form-label">Spouse First Name (TH)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="spouseFirstNameTh"
                      [(ngModel)]="customer.spouseFirstNameTh"
                      maxlength="100">
                  </div>

                  <div class="">
                    <label class="form-label">Spouse Last Name (TH)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="spouseLastNameTh"
                      [(ngModel)]="customer.spouseLastNameTh"
                      maxlength="100">
                  </div>

                  <div class="">
                    <label class="form-label">Spouse First Name (EN)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="spouseFirstNameEn"
                      [(ngModel)]="customer.spouseFirstNameEn"
                      maxlength="100">
                  </div>

                  <div class="">
                    <label class="form-label">Spouse Last Name (EN)</label>
                    <input 
                      type="text" 
                      class="form-control"
                      name="spouseLastNameEn"
                      [(ngModel)]="customer.spouseLastNameEn"
                      maxlength="100">
                  </div>
                </div>

                <h6 class="border-bottom pb-2  mt-4">Occupation & Income</h6>

                <!-- Occupation -->
                <div class="">
                  <label class="form-label">Occupation</label>
                  <ng-select
                      
                      [options]="occupationList"
                      valueProp="id"
                      labelProp="occupationNameTh"
                      name="occupationId"
                      [(ngModel)]="customer.occupationId">
                    </ng-select>
                </div>

                <!-- Occupation Other -->
                <div class="" *ngIf="customer.occupationId === 'OTHER'">
                  <label class="form-label">Occupation Other</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="occupationOther"
                    [(ngModel)]="customer.occupationOther"
                    maxlength="100">
                </div>

                <!-- Business Type -->
                <div class="">
                  <label class="form-label">Business Type</label>
                  <ng-select
                      
                      [options]="businessTypeList"
                      valueProp="id"
                      labelProp="businessTypeNameTh"
                      name="businessTypeId"
                      [(ngModel)]="customer.businessTypeId">
                    </ng-select>
                </div>

                <!-- Company Name -->
                <div class="">
                  <label class="form-label">Company Name</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="companyName"
                    [(ngModel)]="customer.companyName"
                    maxlength="255">
                </div>

                <!-- Work Position -->
                <div class="">
                  <label class="form-label">Work Position</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="workPosition"
                    [(ngModel)]="customer.workPosition"
                    maxlength="100">
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Income & Assets</h6>

                <!-- Monthly Income Level -->
                <div class="">
                  <label class="form-label">Monthly Income Level</label>
                  <ng-select
                    [options]="monthlyIncomeLevelList"
                    valueProp="id"
                    labelProp="name"
                    name="monthlyIncomeLevel"
                    [(ngModel)]="customer.monthlyIncomeLevel"
                    placeholder="Select Level">
                  </ng-select>
                </div>

                <!-- Asset Value -->
                <div class="">
                  <label class="form-label">Total Asset Value (THB)</label>
                  <input 
                    type="number" 
                    class="form-control"
                    name="assetValue"
                    [(ngModel)]="customer.assetValue"
                    step="0.01">
                </div>

                <!-- Income Source -->
                <div class="">
                  <label class="form-label">Income Source</label>
                   <ng-select
                    [options]="incomeSourceList"
                    valueProp="id"
                    labelProp="name"
                    name="incomeSource"
                    [(ngModel)]="customer.incomeSource"
                    placeholder="Select Source">
                  </ng-select>
                </div>

                <!-- Income Source Other -->
                <div class="" *ngIf="customer.incomeSource === 'OTHER'">
                  <label class="form-label">Income Source Other</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="incomeSourceOther"
                    [(ngModel)]="customer.incomeSourceOther"
                    maxlength="100">
                </div>

                <!-- Income Source Country -->
                <div class="">
                  <label class="form-label">Income Source Country</label>
                  <ng-select
                    [options]="countryList"
                    valueProp="id"
                    labelProp="name"
                    name="incomeSourceCountry"
                    [(ngModel)]="customer.incomeSourceCountry"
                    placeholder="Select Country">
                  </ng-select>
                </div>

                <h6 class="border-bottom pb-2  mt-4">Political Person</h6>

                <!-- Related Political Person -->
                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="relatedPoliticalPerson"
                      [(ngModel)]="customer.relatedPoliticalPerson"
                      id="relatedPoliticalPerson">
                    <label class="form-check-label" for="relatedPoliticalPerson">
                      Related to Politically Exposed Person (PEP)
                    </label>
                  </div>
                </div>

                <!-- Political Position -->
                <div class="" *ngIf="customer.relatedPoliticalPerson">
                  <label class="form-label">Political Position/Relationship</label>
                  <textarea 
                    class="form-control" 
                    name="politicalRelatedPersonPosition"
                    [(ngModel)]="customer.politicalRelatedPersonPosition"
                    rows="3"
                    maxlength="200"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 3: Addresses -->
            <div *ngIf="activeTab === 'addresses'" class="tab-pane fade show active">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">
                  <i class="fas fa-map-marker-alt me-2"></i>
                  Customer Addresses
                </h5>
                <button class="btn btn-primary btn-sm" type="button" (click)="openAddressModal()">
                  <i class="fas fa-plus me-1"></i> Add Address
                </button>
              </div>

              <!-- Loading State -->
              <div *ngIf="isLoadingAddresses" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading addresses...</p>
              </div>

              <!-- Empty State -->
              <div *ngIf="!isLoadingAddresses && customer.customerAddresses.length === 0" class="text-center py-5">
                <i class="fas fa-map-marked-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">No addresses found</p>
                <button class="btn btn-primary" (click)="openAddressModal()">
                  <i class="fas fa-plus me-1"></i> Add First Address
                </button>
              </div>

              <!-- Address Cards Grid -->
              <div *ngIf="!isLoadingAddresses && customer.customerAddresses.length > 0" class="row g-3 address-card">
                <div *ngFor="let address of customer.customerAddresses" class="col-md-6 col-lg-4 col-xl-3">
                  <div class="card h-100 shadow-sm " 
                      [class.border-primary]="address.isPrimary"
                      [class.border-2]="address.isPrimary">
                    <!-- Card Header -->
                    <div class="card-header d-flex justify-content-between align-items-center"
                        [class.bg-primary]="address.isPrimary"
                        [class.text-white]="address.isPrimary">
                      <div>
                        <span class="badge" 
                              [class.bg-primary]="!address.isPrimary"
                              [class.bg-white]="address.isPrimary"
                              [class.text-primary]="address.isPrimary">
                          {{ getAddressTypeLabel(address.addressType) }}
                        </span>
                        <span *ngIf="address.isPrimary" class="badge bg-warning text-dark ms-1">
                          <i class="fas fa-star"></i> Primary
                        </span>
                      </div>
                      <div class="dropdown">
                        <button class="btn btn-sm" 
                                [class.btn-light]="address.isPrimary"
                                [class.btn-outline-secondary]="!address.isPrimary"
                                type="button" 
                                [id]="'addressDropdown' + address.id"
                                data-bs-toggle="dropdown">
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" 
                            [attr.aria-labelledby]="'addressDropdown' + address.id">
                          <li>
                            <a class="dropdown-item" href="javascript:void(0)" 
                              (click)="openAddressModal(address)">
                              <i class="fas fa-edit text-primary me-2"></i> Edit
                            </a>
                          </li>
                          <li *ngIf="!address.isPrimary">
                            <a class="dropdown-item" href="javascript:void(0)" 
                              (click)="setAddressPrimary(address.id)">
                              <i class="fas fa-star text-warning me-2"></i> Set as Primary
                            </a>
                          </li>
                          <li><hr class="dropdown-divider"></li>
                          <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" 
                              (click)="deleteAddress(address.id)">
                              <i class="fas fa-trash me-2"></i> Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Card Body -->
                    <div class="card-body">
                      <div class="address-details">
                        <!-- Address Lines -->
                        <div class="mb-2">
                          <small class="text-muted d-block">Address:</small>
                          <div class="text-wrap">
                            <span *ngIf="address.addressNo">{{ address.addressNo }}</span>
                            <span *ngIf="address.floor"> ชั้น {{ address.floor }}</span>
                            <span *ngIf="address.roomNo"> ห้อง {{ address.roomNo }}</span>
                            <span *ngIf="address.building"> {{ address.building }}</span>
                            <span *ngIf="address.moo"> หมู่ {{ address.moo }}</span>
                          </div>
                        </div>

                        <!-- Road/Soi -->
                        <div class="mb-2" *ngIf="address.soi || address.road">
                          <div class="text-wrap">
                            <span *ngIf="address.soi">ซ. {{ address.soi }}</span>
                            <span *ngIf="address.road"> ถ. {{ address.road }}</span>
                          </div>
                        </div>

                        <!-- Location -->
                        <div class="mb-2">
                          <div class="text-wrap">
                            <span *ngIf="address.subdistrict?.subDistrictName">
                              ต. {{ address.subdistrict.subDistrictName }}
                            </span>
                            <span *ngIf="address.district?.districtName">
                              อ. {{ address.district.districtName }}
                            </span>
                          </div>
                          <div class="text-wrap">
                            <span *ngIf="address.province?.provinceName">
                              จ. {{ address.province.provinceName }}
                            </span>
                            <span *ngIf="address.postalCode">
                              {{ address.postalCode }}
                            </span>
                          </div>
                        </div>

                        <!-- Country -->
                        <div *ngIf="address.country && address.country !== 'TH'">
                          <small class="text-muted">Country: {{ address.country }}</small>
                        </div>
                      </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="card-footer bg-light text-muted small">
                      <i class="fas fa-clock me-1"></i>
                      <span *ngIf="address.createdAt">
                        Created: {{ address.createdAt | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Address Type Filter (Optional) -->
              <div class="mt-3" *ngIf="addresses.length > 0">
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn" 
                          [class.btn-primary]="addressTypeFilter === null"
                          [class.btn-outline-primary]="addressTypeFilter !== null"
                          (click)="filterAddressByType(null)">
                    All ({{ addresses.length }})
                  </button>
                  <button type="button" class="btn"
                          [class.btn-primary]="addressTypeFilter === 'CURRENT'"
                          [class.btn-outline-primary]="addressTypeFilter !== 'CURRENT'"
                          (click)="filterAddressByType('CURRENT')">
                    Current ({{ countAddressByType('CURRENT') }})
                  </button>
                  <button type="button" class="btn"
                          [class.btn-primary]="addressTypeFilter === 'REGISTERED'"
                          [class.btn-outline-primary]="addressTypeFilter !== 'REGISTERED'"
                          (click)="filterAddressByType('REGISTERED')">
                    Registered ({{ countAddressByType('REGISTERED') }})
                  </button>
                  <button type="button" class="btn"
                          [class.btn-primary]="addressTypeFilter === 'OFFICE'"
                          [class.btn-outline-primary]="addressTypeFilter !== 'OFFICE'"
                          (click)="filterAddressByType('OFFICE')">
                    Office ({{ countAddressByType('OFFICE') }})
                  </button>
                  <button type="button" class="btn"
                          [class.btn-primary]="addressTypeFilter === 'MAILING'"
                          [class.btn-outline-primary]="addressTypeFilter !== 'MAILING'"
                          (click)="filterAddressByType('MAILING')">
                    Mailing ({{ countAddressByType('MAILING') }})
                  </button>
                </div>
              </div>
            </div>

          <!-- Tab 4: Investment Profile -->
          <div *ngIf="activeTab === 'investment'" class="tab-pane fade show active">
            <div class="row">
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Risk Acceptance</h6>

                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="canAcceptFxRisk"
                      [(ngModel)]="customer.canAcceptFxRisk"
                      id="canAcceptFxRisk">
                    <label class="form-check-label" for="canAcceptFxRisk">
                      Can Accept FX Risk
                    </label>
                  </div>
                </div>

                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="canAcceptDerivativeInvestment"
                      [(ngModel)]="customer.canAcceptDerivativeInvestment"
                      id="canAcceptDerivativeInvestment">
                    <label class="form-check-label" for="canAcceptDerivativeInvestment">
                      Can Accept Derivative Investment
                    </label>
                  </div>
                </div>

                <h6 class="border-bottom pb-2  mt-4">Suitability Assessment</h6>

                <div class="">
                  <label class="form-label">Risk Level (1-8)</label>
                  <ng-select
                  [options]="suitabilityRiskLevelList"
                  valueProp="id"
                  labelProp="name"
                  name="suitabilityRiskLevel"
                  [(ngModel)]="customer.suitabilityRiskLevel"
                  placeholder="Not Assessed">
                </ng-select>
                </div>

                <div class="">
                  <label class="form-label">Evaluation Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="suitabilityEvaluationDate"
                    [(ngModel)]="customer.suitabilityEvaluationDate">
                </div>

                <div class="alert alert-info" *ngIf="customer.suitabilityEvaluationDate">
                  <small>
                    <i class="fas fa-info-circle me-1"></i>
                    Valid until: {{ getSuitabilityExpiryDate() | date:'dd/MM/yyyy' }}
                  </small>
                </div>

                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm"
                  (click)="openSuitabilityModal()">
                  <i class="fas fa-clipboard-list me-1"></i>
                  {{ customer.suitabilityRiskLevel ? 'Re-assess' : 'Take Assessment' }}
                </button>
              </div>

              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">Knowledge Assessment</h6>

                <div class="">
                  <label class="form-label">Assessment Result</label>
                  <div>
                    <span class="badge" 
                          [class.bg-success]="customer.knowledgeAssessmentResult" 
                          [class.bg-warning]="!customer.knowledgeAssessmentResult">
                      {{ customer.knowledgeAssessmentResult ? 'Passed' : 'Not Completed' }}
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm"
                  (click)="openKnowledgeAssessmentModal()">
                  <i class="fas fa-graduation-cap me-1"></i>
                  {{ customer.knowledgeAssessmentResult ? 'Retake' : 'Take Assessment' }}
                </button>

                <h6 class="border-bottom pb-2  mt-4">Investment Objective</h6>

                <div class="">
                  <label class="form-label">Investment Objective</label>
                  <ng-select
                    [options]="investmentObjectiveList"
                    valueProp="id"
                    labelProp="name"
                    name="investmentObjective"
                    [(ngModel)]="customer.investmentObjective"
                    placeholder="Select Objective">
                  </ng-select>
                </div>

                <div class="" *ngIf="customer.investmentObjective === 'OTHER'">
                  <label class="form-label">Objective Other</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="investmentObjectiveOther"
                    [(ngModel)]="customer.investmentObjectiveOther"
                    maxlength="100">
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 5: Compliance -->
          <div *ngIf="activeTab === 'compliance'" class="tab-pane fade show active">
            <div class="row">
              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">FATCA</h6>

                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="fatcaStatus"
                      [(ngModel)]="customer.fatcaStatus"
                      id="fatcaStatus">
                    <label class="form-check-label" for="fatcaStatus">
                      US Person
                    </label>
                  </div>
                </div>

                <div class="">
                  <label class="form-label">FATCA Declaration Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="fatcaDeclarationDate"
                    [(ngModel)]="customer.fatcaDeclarationDate">
                </div>

                <h6 class="border-bottom pb-2  mt-4">CDD (Customer Due Diligence)</h6>

                <div class="">
                  <label class="form-label">CDD Score</label>
                  <ng-select
                    [options]="cddScoreList"
                    valueProp="id"
                    labelProp="name"
                    name="cddScore"
                    [(ngModel)]="customer.cddScore"
                    placeholder="Not Assessed">
                  </ng-select>
                </div>

                <div class="">
                  <label class="form-label">CDD Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="cddDate"
                    [(ngModel)]="customer.cddDate">
                </div>

                <h6 class="border-bottom pb-2  mt-4">NDID</h6>

                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="ndidFlag"
                      [(ngModel)]="customer.ndidFlag"
                      id="ndidFlag">
                    <label class="form-check-label" for="ndidFlag">
                      NDID Verified
                    </label>
                  </div>
                </div>

                <div class="" *ngIf="customer.ndidFlag">
                  <label class="form-label">NDID Request ID</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="ndidRequestId"
                    [(ngModel)]="customer.ndidRequestId"
                    readonly>
                </div>
              </div>

              <div class="col-md-6">
                <h6 class="border-bottom pb-2 ">CRS (Common Reporting Standard)</h6>

                <div class="">
                  <label class="form-label">Place of Birth - Country</label>
                  <ng-select
                    [options]="countryList"
                    valueProp="id"
                    labelProp="name"
                    name="crsPlaceOfBirthCountry"
                    [(ngModel)]="customer.crsPlaceOfBirthCountry"
                    placeholder="Select Country">
                  </ng-select>
                </div>

                <div class="">
                  <label class="form-label">Place of Birth - City</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="crsPlaceOfBirthCity"
                    [(ngModel)]="customer.crsPlaceOfBirthCity"
                    maxlength="100">
                </div>

                <div class="">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="crsTaxResidenceOtherThanUS"
                      [(ngModel)]="customer.crsTaxResidenceOtherThanUS"
                      id="crsTaxResidenceOtherThanUS">
                    <label class="form-check-label" for="crsTaxResidenceOtherThanUS">
                      Tax Residence in Countries Other Than US
                    </label>
                  </div>
                </div>

                <div class="">
                  <label class="form-label">CRS Declaration Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="crsDeclarationDate"
                    [(ngModel)]="customer.crsDeclarationDate">
                </div>

                <div *ngIf="customer.crsTaxResidenceOtherThanUS">
                  <h6 class="text-muted ">Tax Residence Details</h6>
                  
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-primary "
                    (click)="addCrsDetail()">
                    <i class="fas fa-plus me-1"></i>
                    Add Tax Residence
                  </button>

                  <div class="table-responsive" *ngIf="crsDetails.length > 0">
                    <table class="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th>TIN</th>
                          <th>Reason</th>
                          <th width="80">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let detail of crsDetails; let i = index">
                          <td>{{ detail.countryOfTaxResidence }}</td>
                          <td>{{ detail.tin || '-' }}</td>
                          <td>{{ detail.reasonDesc || '-' }}</td>
                          <td>
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-primary"
                              (click)="editCrsDetail(i)">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-danger"
                              (click)="deleteCrsDetail(i)">
                              <i class="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 6: Related Persons -->
          <div *ngIf="activeTab === 'related' && customer.customerType === 'Juristic'" class="tab-pane fade show active">
            <!-- Sub-tabs for Related Person Types -->
             

            <!-- persons -->
            <div >
              <div class="d-flex justify-content-between align-items-center ">
              
                <button type="button" class="btn btn-sm btn-primary" (click)="openRelatePerson()">
                  <i class="fas fa-plus me-1"></i> Add Person
                </button>
              </div>
              
               <div *ngFor="let group of groupedRelations" class="mb-4">

              <!-- หัวกลุ่มตาม relationType -->
              <h5 class="mt-3 mb-2 text-muted">
                {{ relationTypeLabel(group.relationType) }}
              </h5>

              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Name (TH)</th>
                    <th>Name (EN)</th>
                    <th>ID Card Number</th>
                    <th>Nationality</th>
                    <th class="text-center">Authorized</th>
                    <th class="text-center">CEO</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let person of group.persons" class="clickable-row">
                    <td>{{ person.firstNameTh }} {{ person.lastNameTh }}</td>
                    <td>{{ person.firstNameEn }} {{ person.lastNameEn }}</td>
                    <td>{{ person.cardNumber }}</td>
                    <td>{{ person.nationality }}</td>
                    <td class="text-center">
                      <i class="fa fa-check text-success" *ngIf="person.isAuthorized"></i>
                      <i class="fa fa-times text-danger" *ngIf="!person.isAuthorized"></i>
                    </td>
                    <td class="text-center">
                      <i class="fa fa-check text-success" *ngIf="person.isChiefExecutive"></i>
                      <i class="fa fa-times text-danger" *ngIf="!person.isChiefExecutive"></i>
                    </td>
                    <td class="text-center">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" 
                              (click)="openRelatePerson(person)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" 
                              (click)="deleteRelatedPerson('person', person)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>

            </div>
  
          </div>
 
        <!-- Tab 8: Accounts & Unitholders -->
        <div *ngIf="activeTab === 'accounts'" class="tab-pane fade show active">
  <!-- Summary Section -->
   

  <!-- Accounts Section -->
  
        <button type="button" class="btn btn-primary btn-sm" (click)="onAddAccount()">
          <i class="fas fa-plus me-1"></i> Open New Account
        </button>
       <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 50px;"></th>
              <th>Account Code</th>
              <th>Account Type</th>
              <th>Open Date</th>
              <th>Status</th>
              <th class="text-end">Total AUM</th>
              <th class="text-center">Bank Accounts</th>
              <th class="text-center">Unitholders</th>
              <th class="text-center" style="width: 120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let account of customer.accounts; let i = index">
              <!-- Account Row -->
              <tr class="account-row" [class.table-active]="account.expanded">
                <td class="text-center">
                  <button class="btn btn-sm btn-link p-0" style="box-shadow: none;"  type="button"
                          (click)="toggleAccount(account)">
                    <i class="fas" 
                       [class.fa-chevron-right]="!account.expanded"
                       [class.fa-chevron-down]="account.expanded"
                       [class.text-primary]="account.expanded"></i>
                  </button>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                      <strong>{{ account.accountCode }}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge bg-white text-dark" 
                        [class.bg-primary]="account.accountType === 'Normal'"
                        [class.bg-info]="account.accountType === 'Joint'"
                        [class.bg-warning]="account.accountType === 'By'">
                    <i class="fas" 
                       [class.fa-user]="account.accountType === 'Normal'"
                       [class.fa-users]="account.accountType === 'Joint'"
                       [class.fa-baby]="account.accountType === 'By'"
                       class="me-1"></i>
                    {{ account.accountType }}
                  </span>
                </td>
                <td>{{ account.openDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge bg-white text-dark" 
                        [class.bg-success]="account.status === 'Active'"
                        [class.bg-secondary]="account.status === 'Closed'">
                    <i class="fas fa-circle me-1" style="font-size: 0.6rem;"></i>
                    {{ account.status }}
                  </span>
                </td>
                <td class="text-end">
                  <strong class="text-primary">{{ account.totalAum | number:'1.2-2' }}</strong>
                  
                </td>
                <td class="text-center">
                  <span class="badge bg-info">
                    <i class="fas fa-university me-1"></i>
                    {{ account.bankAccounts.length }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-success">
                    <i class="fas fa-building me-1"></i>
                    {{ account.unitholders.length }}
                  </span>
                </td>
                <td class="text-center">
                  
                    <button type="button" 
                            class="btn btn-sm btn-outline-primary me-1" 
                            (click)="editAccount(account)"
                            title="Edit Account">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" 
                            class="btn btn-sm btn-outline-danger" 
                            (click)="deleteAccount(account)"
                            title="Delete Account">
                      <i class="fas fa-trash"></i>
                    </button>
                 
                </td>
              </tr>

              <!-- Expanded Content -->
              <tr *ngIf="account.expanded" class="expanded-row">
                <td colspan="9" class="p-0">
                  <div class="expanded-content bg-light">
                    <div class="row g-0">
                      <!-- Bank Accounts Section -->
                      <div class="col-md-6 border-end">
                        <div class="p-3">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">
                              <i class="fas fa-university text-info me-2"></i>
                              Bank Accounts
                            </h6>
                            <button type="button" 
                                    class="btn btn-sm btn-outline-primary" 
                                    (click)="openBankAccount(account)">
                              <i class="fas fa-plus me-1"></i> Add Bank
                            </button>
                          </div>

                          <div *ngIf="account.bankAccounts.length === 0" 
                               class="text-center text-muted py-4">
                            <i class="fas fa-university fa-2x mb-2 opacity-25"></i>
                            <p class="mb-0 small">No bank accounts</p>
                          </div>

                          <div class="list-group list-group-flush">
                            <div *ngFor="let bank of account.bankAccounts" 
                                 class="list-group-item border rounded mb-2 p-3 bg-white">
                              <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                  <div class="d-flex align-items-center mb-2">
                                    <i class="fas fa-university text-info me-2"></i>
                                    <strong>{{ bank.bankName }}</strong>
                                    <span *ngIf="bank.isPrimary" 
                                          class="badge bg-warning text-dark ms-2">
                                      <i class="fas fa-star me-1"></i>Primary
                                    </span>
                                  </div>
                                  <div class="small text-muted">
                                    <div class="mb-1">
                                      <i class="fas fa-code-branch me-1"></i>
                                      Branch: {{ bank.branchCode }}
                                    </div>
                                    <div class="mb-1">
                                      <i class="fas fa-hashtag me-1"></i>
                                      Account: {{ bank.accountNumber }}
                                    </div>
                                    <div class="mb-1">
                                      <i class="fas fa-user me-1"></i>
                                      Name: {{ bank.accountName }}
                                    </div>
                                    <div>
                                      <i class="fas fa-dollar-sign me-1"></i>
                                      Currency: <span class="badge bg-light text-dark">{{ bank.currency }}</span>
                                    </div>
                                  </div>
                                </div>
                                <div class="ms-2">
                                  <button type="button" 
                                          class="btn btn-sm btn-outline-warning me-1" 
                                          (click)="openBankAccount(account,bank)"
                                          title="Edit">
                                    <i class="fas fa-edit"></i>
                                  </button>
                                  <button type="button" 
                                          class="btn btn-sm btn-outline-danger" 
                                          (click)="deleteBankAccount(bank)"
                                          title="Delete">
                                    <i class="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Unitholders Section -->
                      <div class="col-md-6">
                        <div class="p-3">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">
                              <i class="fas fa-building text-success me-2"></i>
                              Unitholders
                            </h6>
                            <button type="button" 
                                    class="btn btn-sm btn-outline-success" 
                                    (click)="addUnitholder(account)">
                              <i class="fas fa-plus me-1"></i> Add Unitholder
                            </button>
                          </div>

                          <div *ngIf="account.unitholders.length === 0" 
                               class="text-center text-muted py-4">
                            <i class="fas fa-building fa-2x mb-2 opacity-25"></i>
                            <p class="mb-0 small">No unitholders</p>
                          </div>

                          <div class="list-group list-group-flush">
                            <div *ngFor="let uh of account.unitholders" 
                                 class="list-group-item border rounded mb-2 p-3 bg-white">
                              <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                  <div class="d-flex align-items-center mb-2">
                                    <i class="fas fa-building text-success me-2"></i>
                                    UnitholderNo: <strong>{{ uh.externalUnitholderId }}</strong>
                                  </div>
                                  <div class="small text-muted">
                                    <div class="mb-1">
                                      <i class="fas fa-university me-1"></i>
                                      OpenDate: <span class="badge bg-light text-dark">{{ uh.openDate |date: 'dd/MM/yyyy' }}</span>
                                    </div>
                                    <div class="mb-1">
                                      <i class="fas fa-tag me-1"></i>
                                      Type: <span class="badge bg-secondary">{{ uh.unitholderType }}</span>
                                    </div>
                                    <div class="mb-1">
                                      <i class="fas fa-dollar-sign me-1"></i>
                                      Currency: <span class="badge bg-light text-dark">{{ uh.currency }}</span>
                                    </div>
                                    <div>
                                      <i class="fas fa-circle me-1" style="font-size: 0.6rem;"></i>
                                      Status: 
                                      <span class="badge" 
                                            [class.bg-success]="uh.status === 'ACTIVE'"
                                            [class.bg-secondary]="uh.status === 'CLOSED'">
                                        {{ uh.status }}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div class="ms-2">
                                  <button type="button" 
                                          class="btn btn-sm btn-outline-warning me-1" 
                                          (click)="editUnitholder(uh)"
                                          title="Edit">
                                    <i class="fas fa-edit"></i>
                                  </button>
                                  <button type="button" 
                                          class="btn btn-sm btn-outline-danger" 
                                          (click)="deleteUnitholder(uh)"
                                          title="Delete">
                                    <i class="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>

            <!-- Empty State -->
            <tr *ngIf="customer.accounts.length === 0">
              <td colspan="9" class="text-center py-5">
                <div class="text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
                  <p class="mb-2">No accounts found</p>
                  <button type="button" class="btn btn-primary btn-sm" (click)="onAddAccount()">
                    <i class="fas fa-plus me-1"></i> Open First Account
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
                      
        </div>

        <!-- Tab 9: Documents -->
        <div *ngIf="activeTab === 'documents'" class="tab-pane fade show active">
          <div class="row ">
            <div class="col-md-12">
              <div class="row">
                    <div class="col-md-3">
                      <ng-select
                        [options]="documentTypeList"
                        valueProp="id"
                        labelProp="nameTh"
                        [(ngModel)]="uploadMetadata.documentTypeId"
                        name="documentTypeId"
                        placeholder="Select Document Type">
                      </ng-select>
                    </div>
                    <div class="col-md-3">
                      <input type="file" class="form-control" (change)="onFileSelected($event)" #fileInput>
                    </div>
                    <div class="col-md-3">
                      <input 
                        type="text" 
                        class="form-control" 
                        [(ngModel)]="uploadMetadata.description" 
                        name="description"
                        placeholder="Description (optional)">
                    </div>
                 
                    <div class="col-md-3 mt-2">
                    <button 
                      type="button" 
                      class="btn btn-primary btn-sm"
                      (click)="uploadFile()"
                      [disabled]="!uploadMetadata.documentTypeId || !selectedFiles">
                      <i class="fas fa-upload me-1"></i> Upload
                    </button>
                  </div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover custom-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th></th>
                  <th>File Name</th>
                  <th>Description</th>
                  <th>Upload Date</th>
                 
                  <th class="text-center" style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of customer.documents">
                  <td><span class="badge bg-info">{{ doc.documentType.code }}</span></td>
                  <td><i class="fas" [ngClass]="getFileIcon(doc.fileName)"></i> </td>
                  <td> {{ doc.fileName }}</td>
                  <td>{{ doc.description || '-' }}</td>
                  <td>{{ doc.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>

                  <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-primary me-1" 
                    
                      (click)="viewDocument(doc)">
                      <i class="fas fa-eye"></i>
                    </button> 
                    <button type="button" class="btn btn-sm btn-outline-success me-1" 
                      (click)="downloadDocument(doc)">
                      <i class="fas fa-download"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                      (click)="deleteDocument(doc)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 10: Audit Trail -->
        <div *ngIf="activeTab === 'audit'" class="tab-pane fade show active">
          <div class="">
            <div class="row g-2">
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="auditFilter.action" name="auditAction">
                  <option value="">All Actions</option>
                  <option value="CREATED">Created</option>
                  <option value="UPDATED">Updated</option>
                  <option value="STATUS_CHANGED">Status Changed</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>
              <div class="col-md-3">
                <input 
                  type="date" 
                  class="form-control form-control-sm" 
                  [(ngModel)]="auditFilter.dateFrom" 
                  name="auditDateFrom">
              </div>
              <div class="col-md-3">
                <input 
                  type="date" 
                  class="form-control form-control-sm" 
                  [(ngModel)]="auditFilter.dateTo" 
                  name="auditDateTo">
              </div>
              <div class="col-md-3">
                <button type="button" class="btn btn-sm btn-primary" (click)="filterAuditTrail()">
                  <i class="fas fa-filter me-1"></i> Filter
                </button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-hover custom-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Action</th>
                  <th>Field Changed</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Changed By</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of mockAuditLogs">
                  <td>{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  <td>
                    <span class="badge" 
                          [class.bg-success]="log.action === 'CREATED'"
                          [class.bg-info]="log.action === 'UPDATED'"
                          [class.bg-warning]="log.action === 'STATUS_CHANGED'"
                          [class.bg-danger]="log.action === 'DELETED'">
                      {{ log.action }}
                    </span>
                  </td>
                  <td>{{ log.fieldName }}</td>
                  <td><small class="text-muted">{{ log.oldValue || '-' }}</small></td>
                  <td><small>{{ log.newValue || '-' }}</small></td>
                  <td>{{ log.changedBy }}</td>
                  <td><small class="text-muted">{{ log.ipAddress }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>

        <!-- Footer Buttons -->
        <div class="card-footer">
          <div class="d-flex justify-content-end">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="myForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i class="fas fa-save me-1" *ngIf="!isSubmitting"></i>
              {{ isSubmitting ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
              <i class="fas fa-times me-1"></i>
              Cancel
            </button>
           <!-- <button 
              type="button" 
              class="btn btn-success ms-2" 
              *ngIf="isEditMode"
              (click)="onSaveAndOpenAccount()">
              <i class="fas fa-folder-plus me-1"></i>
              Save & Open Account
            </button>-->
          </div>
        </div>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .card-header {
      background-color: #fff;
    }

    .card-header-tabs {
      margin-bottom: 0;
      flex-wrap: wrap;
    }

    .card-header-tabs .nav-link {
      color: #6c757d;
      border: none;
      border-bottom: 3px solid transparent;
   
      font-size: 0.875rem;
      background: transparent;
    }

    .card-header-tabs .nav-link:hover {
      color: var(--primary-500);
      border-bottom-color: var(--primary-500);
    }

    .card-header-tabs .nav-link.active {
      color: #000;
      background: transparent;
      border: none;
      border-bottom: 3px solid var(--primary-500);
      font-weight: 600;
    }

    .card-header-tabs .nav-link i {
      font-size: 0.875rem;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
    }

    input:checked + .slider {
      background-color: #28a745;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .slider.round {
      border-radius: 24px;
    }

    .slider.round:before {
      border-radius: 50%;
    }
    .address-card .card {
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border-radius: 0.375rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      background-color: #fff;
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  // Customer object
  customer: any = {
    status: "Pending"
  };

  isEditMode = false;
  isSubmitting = false;
  activeTab = 'basic';
  addresses: any[] = [];
  allAddresses: any[] = [];
  isLoadingAddresses = false;
  addressTypeFilter: string | null = null;

  // Add these properties to CustomerFormComponent class
  loading = false;
  // Document Upload Properties
  selectedFiles: File = null as any;
  isUploading = false;
  uploadProgress = 0;
  uploadMetadata: any = {
 
  };

  documentCategoryList: any[] = [];
  customerDocuments: any[] = [];

  // Document Type List
  documentTypeList: any[] = [];


  customerTypeList = [
    { id: 'Individual', name: 'Individual' },
    { id: 'Juristic', name: 'Juristic' },
    { id: 'Minor', name: 'Minor' },
    { id: 'Foreign', name: 'Foreign Individual' }
  ];
  // Identification & Document Types
  identificationCardTypeList = [
    { id: 'CITIZEN_CARD', name: 'Citizen Card', nameTh: 'บัตรประชาชน' },
    { id: 'PASSPORT', name: 'Passport', nameTh: 'หนังสือเดินทาง' },
    { id: 'ALIEN', name: 'Alien Card', nameTh: 'บัตรคนต่างด้าว' }
  ];

  // Countries (ใช้ร่วมกันได้)
  countryList = [
    { id: 'TH', name: 'Thailand', nameTh: 'ไทย' },
    { id: 'US', name: 'United States', nameTh: 'สหรัฐอเมริกา' },
    { id: 'GB', name: 'United Kingdom', nameTh: 'สหราชอาณาจักร' },
    { id: 'JP', name: 'Japan', nameTh: 'ญี่ปุ่น' },
    { id: 'CN', name: 'China', nameTh: 'จีน' }
  ];

  // Titles
  titleThList = [
    { id: 'นาย', name: 'นาย' },
    { id: 'นาง', name: 'นาง' },
    { id: 'นางสาว', name: 'นางสาว' },
    { id: 'OTHER', name: 'อื่นๆ' }
  ];

  titleEnList = [
    { id: 'Mr.', name: 'Mr.' },
    { id: 'Mrs.', name: 'Mrs.' },
    { id: 'Miss', name: 'Miss' },
    { id: 'OTHER', name: 'Other' }
  ];

  // Company Types
  companyTypeList = [
    { id: 'LIMITED', name: 'Limited Company', nameTh: 'บริษัทจำกัด' },
    { id: 'PUBLIC', name: 'Public Company', nameTh: 'บริษัทมหาชน' },
    { id: 'PARTNERSHIP', name: 'Partnership', nameTh: 'ห้างหุ้นส่วน' },
    { id: 'FOUNDATION', name: 'Foundation', nameTh: 'มูลนิธิ' }
  ];

  // Marital Status
  maritalStatusList = [
    { id: 'Single', name: 'Single', nameTh: 'โสด' },
    { id: 'Married', name: 'Married', nameTh: 'สมรส' },
    { id: 'Divorced', name: 'Divorced', nameTh: 'หย่า' },
    { id: 'Widowed', name: 'Widowed', nameTh: 'หม้าย' }
  ];

  // Income Levels
  monthlyIncomeLevelList = [
    { id: 'LEVEL1', name: 'Level 1: < 15,000 THB', nameTh: 'ระดับ 1: น้อยกว่า 15,000 บาท' },
    { id: 'LEVEL2', name: 'Level 2: 15,000 - 30,000 THB', nameTh: 'ระดับ 2: 15,000 - 30,000 บาท' },
    { id: 'LEVEL3', name: 'Level 3: 30,001 - 50,000 THB', nameTh: 'ระดับ 3: 30,001 - 50,000 บาท' },
    { id: 'LEVEL4', name: 'Level 4: 50,001 - 100,000 THB', nameTh: 'ระดับ 4: 50,001 - 100,000 บาท' },
    { id: 'LEVEL5', name: 'Level 5: 100,001 - 200,000 THB', nameTh: 'ระดับ 5: 100,001 - 200,000 บาท' },
    { id: 'LEVEL6', name: 'Level 6: 200,001 - 500,000 THB', nameTh: 'ระดับ 6: 200,001 - 500,000 บาท' },
    { id: 'LEVEL7', name: 'Level 7: 500,001 - 1,000,000 THB', nameTh: 'ระดับ 7: 500,001 - 1,000,000 บาท' },
    { id: 'LEVEL8', name: 'Level 8: > 1,000,000 THB', nameTh: 'ระดับ 8: มากกว่า 1,000,000 บาท' }
  ];

  // Income Source
  incomeSourceList = [
    { id: 'SALARY', name: 'Salary', nameTh: 'เงินเดือน' },
    { id: 'BUSINESS', name: 'Business', nameTh: 'ธุรกิจ' },
    { id: 'INVESTMENT', name: 'Investment', nameTh: 'การลงทุน' },
    { id: 'INHERITANCE', name: 'Inheritance', nameTh: 'มรดก' },
    { id: 'OTHER', name: 'Other', nameTh: 'อื่นๆ' }
  ];

  // Suitability Risk Level
  suitabilityRiskLevelList = [
    { id: '', name: 'Not Assessed', nameTh: 'ยังไม่ได้ประเมิน' },
    { id: '1', name: '1 (Very Conservative)', nameTh: '1 (อนุรักษ์นิยมมาก)' },
    { id: '2', name: '2 (Conservative)', nameTh: '2 (อนุรักษ์นิยม)' },
    { id: '3', name: '3 (Moderately Conservative)', nameTh: '3 (ค่อนข้างอนุรักษ์นิยม)' },
    { id: '4', name: '4 (Moderate)', nameTh: '4 (ปานกลาง)' },
    { id: '5', name: '5 (Moderately Aggressive)', nameTh: '5 (ค่อนข้างก้าวร้าว)' },
    { id: '6', name: '6 (Aggressive)', nameTh: '6 (ก้าวร้าว)' },
    { id: '7', name: '7 (Very Aggressive)', nameTh: '7 (ก้าวร้าวมาก)' },
    { id: '8', name: '8 (Speculative)', nameTh: '8 (เก็งกำไร)' }
  ];

  // Investment Objective
  investmentObjectiveList = [
    { id: 'Capital Growth', name: 'Capital Growth', nameTh: 'เติบโตของเงินทุน' },
    { id: 'Income', name: 'Income', nameTh: 'รายได้' },
    { id: 'Speculation', name: 'Speculation', nameTh: 'เก็งกำไร' },
    { id: 'Retirement', name: 'Retirement', nameTh: 'เกษียณอายุ' },
    { id: 'Education', name: 'Education', nameTh: 'การศึกษา' },
    { id: 'OTHER', name: 'Other', nameTh: 'อื่นๆ' }
  ];

  // CDD Score
  cddScoreList = [
    { id: '', name: 'Not Assessed', nameTh: 'ยังไม่ได้ประเมิน' },
    { id: '1', name: '1 (Low Risk)', nameTh: '1 (ความเสี่ยงต่ำ)' },
    { id: '2', name: '2 (Medium Risk)', nameTh: '2 (ความเสี่ยงปานกลาง)' },
    { id: '3', name: '3 (High Risk)', nameTh: '3 (ความเสี่ยงสูง)' }
  ];


  activeAddressTab = 'idDocument';

  crsDetails: any[] = [];
  occupationList: any[] = [];
  businessTypeList: any[] = [];

  // Master data


  constructor(
    private httpService: HttpService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private modal: ModalService,
    private alert: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadMasterData();

    const customerId = this.route.snapshot.params['id'];
    if (customerId) {
      this.isEditMode = true;
      this.loadCustomer(customerId);
    }
  }

  // Add to CustomerFormComponent class
  get groupedRelations() {
    const groups: { [key: string]: any[] } = {};

    const persons = this.customer?.customerRelationsPersons ?? [];

    for (const p of persons) {
      const key = p.relationType || 'OTHER';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(p);
    }

    // แปลงเป็น array เพื่อใช้ *ngFor ง่าย ๆ
    return Object.entries(groups).map(([relationType, persons]) => ({
      relationType,
      persons,
    }));
  }
  openAddressModal(address?: any) {
    this.modal.show({
      component: AddressModalComponent,
      title: address ? 'Edit Address' : 'Add New Address',
      size: 'lg',
      data: {
        item: address ? { ...address } : { customerId: this.customer.id },
      },
    }).then(result => {
      if (result) {
        // this.loadCustomer(this.customer.id); // Reload customer data to refresh addresses
      }
    });
  }

  deleteAddress(id: number) {

    this.alert.confirm(
      { title: 'Confirm Delete', message: 'Are you sure you want to delete this address?' }
    ).then(confirmed => {
      if (confirmed) {
        this.httpService.delete(`/address/delete/${id}`).subscribe({
          next: (response: any) => {
            this.alert.success('Address deleted successfully.');
            this.loadCustomer(this.customer.id);
          },
          error: (err) => {
            console.error('Error deleting address:', err);
            this.alert.error(err.error?.message || 'Failed to delete address', 'Error!');
          }
        });
      }
    });

  }

  setAddressPrimary(id: number) {
    this.httpService.put(`/address/set-primary/${id}`, {}).subscribe({
      next: (response: any) => {
        this.alert.success('Primary address updated.');
        this.loadCustomer(this.customer.id); // Reload customer data to refresh addresses
      },
      error: (err) => {
        console.error('Error setting primary address:', err);
        this.alert.error(err.error?.message || 'Failed to update primary address', 'Error!');
      }
    });
  }

  getAddressTypeLabel(type: string): string {
    const types: any = {
      'CURRENT': 'ที่อยู่ปัจจุบัน',
      'REGISTERED': 'ทะเบียนบ้าน',
      'OFFICE': 'ที่ทำงาน',
      'MAILING': 'จัดส่งเอกสาร'
    };
    return types[type] || type;
  }

  filterAddressByType(type: string | null) {
    this.addressTypeFilter = type;
    if (type === null) {
      this.addresses = this.allAddresses;
    } else {
      this.addresses = this.allAddresses.filter(addr => addr.addressType === type);
    }
  }

  countAddressByType(type: string): number {
    return this.allAddresses.filter(addr => addr.addressType === type).length;
  }
  // เอาไว้ convert code -> label สวย ๆ
  relationTypeLabel(type: string): string {
    const relation = this.relationTypeList.find(r => r.id === type);
    return relation ? relation.name : type;
  }

  relationTypeList = [
    { id: 'DIRECTOR', name: 'กรรมการ' },
    { id: 'SHAREHOLDER', name: 'ผู้ถือหุ้น' },
    { id: 'AUTHORIZED_PERSON', name: 'ผู้มีอำนาจลงนาม' },
    { id: 'BENEFICIAL_OWNER', name: 'ผู้เป็นเจ้าของผลประโยชน์' },
    { id: 'REPRESENTATIVE', name: 'ผู้แทน' },
    { id: 'OTHER', name: 'อื่นๆ' }
  ];



  getSuitabilityExpiryDate() {
    if (!this.customer.suitabilityEvaluationDate) return null;
    const date = new Date(this.customer.suitabilityEvaluationDate);
    date.setFullYear(date.getFullYear() + 2); // Valid for 2 years
    return date;
  }

  openSuitabilityModal() {
    // Open modal for suitability questionnaire
    console.log('Open suitability modal');
  }

  openKnowledgeAssessmentModal() {
    // Open modal for knowledge assessment
    console.log('Open knowledge assessment modal');
  }

  addCrsDetail() {
    this.crsDetails.push({
      countryOfTaxResidence: '',
      tin: '',
      reason: '',
      reasonDesc: ''
    });
  }

  editCrsDetail(index: number) {
    // Open modal to edit CRS detail
    console.log('Edit CRS detail', index);
  }

  deleteCrsDetail(index: number) {
    if (confirm('Remove this tax residence?')) {
      this.crsDetails.splice(index, 1);
    }
  }
  loadMasterData() {
    this.httpService.get('/customer/getdata').subscribe({
      next: (data: any) => {
        this.businessTypeList = data.businessTypes || [];
        this.occupationList = data.occupations;
        this.documentTypeList = data.documentTypes || [];
      },
      error: (error) => {
        console.error('Failed to load master data', error);
      }
    });

  }

  loadCustomer(customerId: number) {
    this.loading=true;
    this.httpService.get(`/customer/get/${customerId}`).subscribe({
      next: (response: any) => {
        this.customer = response;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to load customer data', 'Error!');
        this.onCancel();
      },
      complete: () => {
        this.loading=false;
      }
    });
  }

  onAddAccount() {
    var account: any = { customerId: this.customer.id };
    this.modal.show({
      component: AccountModalComponent,
      title: 'Add New Account',
      size: 'lg',
      data: {
        item: account, // ส่ง customerId หรับ Minor Account
      }
    }).then(result => {
      if (result) {
        this.loadCustomer(this.customer.id); // Reload account list
      }
    });
  }


  onSubmit(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.toast.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    this.httpService.post("/customer/post", this.customer).subscribe({
      next: (response) => {
        this.toast.success(
          `Customer successfully ${this.isEditMode ? 'updated' : 'created'}`,
          'Success'
        );
        this.onCancel();
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Failed to save customer';
        this.toast.error(errorMessage, 'Error');
        console.error('Error saving customer:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/investor/customer']);
  }

  onSaveAndOpenAccount() {
    // Save first, then navigate to account creation
    this.httpService.post("/customer/post", this.customer).subscribe({
      next: (response: any) => {
        this.toast.success('Customer saved successfully', 'Success');
        this.router.navigate(['/account/create'], {
          queryParams: { customerId: response.id }
        });
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to save customer', 'Error');
      }
    });
  }

  // Add to CustomerFormComponent class

  activeRelatedTab = 'persons';

 

  mockAuditLogs: any[] = [
    {
      id: 1, timestamp: '2024-11-20T10:30:00', action: 'CREATED', fieldName: 'Customer',
      oldValue: null, newValue: 'Created', changedBy: 'Admin', ipAddress: '192.168.1.100'
    },
    {
      id: 2, timestamp: '2024-11-20T11:15:00', action: 'UPDATED', fieldName: 'Email',
      oldValue: 'old@email.com', newValue: 'new@email.com', changedBy: 'Admin', ipAddress: '192.168.1.100'
    },
    {
      id: 3, timestamp: '2024-11-20T14:20:00', action: 'STATUS_CHANGED', fieldName: 'Status',
      oldValue: 'Pending', newValue: 'Active', changedBy: 'Manager', ipAddress: '192.168.1.105'
    }
  ];
 

  auditFilter: any = {
    action: '',
    dateFrom: '',
    dateTo: ''
  };

  openRelatePerson(person: any = null) {
    if (!person) {
      person = {
        customerId: this.customer.id
      };
    }
    this.modal.show({
      component: RelatePersonModalComponent,
      title: 'Add Related Person',
      size: 'lg',
      data: {
        item: person // ส่ง customerId
      }
    }).then(result => {
      if (result) {
        //this.loadRelatedPersons(); // Reload list
        this.loadCustomer(this.customer.id); // Reload customer to get updated relations

      }
    });
  }


  deleteRelatedPerson(type: string, person: any) {
    this.alert.confirm(
      { title: 'Confirm Deletion', message: `Are you sure you want to delete this related person?` }
    ).then(confirmed => {
      if (confirmed) {
        // Call API to delete
        this.httpService.delete('/customer/relateperson/delete/' + person.id).subscribe({
          next: () => {
            this.toast.success('Related person deleted', 'Success');
            this.loadCustomer(this.customer.id); // Reload customer to get updated relations
          },
          error: (error) => {
            this.toast.error(error?.error?.message || 'Failed to delete related person', 'Error');
          }
        });
      }
    });
  }



  deleteBankAccount(bank: any) {
    this.alert.confirm(
      { title: 'Confirm Deletion', message: `Are you sure you want to delete bank account ${bank.accountNumber}?` }
    ).then(confirmed => {
      if (confirmed) {
        // Call API to delete
        this.httpService.delete('/customer/bankaccount/delete/' + bank.id).subscribe({
          next: () => {
            this.toast.success('Bank account deleted', 'Success');
            this.loadCustomer(this.customer.id); // Reload customer to get updated bank accounts
          },
          error: (error) => {
            this.toast.error(error?.error?.message || 'Failed to delete bank account', 'Error');
          }
        });
      }
    });
  }

  onOpenNewAccount() {
    this.router.navigate(['/account/create'], {
      queryParams: { customerId: this.customer.id }
    });
  }

  viewAccountDetails(account: any) {
    this.router.navigate(['/account/view', account.id]);
  }

  viewUnitholderDetails(unitholder: any) {
    console.log('View unitholder', unitholder);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles = file;
    }
  }
 
 

  filterAuditTrail() {
    console.log('Filter audit trail', this.auditFilter);
    this.toast.info('Filtering audit trail...', 'Info');
  }

  // Add these methods to your component

  toggleAccount(account: any) {
    account.expanded = !account.expanded;
  }




  openBankAccount(account: any, bank: any = null) {
    if (!bank) {
      bank = {
        accountId: account.id
      };
    }
    this.modal.show({
      component: BankAccountModalComponent,
      title: bank.id ? 'Edit Bank Account' : 'Add Bank Account',
      size: 'lg',
      data: {
        item: bank  // ส่ง customerId
      }
    }).then(result => {
      if (result) {
        this.toast.success(`Bank account ${bank.id ? 'updated' : 'added'} successfully`, 'Success');
        this.loadCustomer(this.customer.id); // Reload customer to get updated bank accounts
      }
    });
  }



  deleteAccount(account: any) {
    this.alert.confirm(
      { title: 'Confirm Deletion', message: `Are you sure you want to delete account ${account.accountCode}?` }
    ).then(confirmed => {
      if (confirmed) {
        this.httpService.delete('/account/delete/' + account.id).subscribe({
          next: () => {
            this.toast.success('Account deleted', 'Success');
            this.loadCustomer(this.customer.id); // Reload account list
          },
          error: (error) => {
            this.toast.error(error?.error?.message || 'Failed to delete account', 'Error');
          }
        });
      }
    });
  }

  addUnitholder(account: any) {
    // Open unitholder modal with accountCode
    this.modal.show({
      component: UnitholderModalComponent,
      title: 'Add New Unitholder',
      size: 'lg',
      data: {
        item: { accountId: account.id } // For adding
      }
    }).then(result => {
      if (result) {
        this.loadCustomer(this.customer.id); // Reload account list   

      }
    });
  }

  editUnitholder(unitholder: any) {
    this.modal.show({
      component: UnitholderModalComponent,
      title: 'Add New Unitholder',
      size: 'lg',
      data: {
        item: unitholder // For adding
      }
    }).then(result => {
      if (result) {
        this.loadCustomer(this.customer.id); // Reload account list   

      }
    });
  }

  deleteUnitholder(unitholder: any) {
    this.alert.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete unitholder ${unitholder.fullName}?`
    }).then(confirmed => {
      if (confirmed) {
        this.httpService.delete('/account/unitholder/delete/' + unitholder.id).subscribe({
          next: () => {
            this.toast.success('Unitholder deleted', 'Success');
            this.loadCustomer(this.customer.id); // Reload account list   
          },
          error: (error) => {
            this.toast.error(error?.error?.message || 'Failed to delete unitholder', 'Error');
          }
        });
      }
    });
  }


  editAccount(account: any) {
    this.modal.show({
      component: AccountModalComponent,
      title: 'Add New Account',
      size: 'lg',
      data: {
        item: account // For editing
      }
    }).then(result => {
      if (result) {
        this.loadCustomer(this.customer.id); // Reload account list
      }
    });
  }
 

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons: any = {
      'pdf': 'fa-file-pdf text-danger',
      'doc': 'fa-file-word text-primary',
      'docx': 'fa-file-word text-primary',
      'xls': 'fa-file-excel text-success',
      'xlsx': 'fa-file-excel text-success',
      'jpg': 'fa-file-image text-info',
      'jpeg': 'fa-file-image text-info',
      'png': 'fa-file-image text-info',
      'gif': 'fa-file-image text-info'
    };
    return icons[ext || ''] || 'fa-file text-secondary';
  }

  uploadFile() {
    if (!this.uploadMetadata.documentTypeId) {
      this.toast.warning('Please select document type', 'Validation Error');
      return;
    }

    if (!this.selectedFiles) {
      this.toast.warning('Please select at least one file', 'Validation Error');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Create FormData
    const formData = new FormData();

    const file = this.selectedFiles;
    // Append files
    formData.append('file', file, file.name);

    // Prepare metadata
    const metadata = {
      customerId: this.customer.id,
      documentTypeId: this.uploadMetadata.documentTypeId,
      description: this.uploadMetadata.description || ''
    };

    // Append metadata as JSON
    formData.append('jsonData', JSON.stringify(metadata));

    // Upload with progress
    this.httpService.postWithProgress('/document/upload', formData).subscribe({
      next: (event: any) => {
        if (event.type === 'progress') {
          this.uploadProgress = event.progress;
        } else if (event.type === 'response') {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.selectedFiles =  null as any;
          this.uploadMetadata.documentTypeId = null;

          this.toast.success(
            event.body.message || 'Files uploaded successfully',
            'Success'
          );

          // Reload documents
          this.loadCustomer(this.customer.id); // Reload customer to get updated documents();
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        const errorMessage = error?.error?.message || 'Failed to upload files';
        this.toast.error(errorMessage, 'Error');
      }
    });
  }

  downloadDocument(doc: any) {
    this.httpService.download(`/document/download/${doc.id}`).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: doc.contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.toast.error('Failed to download document', 'Error');
      }
    });
  }

  viewDocument(doc: any) {
     this.modal.show({
      component: DocPreviewModalComponent,
      title: '', // Empty title because component has its own header
      size: 'xl',
      showFooter: false,
      data: {
        document: doc  // Pass document object
      }
    });
  }

  deleteDocument(doc: any) {
    this.alert.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${doc.fileName}?`
    }).then(confirmed => {
      if (confirmed) {
        this.httpService.delete(`/document/delete/${doc.id}`).subscribe({
          next: () => {
            this.toast.success('Document deleted successfully', 'Success');
            this.loadCustomer(this.customer.id);
          },
          error: (error) => {
            this.toast.error(error?.error?.message || 'Failed to delete document', 'Error');
          }
        });
      }
    });
  }
}