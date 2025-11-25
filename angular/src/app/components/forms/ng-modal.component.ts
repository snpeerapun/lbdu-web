import { Component, ViewChild, ViewContainerRef, ComponentRef, Type, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ng-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <ng-container #dynamicComponent></ng-container>
    </div>
    <div class="modal-footer">
      <button *ngIf="cancelButtonText" type="button" class="btn btn-secondary" (click)="dismiss()">
        {{ cancelButtonText }}
      </button>
      <button *ngIf="confirmButtonText" type="button" class="btn btn-primary" (click)="submit()">
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class NgModalComponent implements AfterViewInit {
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) container!: ViewContainerRef;
  private componentRef!: ComponentRef<any>;

  title: string = '';
  confirmButtonText: string = 'ตกลง';
  cancelButtonText: string = 'ยกเลิก';

  constructor(public activeModal: NgbActiveModal, private resolver: ComponentFactoryResolver) {}

  ngAfterViewInit() {
    // ให้แน่ใจว่า `container` พร้อมใช้งานก่อนเรียก `loadComponent()`
  }

  loadComponent<T>(component: Type<T>): T {
    if (!this.container) {
      console.error('ViewContainerRef is not ready yet.');
      return {} as T;
    }

    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = this.container.createComponent(factory);
    return this.componentRef.instance;
  }

  submit() {
    if (this.componentRef.instance.onSubmit) {
      const result = this.componentRef.instance.onSubmit();
      this.activeModal.close(result);
    } else {
      this.activeModal.close();
    }
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
