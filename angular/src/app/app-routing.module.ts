import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/layouts/main.component';
import { BlankComponent } from './components/layouts/blank.component';
 
import { LoginComponent } from './views/auth/login.component';
import { RegisterComponent } from './views/auth/register.component';
import { ForgotPasswordComponent } from './views/auth/forgot-password.component';

import { UsersComponent } from './views/settings/users.component';
import { UsersFormComponent } from './views/settings/users-form.component';

import { LogViewerComponent } from './views/logs/log-viewer.component';
import { ChatComponent } from './views/chat/chat.component';
import { NavComponent } from './views/nav/nav.component';
import { ProfileComponent } from './views/profile/profile.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { BudgetRequestComponent } from './views/budget/budget-request.component';
import { BudgetGroupComponent } from './views/budget/budget-group.component';
import { BudgetRequestFormComponent } from './views/budget/budget-request-form.component';
import { BudgetSummaryComponent } from './views/budget/budget-summary.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { DivisionComponent } from './views/settings/division.component';
import { DepartmentComponent } from './views/settings/department.component';
import { DivisionFormComponent } from './views/settings/division-form.componennt';
import { DepartmentFormComponent } from './views/settings/department-form.component';
import { BudgetTemplateComponent } from './views/budget/budget-template.component';
import { BudgetTemplateFormComponent } from './views/budget/budget-template-form.component';
import { BudgetFundSizeComponent } from './views/budget/budget-fundsize.component';
import { BudgetFundSizeFormComponent } from './views/budget/budget-fundsize-form.component';
import { BudgetFundSizeViewComponent } from './views/budget/budget-fundsize-view.component';
import { BudgetCategoryFormComponent } from './views/budget/budget-category-form.component';
import { BudgetCategoryComponent } from './views/budget/ิbudget-category.component';
import { BudgetPlanComponent } from   './views/budget/budget-plan.component';
import { BudgetPlanFormComponent } from './views/budget/budget-plan-form.component';
import { BudgetPlanDetailsComponent } from './views/budget/budget-plan-detail.component';
import { BudgetRequestDetailComponent } from './views/budget/budget-request-detail.component';

import { BalanceSheetComponent } from './views/budget/balance-sheet.component';
import { BalanceSheetFormComponent } from './views/budget/balance-sheet-form.component';
import { NotFoundComponent } from './views/notfound.component';
import { BudgetFinanceComponent } from './views/budget/budget-fianance.component';
import { BudgetFinanceFormComponent } from './views/budget/budget-finance-form.component';

import { SaleTeamComponent } from './views/settings/saleteam.component';
import { SaleTeamFormComponent } from './views/settings/saleteam-form.component';
import { RolesFormComponent } from './views/settings/roles-form.component';
import { RolesComponentComponent } from './views/settings/roles.component';
import { AmcComponent } from './views/master/amc.component';
import { AmcFormComponent } from './views/master/amc-form.component';
import { FundComponent } from './views/master/fund.component';
import { FundFormComponent } from './views/master/fund-form.component';
import { CustomerComponent } from './views/investor/customer.component';
import { CustomerFormComponent } from './views/investor/customer-form.component';

import { ConsultantComponent } from './views/investor/consultant.component';
import { ConsultantFormComponent } from './views/investor/consultant-form.component';
import { IcGroupComponent } from './views/master/ic-group.component';
import { IcGroupFormComponent } from './views/master/ic-group-form.component';
import { FeeSchemeComponent } from './views/master/fee-scheme.component';
import { FeeSchemeFormComponent } from './views/master/fee-scheme-form.component';
import { BankComponent } from './views/master/bank.component';
import { BankFormComponent } from './views/master/bank-form.component';
import { BankBranchComponent } from './views/master/bank-branch.component';
import { BankBranchFormComponent } from './views/master/bank-branch-form.component';
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'chat',
        component: ChatComponent
      },
 
      {
        path: 'nav',
        component: NavComponent
      },
      {
        path: 'notfound',
        component: NotFoundComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
     
 
      {
        path: 'groups',
        component: BudgetGroupComponent
      },
      {
        path: 'summary',
        component: BudgetSummaryComponent
      },
     
    ]
  },
  

  {
    path: 'investor',
    component: MainComponent,
    children: [
      { component: CustomerComponent, path: 'customer' },
      { component :CustomerFormComponent, path: 'customer/create' },
      { component: CustomerFormComponent, path: 'customer/editing/:id' },

      { component: ConsultantComponent, path: 'consultant' },
      { component : ConsultantFormComponent, path: 'consultant/create' },
      { component: ConsultantFormComponent, path: 'consultant/editing/:id' },
    ]
  },
   {
    path: 'master',
    component: MainComponent,
    children: [
      { component: AmcComponent, path: 'amc' },
      { component :AmcFormComponent, path: 'amc/create' },
      { component: AmcFormComponent, path: 'amc/editing/:id' },

      { component: FundComponent, path: 'fund' },
      { component: FundFormComponent, path: 'fund/create' },
      { component: FundFormComponent, path: 'fund/editing/:id' },

        
      { component: FeeSchemeComponent, path: 'fee-scheme' },
      { component: FeeSchemeFormComponent, path: 'fee-scheme/create' },
      { component: FeeSchemeFormComponent, path: 'fee-scheme/editing/:id' },
      
      { component: IcGroupComponent, path: 'ic-group' },
      { component: IcGroupFormComponent, path: 'ic-group/create' },
      { component: IcGroupFormComponent, path: 'ic-group/editing/:id' },
      
      { component: BankComponent, path: 'bank' },
      { component: BankFormComponent, path: 'bank/create' },
      { component: BankFormComponent, path: 'bank/editing/:id' },

      { component: BankBranchComponent, path: 'bank-branch' },
      { component: BankBranchFormComponent, path: 'bank-branch/create' },
      { component: BankBranchFormComponent, path: 'bank-branch/editing/:id' },
    ]
  },
  
  {
    path: 'settings',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [


      { component: UsersComponent, path: 'users' },
      { component: UsersFormComponent, path: 'users/create' },
      { component: UsersFormComponent, path: 'users/editing/:id' },

      { component: DivisionComponent, path: 'division' },
      { component: DivisionFormComponent, path: 'division/create' },
      { component: DivisionFormComponent, path: 'division/editing/:id' },

      { component: DepartmentComponent, path: 'department' },
      { component: DepartmentFormComponent, path: 'department/create' },
      { component: DepartmentFormComponent, path: 'department/editing/:id' },
 
   
      {  path: 'roles/list', component: RolesComponentComponent },
      {  path: 'roles/create', component: RolesFormComponent},
      {  path: 'roles/edit/:id',component: RolesFormComponent},

    ]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'logs',
        component: LogViewerComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      {
        path: 'logs',
        component: LogViewerComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'notfound'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
