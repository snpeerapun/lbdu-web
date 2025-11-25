import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Pipes
import { SumPipe } from './pipes/sum.pipe';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Services
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { ChartService } from './services/chart.service';
import { ChatService } from './services/chat.service';
import { HttpService } from './services/http.service';
import { LoadingService } from './services/loading.service';
import { NavigationService } from './services/navigation.service';
import { ModalService } from './services/modal.service';
import { RecaptchaService } from './services/recaptcha.service';
import { AppTranslateService } from './services/translate.service';

// Directives
import { NumberFormatDirective } from './directives/number-format.directive';
import { FilterPipe } from './directives/filter.pipe';
import { NgTableStickyDirective } from './directives/ng-table-sticky.directive';
import { ToastService } from './services/toast.service';

 
@NgModule({
  declarations: [
    FilterPipe,
    SumPipe,
    NumberFormatDirective,
    NgTableStickyDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SumPipe,
    FilterPipe,
    NumberFormatDirective,
    NgTableStickyDirective
  ],
  providers: [
    // Guards
    AuthGuard,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    },
    // Services
    AlertService,
    AuthService,
    ChartService,
    ChatService,
    HttpService,
    LoadingService,
    NavigationService,
    ModalService,
    RecaptchaService,
    ToastService, 
    AppTranslateService
  ]
})
export class SharedModule { }
