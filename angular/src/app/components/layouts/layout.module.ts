import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from './navbar.component';
import { BlankComponent } from './blank.component';
import { MainComponent } from './main.component';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastContainerComponent } from './toast-container.component';

@NgModule({
  declarations: [
    NavBarComponent,
    BlankComponent,
    MainComponent,
    FooterComponent,
    SidebarComponent,
    ToastContainerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
  ],
  exports: [
    NavBarComponent,
    BlankComponent,
    MainComponent,
    FooterComponent,
    SidebarComponent
  ]
})
export class LayoutModule { }
