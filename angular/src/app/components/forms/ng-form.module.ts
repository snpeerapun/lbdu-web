import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgTableComponent } from "./ng-table.component";
import { NgModalComponent } from "./ng-modal.component";
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { NgCheckBoxComponent } from "./ng-checkbox.component";
//import { NgAutocompleteComponent } from "./ng-autocomplete.component";
import { NgOtpInputComponent } from "./ng-otp-input.component";
import { NgTreeTableComponent } from "./ng-tree-table.component";
 
import { NgMultiSelectComponent } from "./ng-multi-select.component";
import { SharedModule } from "src/app/shared/shared.module";
 
import { NgSelectComponent } from "./ng-select.component";
import { NgSelect2Component } from "./ng-select2.component";
import { NgDateTimePickerComponent } from "./ng-datetimepicker.component";
import { NgTableFixedComponent } from "./ng-table-fixed";
import { NgTreeTable2Component } from "./ng-tree-table2.component";
import { NgTreeTable3Component } from "./ng-tree-table3.component";
import { NgSelect3Component } from "./ng-select3.component";
import { NgTreeAccountComponent } from "./ng-tree-account.component";
import { NgUploadFileComponent } from "./ng-upload-file";
import { NgCheckBoxListComponent } from "./ng-checkbox-list.component";
import { NgTableGroupComponent } from "./ng-table-group.component";
import { NgMonthSelectComponent } from "./ng-month-select.component";

@NgModule({
  declarations: [
    NgTableComponent,
    NgModalComponent,
    NgTreeTableComponent,
    NgTreeTable2Component,
    NgTreeTable3Component,
    NgTreeAccountComponent,
    NgSelectComponent,
    NgMultiSelectComponent,
    NgSelect2Component,
    NgSelect3Component,
    NgTableFixedComponent,
    NgDateTimePickerComponent,
    NgOtpInputComponent,
    NgUploadFileComponent,
    NgCheckBoxListComponent,
    NgTableGroupComponent ,
    NgMonthSelectComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule, 
    NgbModalModule,
    SharedModule,
  ],
  exports: [
    NgTableComponent,
    NgModalComponent,
    NgSelectComponent,
    NgTreeAccountComponent,
    NgTreeTableComponent,
    NgTreeTable2Component,
    NgTreeTable3Component,
    NgSelect2Component,
    NgSelect3Component,
    NgMultiSelectComponent,
    NgDateTimePickerComponent,
    NgTableFixedComponent,
    NgOtpInputComponent,
    NgUploadFileComponent,
    NgCheckBoxListComponent,
    NgTableGroupComponent,
    NgMonthSelectComponent
  ],
})

export class NgFormModule {}
