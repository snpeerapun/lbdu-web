import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../shared/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast toast-{{ toast.type }}"
           [class.toast-enter]="true">
        <div class="toast-icon">
          <div class="icon icon-{{ toast.type }}"></div>
        </div>
        <div class="toast-content">
          <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="closeToast(toast.id)" aria-label="Close">
          <div class="icon-close"></div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      margin-bottom: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #10b981;
    }

    .toast-error {
      border-left-color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .icon {
      width: 24px;
      height: 24px;
      position: relative;
    }

    /* Success Icon - Checkmark in Circle */
    .icon-success::before {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid #10b981;
      border-radius: 50%;
    }

    .icon-success::after {
      content: '';
      position: absolute;
      top: 6px;
      left: 5px;
      width: 6px;
      height: 12px;
      border: solid #10b981;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* Error Icon - X in Circle */
    .icon-error::before {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid #ef4444;
      border-radius: 50%;
    }

    .icon-error::after {
      content: '×';
      position: absolute;
      top: -2px;
      left: 0;
      width: 24px;
      height: 24px;
      color: #ef4444;
      font-size: 24px;
      line-height: 24px;
      text-align: center;
      font-weight: bold;
    }

    /* Warning Icon - Triangle with ! */
    .icon-warning {
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-bottom: 22px solid #f59e0b;
      position: relative;
    }

    .icon-warning::after {
      content: '!';
      position: absolute;
      top: 4px;
      left: -3px;
      color: white;
      font-size: 14px;
      font-weight: bold;
    }

    /* Info Icon - i in Circle */
    .icon-info::before {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid #3b82f6;
      border-radius: 50%;
    }

    .icon-info::after {
      content: 'i';
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      color: #3b82f6;
      font-size: 18px;
      line-height: 24px;
      text-align: center;
      font-weight: bold;
      font-style: italic;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #1f2937;
    }

    .toast-message {
      color: #6b7280;
      font-size: 14px;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    /* Close Icon - X */
    .icon-close {
      position: relative;
      width: 16px;
      height: 16px;
    }

    .icon-close::before,
    .icon-close::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 2px;
      background: #6b7280;
    }

    .icon-close::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    .icon-close::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  closeToast(id: string): void {
    this.toastService.remove(id);
  }
}