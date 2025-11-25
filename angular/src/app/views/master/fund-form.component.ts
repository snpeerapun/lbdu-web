import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from 'src/app/shared/services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-fund-form',
  template: `
  <div class="container-fluid">
    <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
      <div class="card">
        <!-- Header with Tabs -->
        <div class="card-header pb-0">
        
          
          <ul class="nav nav-tabs card-header-tabs border-bottom-0">
            <li class="nav-item">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'fund'"
                (click)="activeTab = 'fund'"
                type="button">
                Fund Details
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'navs'"
                (click)="activeTab = 'navs'"
                type="button">
                NAVs
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'fees'"
                (click)="activeTab = 'fees'"
                type="button">
                Fees
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'cutoff'"
                (click)="activeTab = 'cutoff'"
                type="button">
                Cutoff Times
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'trade'"
                (click)="activeTab = 'trade'"
                type="button">
                Trade Conditions
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'holidays'"
                (click)="activeTab = 'holidays'"
                type="button">
                Holidays
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'switching'"
                (click)="activeTab = 'switching'"
                type="button">
                Switching Rules
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'performance'"
                (click)="activeTab = 'performance'"
                type="button">
                Performance
              </button>
            </li>
            <li class="nav-item" *ngIf="isEditMode && fund.id > 0">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'txnholidays'"
                (click)="activeTab = 'txnholidays'"
                type="button">
                Txn Holiday Rules
              </button>
            </li>
          </ul>
        </div>

        <!-- Tab Content -->
        <div class="card-body">
          <!-- Tab: Fund Details -->
          <div *ngIf="activeTab === 'fund'" class="tab-pane fade show active">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-6">
                <!-- AMC -->
                <div class="mb-3">
                  <label class="form-label">AMC <span class="text-danger">*</span></label>
                  <select 
                    class="form-select"
                    name="amcId"
                    [(ngModel)]="fund.amcId"
                    #amcId="ngModel"
                    required
                    [class.is-invalid]="amcId.invalid && (amcId.dirty || amcId.touched)">
                    <option value="">Select AMC</option>
                    <option *ngFor="let amc of amcList" [value]="amc.id">
                      {{ amc.amcCode }} - {{ amc.shortName }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="amcId.invalid && (amcId.dirty || amcId.touched)">
                    AMC is required
                  </div>
                </div>

                <!-- Fund Code (SA) -->
                <div class="mb-3">
                  <label class="form-label">Fund Code (SA)</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundCodeSa"
                    [(ngModel)]="fund.fundCodeSa"
                    maxlength="20"
                    placeholder="Enter fund code for SA system">
                </div>

                <!-- Fund Code (AMC) -->
                <div class="mb-3">
                  <label class="form-label">Fund Code (AMC) <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundCodeAmc"
                    [(ngModel)]="fund.fundCodeAmc"
                    #fundCodeAmc="ngModel"
                    required
                    maxlength="20"
                    [class.is-invalid]="fundCodeAmc.invalid && (fundCodeAmc.dirty || fundCodeAmc.touched)"
                    placeholder="Enter AMC's fund code">
                  <div class="invalid-feedback" *ngIf="fundCodeAmc.invalid && (fundCodeAmc.dirty || fundCodeAmc.touched)">
                    Fund Code (AMC) is required
                  </div>
                </div>

                <!-- Fund Name Short (TH) -->
                <div class="mb-3">
                  <label class="form-label">Fund Name Short (TH) <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundNameShortTh"
                    [(ngModel)]="fund.fundNameShortTh"
                    #fundNameShortTh="ngModel"
                    required
                    maxlength="100"
                    [class.is-invalid]="fundNameShortTh.invalid && (fundNameShortTh.dirty || fundNameShortTh.touched)"
                    placeholder="Enter short name in Thai">
                  <div class="invalid-feedback" *ngIf="fundNameShortTh.invalid && (fundNameShortTh.dirty || fundNameShortTh.touched)">
                    Fund Name Short (TH) is required
                  </div>
                </div>

                <!-- Fund Name Short (EN) -->
                <div class="mb-3">
                  <label class="form-label">Fund Name Short (EN)</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundNameShortEn"
                    [(ngModel)]="fund.fundNameShortEn"
                    maxlength="100"
                    placeholder="Enter short name in English">
                </div>

                <!-- Fund Name Full (TH) -->
                <div class="mb-3">
                  <label class="form-label">Fund Name Full (TH)</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundNameFullTh"
                    [(ngModel)]="fund.fundNameFullTh"
                    maxlength="255"
                    placeholder="Enter full name in Thai">
                </div>

                <!-- Fund Name Full (EN) -->
                <div class="mb-3">
                  <label class="form-label">Fund Name Full (EN)</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="fundNameFullEn"
                    [(ngModel)]="fund.fundNameFullEn"
                    maxlength="255"
                    placeholder="Enter full name in English">
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <!-- Fund Type -->
                <div class="mb-3">
                  <label class="form-label">Fund Type</label>
                  <select 
                    class="form-select"
                    name="fundTypeId"
                    [(ngModel)]="fund.fundTypeId">
                    <option value="">Select Fund Type</option>
                    <option *ngFor="let type of fundTypeList" [value]="type.id">
                      {{ type.fundTypeNameTh }}
                    </option>
                  </select>
                </div>

                <!-- Risk Level -->
                <div class="mb-3">
                  <label class="form-label">Risk Level (1-8)</label>
                  <select 
                    class="form-select"
                    name="riskLevel"
                    [(ngModel)]="fund.riskLevel">
                    <option value="">Select Risk Level</option>
                    <option value="1">1 (Lowest Risk)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8 (Highest Risk)</option>
                  </select>
                </div>

                <!-- Is Open Ended -->
                <div class="mb-3">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      name="isOpenEnded"
                      [(ngModel)]="fund.isOpenEnded"
                      id="isOpenEnded">
                    <label class="form-check-label" for="isOpenEnded">
                      Is Open Ended Fund
                    </label>
                  </div>
                </div>

                <!-- Dividend Policy -->
                <div class="mb-3">
                  <label class="form-label">Dividend Policy</label>
                  <input 
                    type="text" 
                    class="form-control"
                    name="dividendPolicy"
                    [(ngModel)]="fund.dividendPolicy"
                    maxlength="100"
                    placeholder="e.g., Accumulation, Distribution">
                </div>

                <!-- IPO Start Date -->
                <div class="mb-3">
                  <label class="form-label">IPO Start Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="ipoStartDate"
                    [(ngModel)]="fund.ipoStartDate">
                </div>

                <!-- IPO End Date -->
                <div class="mb-3">
                  <label class="form-label">IPO End Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="ipoEndDate"
                    [(ngModel)]="fund.ipoEndDate">
                </div>

                <!-- Inception Date -->
                <div class="mb-3">
                  <label class="form-label">Inception Date</label>
                  <input 
                    type="date" 
                    class="form-control"
                    name="inceptionDate"
                    [(ngModel)]="fund.inceptionDate">
                </div>

                <!-- Is Active -->
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <div>
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        name="isActive"
                        [(ngModel)]="fund.isActive">
                      <span class="slider round"></span>
                    </label>
                    <span class="ms-2">
                      {{ fund.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: NAVs -->
          <div *ngIf="activeTab === 'navs'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">NAV History</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openNavModal()">
                <i class="fas fa-plus me-1"></i> Add NAV
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>NAV Date</th>
                    <th class="text-end">NAV/Unit</th>
                    <th class="text-end">Offer Price</th>
                    <th class="text-end">Bid Price</th>
                    <th>Source</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let nav of mockNavs" (click)="openNavModal(nav)" class="clickable-row">
                    <td>{{ nav.navDate | date:'dd/MM/yyyy' }}</td>
                    <td class="text-end">{{ nav.navPerUnit | number:'1.4-4' }}</td>
                    <td class="text-end">{{ nav.offerPrice | number:'1.4-4' }}</td>
                    <td class="text-end">{{ nav.bidPrice | number:'1.4-4' }}</td>
                    <td><span class="badge bg-info">{{ nav.source }}</span></td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openNavModal(nav)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('NAV', nav)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Fees -->
          <div *ngIf="activeTab === 'fees'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Fund Fees</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openFeeModal()">
                <i class="fas fa-plus me-1"></i> Add Fee
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Fee Type</th>
                    <th class="text-end">Fee Rate (%)</th>
                    <th class="text-end">Min Amount</th>
                    <th class="text-end">Max Amount</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let fee of mockFees" (click)="openFeeModal(fee)" class="clickable-row">
                    <td><span class="badge bg-secondary">{{ fee.feeType }}</span></td>
                    <td class="text-end">{{ fee.feeRate | number:'1.2-2' }}</td>
                    <td class="text-end">{{ fee.minFeeAmount | number:'1.2-2' }}</td>
                    <td class="text-end">{{ fee.maxFeeAmount | number:'1.2-2' }}</td>
                    <td>{{ fee.effectiveFrom | date:'dd/MM/yyyy' }}</td>
                    <td>{{ fee.effectiveTo ? (fee.effectiveTo | date:'dd/MM/yyyy') : '-' }}</td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openFeeModal(fee)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Fee', fee)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Cutoff Times -->
          <div *ngIf="activeTab === 'cutoff'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Cutoff Times</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openCutoffModal()">
                <i class="fas fa-plus me-1"></i> Add Cutoff Time
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Transaction Type</th>
                    <th>Cutoff Time</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let cutoff of mockCutoffs" (click)="openCutoffModal(cutoff)" class="clickable-row">
                    <td><span class="badge bg-primary">{{ cutoff.transactionType }}</span></td>
                    <td>{{ cutoff.cutoffTime }}</td>
                    <td>{{ cutoff.effectiveFrom | date:'dd/MM/yyyy' }}</td>
                    <td>{{ cutoff.effectiveTo ? (cutoff.effectiveTo | date:'dd/MM/yyyy') : 'Active' }}</td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openCutoffModal(cutoff)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Cutoff', cutoff)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Trade Conditions -->
          <div *ngIf="activeTab === 'trade'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Trade Conditions</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openTradeModal()">
                <i class="fas fa-plus me-1"></i> Add Condition
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Transaction Type</th>
                    <th class="text-end">Min Initial</th>
                    <th class="text-end">Min Subsequent</th>
                    <th class="text-end">Min Redeem</th>
                    <th>Payment Methods</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let trade of mockTradeConditions" (click)="openTradeModal(trade)" class="clickable-row">
                    <td><span class="badge bg-success">{{ trade.transactionType }}</span></td>
                    <td class="text-end">{{ trade.minInitialAmount | number:'1.2-2' }}</td>
                    <td class="text-end">{{ trade.minSubsequentAmount | number:'1.2-2' }}</td>
                    <td class="text-end">{{ trade.minRedeemAmount | number:'1.2-2' }}</td>
                    <td>
                      <span *ngIf="trade.allowCash" class="badge bg-secondary me-1">Cash</span>
                      <span *ngIf="trade.allowQR" class="badge bg-secondary me-1">QR</span>
                      <span *ngIf="trade.allowATS" class="badge bg-secondary">ATS</span>
                    </td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openTradeModal(trade)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Trade', trade)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Holidays -->
          <div *ngIf="activeTab === 'holidays'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Fund Holidays</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openHolidayModal()">
                <i class="fas fa-plus me-1"></i> Add Holiday
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Holiday Date</th>
                    <th>Description</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let holiday of mockHolidays" (click)="openHolidayModal(holiday)" class="clickable-row">
                    <td>{{ holiday.holidayDate | date:'dd/MM/yyyy' }}</td>
                    <td>{{ holiday.description }}</td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openHolidayModal(holiday)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Holiday', holiday)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Switching Rules -->
          <div *ngIf="activeTab === 'switching'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Switching Rules</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openSwitchingModal()">
                <i class="fas fa-plus me-1"></i> Add Rule
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Fund Out</th>
                    <th>Fund In</th>
                    <th class="text-center">Allowed</th>
                    <th class="text-end">Min Amount</th>
                    <th class="text-end">Min Unit</th>
                    <th>Remark</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rule of mockSwitchingRules" (click)="openSwitchingModal(rule)" class="clickable-row">
                    <td>{{ rule.fundOut }}</td>
                    <td>{{ rule.fundIn }}</td>
                    <td class="text-center">
                      <span class="badge" [class.bg-success]="rule.isAllowed" [class.bg-danger]="!rule.isAllowed">
                        {{ rule.isAllowed ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td class="text-end">{{ rule.minAmount | number:'1.2-2' }}</td>
                    <td class="text-end">{{ rule.minUnit | number:'1.4-4' }}</td>
                    <td>{{ rule.remark }}</td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openSwitchingModal(rule)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Switching', rule)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Performance -->
          <div *ngIf="activeTab === 'performance'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Fund Performance</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openPerformanceModal()">
                <i class="fas fa-plus me-1"></i> Add Performance
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>As Of Date</th>
                    <th class="text-end">1M (%)</th>
                    <th class="text-end">3M (%)</th>
                    <th class="text-end">6M (%)</th>
                    <th class="text-end">1Y (%)</th>
                    <th class="text-end">3Y (%)</th>
                    <th class="text-end">5Y (%)</th>
                    <th class="text-end">Since Inception (%)</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let perf of mockPerformances" (click)="openPerformanceModal(perf)" class="clickable-row">
                    <td>{{ perf.asOfDate | date:'dd/MM/yyyy' }}</td>
                    <td class="text-end" [class.text-success]="perf.return1M > 0" [class.text-danger]="perf.return1M < 0">
                      {{ perf.return1M | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.return3M > 0" [class.text-danger]="perf.return3M < 0">
                      {{ perf.return3M | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.return6M > 0" [class.text-danger]="perf.return6M < 0">
                      {{ perf.return6M | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.return1Y > 0" [class.text-danger]="perf.return1Y < 0">
                      {{ perf.return1Y | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.return3Y > 0" [class.text-danger]="perf.return3Y < 0">
                      {{ perf.return3Y | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.return5Y > 0" [class.text-danger]="perf.return5Y < 0">
                      {{ perf.return5Y | number:'1.2-2' }}
                    </td>
                    <td class="text-end" [class.text-success]="perf.sinceInception > 0" [class.text-danger]="perf.sinceInception < 0">
                      {{ perf.sinceInception | number:'1.2-2' }}
                    </td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openPerformanceModal(perf)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('Performance', perf)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Transaction Holiday Rules -->
          <div *ngIf="activeTab === 'txnholidays'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Transaction Holiday Rules</h6>
              <button type="button" class="btn btn-sm btn-primary" (click)="openTxnHolidayModal()">
                <i class="fas fa-plus me-1"></i> Add Rule
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Transaction Type</th>
                    <th>Holiday Date</th>
                    <th class="text-center">Transaction Allowed</th>
                    <th>Remark</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rule of mockTxnHolidayRules" (click)="openTxnHolidayModal(rule)" class="clickable-row">
                    <td><span class="badge bg-warning">{{ rule.transactionType }}</span></td>
                    <td>{{ rule.holidayDate | date:'dd/MM/yyyy' }}</td>
                    <td class="text-center">
                      <span class="badge" [class.bg-success]="rule.isTxnAllowed" [class.bg-danger]="!rule.isTxnAllowed">
                        {{ rule.isTxnAllowed ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td>{{ rule.remark }}</td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openTxnHolidayModal(rule)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteItem('TxnHoliday', rule)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
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
          </div>
        </div>
      </div>
    </form>

    <!-- NAV Modal -->
    <div class="modal fade" id="navModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedNav?.id ? 'Edit' : 'Add' }} NAV</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #navForm="ngForm">
              <div class="mb-3">
                <label class="form-label">NAV Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedNav.navDate" name="navDate" required>
              </div>
              <div class="mb-3">
                <label class="form-label">NAV Per Unit <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [(ngModel)]="selectedNav.navPerUnit" name="navPerUnit" step="0.0001" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Offer Price</label>
                <input type="number" class="form-control" [(ngModel)]="selectedNav.offerPrice" name="offerPrice" step="0.0001">
              </div>
              <div class="mb-3">
                <label class="form-label">Bid Price</label>
                <input type="number" class="form-control" [(ngModel)]="selectedNav.bidPrice" name="bidPrice" step="0.0001">
              </div>
              <div class="mb-3">
                <label class="form-label">Source <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="selectedNav.source" name="source" required>
                  <option value="FundConnext">FundConnext</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveNav()" [disabled]="navForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fee Modal -->
    <div class="modal fade" id="feeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedFee?.id ? 'Edit' : 'Add' }} Fee</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #feeForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Fee Type <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="selectedFee.feeType" name="feeType" required>
                  <option value="Front-end">Front-end</option>
                  <option value="Back-end">Back-end</option>
                  <option value="Management">Management</option>
                  <option value="Switching">Switching</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Fee Rate (%) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [(ngModel)]="selectedFee.feeRate" name="feeRate" step="0.01" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Min Fee Amount</label>
                <input type="number" class="form-control" [(ngModel)]="selectedFee.minFeeAmount" name="minFeeAmount" step="0.01">
              </div>
              <div class="mb-3">
                <label class="form-label">Max Fee Amount</label>
                <input type="number" class="form-control" [(ngModel)]="selectedFee.maxFeeAmount" name="maxFeeAmount" step="0.01">
              </div>
              <div class="mb-3">
                <label class="form-label">Effective From <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedFee.effectiveFrom" name="effectiveFrom" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Effective To</label>
                <input type="date" class="form-control" [(ngModel)]="selectedFee.effectiveTo" name="effectiveTo">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveFee()" [disabled]="feeForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cutoff Modal -->
    <div class="modal fade" id="cutoffModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedCutoff?.id ? 'Edit' : 'Add' }} Cutoff Time</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #cutoffForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Transaction Type <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="selectedCutoff.transactionType" name="transactionType" required>
                  <option value="Subscription">Subscription</option>
                  <option value="Redemption">Redemption</option>
                  <option value="Switching">Switching</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Cutoff Time <span class="text-danger">*</span></label>
                <input type="time" class="form-control" [(ngModel)]="selectedCutoff.cutoffTime" name="cutoffTime" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Effective From <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedCutoff.effectiveFrom" name="effectiveFrom" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Effective To</label>
                <input type="date" class="form-control" [(ngModel)]="selectedCutoff.effectiveTo" name="effectiveTo">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveCutoff()" [disabled]="cutoffForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <div class="modal fade" id="tradeModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedTrade?.id ? 'Edit' : 'Add' }} Trade Condition</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #tradeForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Transaction Type <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="selectedTrade.transactionType" name="transactionType" required>
                  <option value="Subscription">Subscription</option>
                  <option value="Redemption">Redemption</option>
                  <option value="Switching">Switching</option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Min Initial Amount</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedTrade.minInitialAmount" name="minInitialAmount" step="0.01">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Min Subsequent Amount</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedTrade.minSubsequentAmount" name="minSubsequentAmount" step="0.01">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Min Redeem Amount</label>
                <input type="number" class="form-control" [(ngModel)]="selectedTrade.minRedeemAmount" name="minRedeemAmount" step="0.01">
              </div>
              <div class="mb-3">
                <label class="form-label">Payment Methods</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="selectedTrade.allowCash" name="allowCash" id="allowCash">
                  <label class="form-check-label" for="allowCash">Cash</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="selectedTrade.allowQR" name="allowQR" id="allowQR">
                  <label class="form-check-label" for="allowQR">QR</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="selectedTrade.allowATS" name="allowATS" id="allowATS">
                  <label class="form-check-label" for="allowATS">ATS</label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveTrade()" [disabled]="tradeForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Holiday Modal -->
    <div class="modal fade" id="holidayModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedHoliday?.id ? 'Edit' : 'Add' }} Holiday</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #holidayForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Holiday Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedHoliday.holidayDate" name="holidayDate" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="selectedHoliday.description" name="description" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveHoliday()" [disabled]="holidayForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Switching Modal -->
    <div class="modal fade" id="switchingModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedSwitching?.id ? 'Edit' : 'Add' }} Switching Rule</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #switchingForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Fund Out <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="selectedSwitching.fundOut" name="fundOut" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Fund In <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="selectedSwitching.fundIn" name="fundIn" required>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="selectedSwitching.isAllowed" name="isAllowed" id="isAllowed">
                  <label class="form-check-label" for="isAllowed">Is Allowed</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Min Amount</label>
                <input type="number" class="form-control" [(ngModel)]="selectedSwitching.minAmount" name="minAmount" step="0.01">
              </div>
              <div class="mb-3">
                <label class="form-label">Min Unit</label>
                <input type="number" class="form-control" [(ngModel)]="selectedSwitching.minUnit" name="minUnit" step="0.0001">
              </div>
              <div class="mb-3">
                <label class="form-label">Remark</label>
                <textarea class="form-control" [(ngModel)]="selectedSwitching.remark" name="remark" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveSwitching()" [disabled]="switchingForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Modal -->
    <div class="modal fade" id="performanceModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedPerformance?.id ? 'Edit' : 'Add' }} Performance</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #performanceForm="ngForm">
              <div class="mb-3">
                <label class="form-label">As Of Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedPerformance.asOfDate" name="asOfDate" required>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 1M (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return1M" name="return1M" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 3M (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return3M" name="return3M" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 6M (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return6M" name="return6M" step="0.01">
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 1Y (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return1Y" name="return1Y" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 3Y (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return3Y" name="return3Y" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Return 5Y (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="selectedPerformance.return5Y" name="return5Y" step="0.01">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Since Inception (%)</label>
                <input type="number" class="form-control" [(ngModel)]="selectedPerformance.sinceInception" name="sinceInception" step="0.01">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="savePerformance()" [disabled]="performanceForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Txn Holiday Modal -->
    <div class="modal fade" id="txnHolidayModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedTxnHoliday?.id ? 'Edit' : 'Add' }} Txn Holiday Rule</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form #txnHolidayForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Transaction Type <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="selectedTxnHoliday.transactionType" name="transactionType" required>
                  <option value="Subscription">Subscription</option>
                  <option value="Redemption">Redemption</option>
                  <option value="Switching">Switching</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Holiday Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="selectedTxnHoliday.holidayDate" name="holidayDate" required>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="selectedTxnHoliday.isTxnAllowed" name="isTxnAllowed" id="isTxnAllowed">
                  <label class="form-check-label" for="isTxnAllowed">Transaction Allowed</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Remark</label>
                <textarea class="form-control" [(ngModel)]="selectedTxnHoliday.remark" name="remark" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveTxnHoliday()" [disabled]="txnHolidayForm.invalid">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .card-header {
      background-color: #fff;
    }

    .card-header-tabs {
      margin-bottom: 0;
    }

    .card-header-tabs .nav-link {
      color: #6c757d;
      border: none;
      border-bottom: 3px solid transparent;
      text-transform: uppercase;
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
    }

    .custom-table {
      margin-bottom: 0;
    }

    .custom-table thead th {
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      background-color: #f8f9fa;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .custom-table tbody tr {
      border-bottom: 1px solid #dee2e6;
      transition: all 0.2s;
    }

    .custom-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .custom-table tbody tr.selected {
      background-color: #e7f3ff;
      border-bottom: 2px solid var(--primary-500);
    }

    .clickable-row {
      cursor: pointer;
    }

    .table-responsive {
      max-height: 500px;
      overflow-y: auto;
    }
  `]
})
export class FundFormComponent implements OnInit {
  // Fund object
  fund: any = {
    id: 0,
    amcId: '',
    fundCodeSa: '',
    fundCodeAmc: '',
    fundNameShortTh: '',
    fundNameShortEn: '',
    fundNameFullTh: '',
    fundNameFullEn: '',
    fundTypeId: '',
    isOpenEnded: false,
    dividendPolicy: '',
    riskLevel: '',
    ipoStartDate: '',
    ipoEndDate: '',
    inceptionDate: '',
    isActive: true
  };

  isEditMode = false;
  isSubmitting = false;
  activeTab = 'fund';

  // Master data
  amcList: any[] = [];
  fundTypeList: any[] = [];

  // Selected items for modals
  selectedNav: any = {};
  selectedFee: any = {};
  selectedCutoff: any = {};
  selectedTrade: any = {};
  selectedHoliday: any = {};
  selectedSwitching: any = {};
  selectedPerformance: any = {};
  selectedTxnHoliday: any = {};

  // Mockup data for tables
  mockNavs: any[] = [
    { id: 1, navDate: '2024-11-20', navPerUnit: 15.2345, offerPrice: 15.3000, bidPrice: 15.1690, source: 'FundConnext' },
    { id: 2, navDate: '2024-11-19', navPerUnit: 15.2100, offerPrice: 15.2755, bidPrice: 15.1445, source: 'FundConnext' },
    { id: 3, navDate: '2024-11-18', navPerUnit: 15.1850, offerPrice: 15.2503, bidPrice: 15.1198, source: 'Manual' },
    { id: 4, navDate: '2024-11-15', navPerUnit: 15.1500, offerPrice: 15.2149, bidPrice: 15.0851, source: 'FundConnext' },
  ];

  mockFees: any[] = [
    { id: 1, feeType: 'Front-end', feeRate: 1.50, minFeeAmount: 0, maxFeeAmount: 1000, effectiveFrom: '2024-01-01', effectiveTo: null },
    { id: 2, feeType: 'Back-end', feeRate: 0.50, minFeeAmount: 0, maxFeeAmount: 500, effectiveFrom: '2024-01-01', effectiveTo: null },
    { id: 3, feeType: 'Management', feeRate: 1.07, minFeeAmount: 0, maxFeeAmount: null, effectiveFrom: '2024-01-01', effectiveTo: null },
    { id: 4, feeType: 'Switching', feeRate: 0.25, minFeeAmount: 50, maxFeeAmount: 250, effectiveFrom: '2024-01-01', effectiveTo: null },
  ];

  mockCutoffs: any[] = [
    { id: 1, transactionType: 'Subscription', cutoffTime: '15:30', effectiveFrom: '2024-01-01', effectiveTo: null },
    { id: 2, transactionType: 'Redemption', cutoffTime: '15:30', effectiveFrom: '2024-01-01', effectiveTo: null },
    { id: 3, transactionType: 'Switching', cutoffTime: '15:00', effectiveFrom: '2024-01-01', effectiveTo: null },
  ];

  mockTradeConditions: any[] = [
    { id: 1, transactionType: 'Subscription', minInitialAmount: 5000.00, minSubsequentAmount: 1000.00, minRedeemAmount: 0, allowCash: true, allowQR: true, allowATS: true },
    { id: 2, transactionType: 'Redemption', minInitialAmount: 0, minSubsequentAmount: 0, minRedeemAmount: 1000.00, allowCash: false, allowQR: false, allowATS: false },
    { id: 3, transactionType: 'Switching', minInitialAmount: 0, minSubsequentAmount: 0, minRedeemAmount: 1000.00, allowCash: false, allowQR: false, allowATS: false },
  ];

  mockHolidays: any[] = [
    { id: 1, holidayDate: '2024-12-31', description: 'New Year\'s Eve' },
    { id: 2, holidayDate: '2024-12-25', description: 'Christmas Day' },
    { id: 3, holidayDate: '2024-12-10', description: 'Constitution Day' },
    { id: 4, holidayDate: '2024-12-05', description: 'King\'s Birthday' },
  ];

  mockSwitchingRules: any[] = [
    { id: 1, fundOut: 'KFEQUITY', fundIn: 'KFFIX', isAllowed: true, minAmount: 1000.00, minUnit: 0, remark: 'Standard switching' },
    { id: 2, fundOut: 'KFEQUITY', fundIn: 'KFGOLD', isAllowed: true, minAmount: 5000.00, minUnit: 0, remark: 'Higher minimum for gold fund' },
    { id: 3, fundOut: 'KFFIX', fundIn: 'KFEQUITY', isAllowed: true, minAmount: 1000.00, minUnit: 0, remark: 'Standard switching' },
    { id: 4, fundOut: 'KFGOLD', fundIn: 'KFEQUITY', isAllowed: false, minAmount: 0, minUnit: 0, remark: 'Not allowed per AMC policy' },
  ];

  mockPerformances: any[] = [
    { id: 1, asOfDate: '2024-10-31', return1M: 2.15, return3M: 5.43, return6M: 8.75, return1Y: 12.34, return3Y: 25.67, return5Y: 45.89, sinceInception: 52.34 },
    { id: 2, asOfDate: '2024-09-30', return1M: 1.85, return3M: 4.92, return6M: 7.23, return1Y: 11.05, return3Y: 23.12, return5Y: 42.45, sinceInception: 48.92 },
    { id: 3, asOfDate: '2024-08-31', return1M: -0.45, return3M: 3.78, return6M: 6.12, return1Y: 10.23, return3Y: 21.89, return5Y: 40.12, sinceInception: 46.78 },
  ];

  mockTxnHolidayRules: any[] = [
    { id: 1, transactionType: 'Subscription', holidayDate: '2024-12-31', isTxnAllowed: false, remark: 'Year-end closure' },
    { id: 2, transactionType: 'Redemption', holidayDate: '2024-12-31', isTxnAllowed: false, remark: 'Year-end closure' },
    { id: 3, transactionType: 'Subscription', holidayDate: '2024-12-25', isTxnAllowed: true, remark: 'Online transactions allowed' },
    { id: 4, transactionType: 'Switching', holidayDate: '2024-12-10', isTxnAllowed: false, remark: 'Public holiday' },
  ];

  constructor(
    private httpService: HttpService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMasterData();
    
    const fundId = this.route.snapshot.params['id'];
    if (fundId) {
      this.isEditMode = true;
      this.loadFund(fundId);
    }
  }

  loadMasterData() {
    this.httpService.get('/fund/getdata').subscribe({
      next: (data: any) => {
        this.amcList = data.amcs;
        this.fundTypeList = data.fundTypes;
      },
      error: (error) => {
        console.error('Failed to load master data', error);
      }
    });
  }

  loadFund(fundId: number) {
    this.httpService.get(`/fund/get/${fundId}`).subscribe({
      next: (response: any) => {
        this.fund = response;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to load fund data', 'Error!');
        this.onCancel();
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
    
    this.httpService.post("/fund/post", this.fund).subscribe({
      next: (response) => {
        this.toast.success(
          `Fund successfully ${this.isEditMode ? 'updated' : 'created'}`,
          'Success'
        );
        this.onCancel();
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Failed to save fund';
        this.toast.error(errorMessage, 'Error');
        console.error('Error saving fund:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/master/fund']);
  }

  // Modal open methods
  openNavModal(nav: any = null) {
    this.selectedNav = nav ? { ...nav } : { navDate: '', navPerUnit: 0, offerPrice: 0, bidPrice: 0, source: 'FundConnext' };
    const modal = new bootstrap.Modal(document.getElementById('navModal'));
    modal.show();
  }

  openFeeModal(fee: any = null) {
    this.selectedFee = fee ? { ...fee } : { feeType: '', feeRate: 0, minFeeAmount: 0, maxFeeAmount: 0, effectiveFrom: '', effectiveTo: '' };
    const modal = new bootstrap.Modal(document.getElementById('feeModal'));
    modal.show();
  }

  openCutoffModal(cutoff: any = null) {
    this.selectedCutoff = cutoff ? { ...cutoff } : { transactionType: '', cutoffTime: '', effectiveFrom: '', effectiveTo: '' };
    const modal = new bootstrap.Modal(document.getElementById('cutoffModal'));
    modal.show();
  }

  openTradeModal(trade: any = null) {
    this.selectedTrade = trade ? { ...trade } : { 
      transactionType: '', 
      minInitialAmount: 0, 
      minSubsequentAmount: 0, 
      minRedeemAmount: 0, 
      allowCash: false, 
      allowQR: false, 
      allowATS: false 
    };
    const modal = new bootstrap.Modal(document.getElementById('tradeModal'));
    modal.show();
  }

  openHolidayModal(holiday: any = null) {
    this.selectedHoliday = holiday ? { ...holiday } : { holidayDate: '', description: '' };
    const modal = new bootstrap.Modal(document.getElementById('holidayModal'));
    modal.show();
  }

  openSwitchingModal(switching: any = null) {
    this.selectedSwitching = switching ? { ...switching } : { fundOut: '', fundIn: '', isAllowed: false, minAmount: 0, minUnit: 0, remark: '' };
    const modal = new bootstrap.Modal(document.getElementById('switchingModal'));
    modal.show();
  }

  openPerformanceModal(perf: any = null) {
    this.selectedPerformance = perf ? { ...perf } : { 
      asOfDate: '', 
      return1M: 0, 
      return3M: 0, 
      return6M: 0, 
      return1Y: 0, 
      return3Y: 0, 
      return5Y: 0, 
      sinceInception: 0 
    };
    const modal = new bootstrap.Modal(document.getElementById('performanceModal'));
    modal.show();
  }

  openTxnHolidayModal(rule: any = null) {
    this.selectedTxnHoliday = rule ? { ...rule } : { transactionType: '', holidayDate: '', isTxnAllowed: false, remark: '' };
    const modal = new bootstrap.Modal(document.getElementById('txnHolidayModal'));
    modal.show();
  }

  // Save methods
  saveNav() {
    console.log('Saving NAV:', this.selectedNav);
    this.toast.success('NAV saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('navModal'))?.hide();
  }

  saveFee() {
    console.log('Saving Fee:', this.selectedFee);
    this.toast.success('Fee saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('feeModal'))?.hide();
  }

  saveCutoff() {
    console.log('Saving Cutoff:', this.selectedCutoff);
    this.toast.success('Cutoff time saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('cutoffModal'))?.hide();
  }

  saveTrade() {
    console.log('Saving Trade:', this.selectedTrade);
    this.toast.success('Trade condition saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('tradeModal'))?.hide();
  }

  saveHoliday() {
    console.log('Saving Holiday:', this.selectedHoliday);
    this.toast.success('Holiday saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('holidayModal'))?.hide();
  }

  saveSwitching() {
    console.log('Saving Switching:', this.selectedSwitching);
    this.toast.success('Switching rule saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('switchingModal'))?.hide();
  }

  savePerformance() {
    console.log('Saving Performance:', this.selectedPerformance);
    this.toast.success('Performance saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('performanceModal'))?.hide();
  }

  saveTxnHoliday() {
    console.log('Saving Txn Holiday:', this.selectedTxnHoliday);
    this.toast.success('Transaction holiday rule saved successfully');
    bootstrap.Modal.getInstance(document.getElementById('txnHolidayModal'))?.hide();
  }

  // Delete method
  deleteItem(type: string, item: any) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      console.log(`Deleting ${type}:`, item);
      this.toast.success(`${type} deleted successfully`);
    }
  }
}