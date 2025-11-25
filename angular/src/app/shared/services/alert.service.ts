import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private defaultOptions: SweetAlertOptions = {
    confirmButtonColor: '#1ab394',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK'
  };

  info(message: string, title: string = 'Information'): Promise<SweetAlertResult> {
    return this.showAlert('info', title, message);
  }

  success(message: string, title: string = 'Success'): Promise<SweetAlertResult> {
    return this.showAlert('success', title, message);
  }

  warning(message: string, title: string = 'Warning'): Promise<SweetAlertResult> {
    return this.showAlert('warning', title, message);
  }

  error(message: string, title: string = 'Error'): Promise<SweetAlertResult> {
    return this.showAlert('error', title, message);
  }

  confirm(options: {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
}): Promise<SweetAlertResult> {
    const confirmOptions: SweetAlertOptions = {
      ...this.defaultOptions,
      title: options.title,
      text: options.message,
      icon: options.icon || 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || 'No',
      reverseButtons: true
    };

    return Swal.fire(confirmOptions);
  }

  alert(options: SweetAlertOptions): Promise<SweetAlertResult<any>> {
    const alertOptions: any = {
      ...this.defaultOptions,
      ...options
    };
    return Swal.fire(alertOptions);
  }

  private showAlert(icon: SweetAlertIcon, title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      ...this.defaultOptions,
      title,
      text,
      icon
    });
  }
}
