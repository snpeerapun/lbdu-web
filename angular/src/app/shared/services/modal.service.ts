import { Injectable, Type, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { NgbModal, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private modalService: NgbModal, private injector: Injector) {}

  show<T>(options: {
    component: Type<T>;
    title: string;
    data?: any;
    showFooter?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<any> {
    const modalRef = this.modalService.open(ModalWrapperComponent, {
      size: options.size || 'md',
      backdrop: 'static'
    });

    const modalComponent = modalRef.componentInstance;
    modalComponent.title = options.title;
    modalComponent.confirmButtonText = options.confirmButtonText || 'ตกลง';
    modalComponent.cancelButtonText = options.cancelButtonText || 'ยกเลิก';

    // โหลด Component ที่กำหนด
    setTimeout(() => {
      //console.log('data',options.data);
      modalComponent.loadComponent(options.component, options.data);
    });

    return modalRef.result;
  }
}
 
 
@Component({
  selector: 'app-modal-wrapper',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <ng-container #dynamicComponent></ng-container>
    </div>
    <div class="modal-footer" *ngIf="showFooter">
      <button  type="button" class="btn btn-secondary" (click)="dismiss()">
        {{ cancelButtonText }}
      </button>
      <button  type="button" class="btn btn-primary" (click)="submit()">
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class ModalWrapperComponent {
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) container!: ViewContainerRef;
  private componentRef!: ComponentRef<any>;

  title: string = '';
  confirmButtonText: string = 'ตกลง';
  cancelButtonText: string = 'ยกเลิก';

  constructor(public activeModal: NgbActiveModal) {}

  loadComponent<T>(component: Type<T>, data?: any): T {
    this.container.clear();
    const factory = this.container.createComponent(component);
    this.componentRef = factory;
  
    // ส่ง data ไปยัง instance ของ Component ที่โหลด
    if (data) {
      Object.assign(this.componentRef.instance,{data: data});
    }
 
    return this.componentRef.instance;
  }
  

  submit() {
    if (this.componentRef?.instance?.onSubmit && typeof this.componentRef.instance.onSubmit === 'function') {
      const result = this.componentRef.instance.onSubmit();
      if (result instanceof Promise) {
        result
          .then((data) => {
            console.log('Success result:', data);
            this.activeModal.close(data); // ✅ Close modal on success
          })
          .catch((error) => {
            console.error('Submit failed:', error);
          });
      } else {
        console.error('onSubmit() did not return a Promise.');
      }
    } else {
      console.error('onSubmit() is not defined or not a function.');
    }
  }
  
  
  dismiss() {
    this.activeModal.dismiss();
  }
}
