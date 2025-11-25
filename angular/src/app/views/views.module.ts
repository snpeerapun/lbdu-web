import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { NgxEchartsModule } from 'ngx-echarts';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Layout and Form Modules
import { LayoutModule } from "../components/layouts/layout.module";
import { NgFormModule } from "../components/forms/ng-form.module";

// Components
import { LoginComponent } from './auth/login.component';

import { LogViewerComponent } from './logs/log-viewer.component';
import { ChatComponent } from './chat/chat.component';
import { NavComponent } from './nav/nav.component';
import { RegisterComponent } from './auth/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Budget Components
import { BudgetRequestComponent } from './budget/budget-request.component';
import { BudgetRequestDetailComponent } from './budget/budget-request-detail.component';
import { BudgetCategoryComponent } from './budget/ิbudget-category.component';
import { BudgetCategoryFormComponent } from './budget/budget-category-form.component';
import { BudgetGroupComponent } from './budget/budget-group.component';
import { BudgetRequestFormComponent } from './budget/budget-request-form.component';

import { BudgetItemComponent } from './budget/budget-request-item.component';

import { UsersComponent } from './settings/users.component';
import { UsersFormComponent } from './settings/users-form.component';
import { BudgetSummaryComponent } from './budget/budget-summary.component';
import { DepartmentComponent } from './settings/department.component';
import { DepartmentFormComponent } from './settings/department-form.component';
import { DivisionFormComponent } from './settings/division-form.componennt';
import { DivisionComponent } from './settings/division.component';
import { BudgetTemplateComponent } from './budget/budget-template.component';
import { BudgetTemplateFormComponent } from './budget/budget-template-form.component';
import { BudgetTemplateItemComponent } from './budget/budget-template-item.component';
import { BudgetFundSizeComponent } from './budget/budget-fundsize.component';
import { BudgetFundSizeFormComponent } from './budget/budget-fundsize-form.component';
import { BudgetFundSizeViewComponent } from './budget/budget-fundsize-view.component';
import { BudgetFundSizeItemComponent } from './budget/budget-fundsize-item.component';
import { BudgetPlanComponent } from './budget/budget-plan.component';
import { BudgetPlanFormComponent } from './budget/budget-plan-form.component';
import { BudgetPlanDetailsComponent } from './budget/budget-plan-detail.component';
import { BalanceSheetComponent } from './budget/balance-sheet.component';
import { BalanceSheetFormComponent } from './budget/balance-sheet-form.component';
import { NotFoundComponent } from './notfound.component';
import { BudgetFinanceComponent } from './budget/budget-fianance.component';
import { BudgetFinanceFormComponent } from './budget/budget-finance-form.component';
import { BalanceSheetItemComponent } from './budget/balance-sheet-item.component';
import {  SaleTeamFormComponent } from './settings/saleteam-form.component';
import { SaleTeamComponent } from './settings/saleteam.component';
import { RolesComponentComponent } from './settings/roles.component';
import { RolesFormComponent } from './settings/roles-form.component';
import { AmcComponent } from './master/amc.component';
import { AmcFormComponent } from './master/amc-form.component';
import { CommonModule } from '@angular/common';
import { FundComponent } from './master/fund.component';
import { FundFormComponent } from './master/fund-form.component';
import { CustomerComponent } from './investor/customer.component';
import { CustomerFormComponent } from './investor/customer-form.component';
import { RelatePersonModalComponent } from './investor/relate-person.modal.component';
import { BankAccountModalComponent } from './investor/bankaccount.modal.component';
import { UnitholderModalComponent } from './investor/unitholder-modal.component';
import { AccountModalComponent } from './investor/account-modal.component';
import { AddressModalComponent } from './investor/address-modal.component';
import { ConsultantComponent } from './investor/consultant.component';
import { ConsultantFormComponent } from './investor/consultant-form.component';
import { FeeSchemeComponent } from './master/fee-scheme.component';
import { FeeSchemeFormComponent } from './master/fee-scheme-form.component';
import { IcGroupComponent } from './master/ic-group.component';
import { IcGroupFormComponent } from './master/ic-group-form.component';
import { BankComponent } from './master/bank.component';
import { BankBranchComponent } from './master/bank-branch.component';
import { BankFormComponent } from './master/bank-form.component';
import { BankBranchFormComponent } from './master/bank-branch-form.component';
import { DocPreviewModalComponent } from './investor/doc-preview-modal.component';
@NgModule({
  declarations: [
    LoginComponent,
    LogViewerComponent,
    ChatComponent,
    NavComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    DashboardComponent,
    BudgetRequestComponent,
    BudgetRequestDetailComponent,
    BudgetCategoryComponent,
    BudgetGroupComponent,
    BudgetRequestFormComponent,
    BudgetItemComponent,
    UsersComponent,
    UsersFormComponent,
    BudgetSummaryComponent,
    DepartmentComponent,
    DivisionComponent,
    DepartmentFormComponent,
    DivisionFormComponent,
    BudgetTemplateComponent,
    BudgetTemplateFormComponent,
    BudgetTemplateItemComponent,
    BudgetFundSizeComponent,
    BudgetFundSizeFormComponent,
    BudgetFundSizeViewComponent,
    BudgetFundSizeItemComponent,
    BudgetCategoryComponent,
    BudgetCategoryFormComponent,
    BudgetPlanComponent,
    BudgetPlanFormComponent,
    BudgetPlanDetailsComponent,
    BalanceSheetComponent,
    BalanceSheetFormComponent,
    BudgetFinanceComponent,
    BalanceSheetItemComponent,
    BudgetFinanceFormComponent,
    NotFoundComponent,
    SaleTeamComponent,
    SaleTeamFormComponent,
    RolesComponentComponent,
    RolesFormComponent,
    AmcComponent,
    AmcFormComponent,
    FundComponent,
    FundFormComponent,
    CustomerComponent,
    CustomerFormComponent,
    RelatePersonModalComponent,
    BankAccountModalComponent,
    UnitholderModalComponent,
    AccountModalComponent,
    AddressModalComponent,
    ConsultantComponent,
    ConsultantFormComponent,
    FeeSchemeComponent,
    FeeSchemeFormComponent,
    IcGroupComponent,
    IcGroupFormComponent,
    BankComponent,
    BankFormComponent,
    BankBranchComponent,
    BankBranchFormComponent,
    DocPreviewModalComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    TranslateModule,
    LayoutModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    NgFormModule,
    NgxEchartsModule,
    CommonModule
],
 
})
export class ViewsModule { }