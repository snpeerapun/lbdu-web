import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ng-otp-input',
  templateUrl: './ng-otp-input.component.html',
  styleUrls: ['./ng-otp-input.component.scss']
})
export class NgOtpInputComponent implements OnInit {
  @Input() otpControl!: FormControl;
  @Input() length: number = 6;
  @Output() otpChange = new EventEmitter<string>();
  
  otpDigits: string[] = [];
  @ViewChildren('otpInput') otpInputsList!: QueryList<ElementRef>;
  
  constructor() { }

  ngOnInit(): void {
    this.otpDigits = Array(this.length).fill('');
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.otpInputsList.forEach((el, index) => {
        el.nativeElement.value = this.otpDigits[index]; // กำหนดค่าให้ถูกต้อง
      });
    });
  }
  
  onDigitInput(index: number, event: any) {
    const value = event.target.value.replace(/\D/g, ''); // รับเฉพาะตัวเลข
    if (!value) return;

    this.otpDigits[index] = value; // อัปเดตค่าให้ otpDigits

    // โฟกัสไปที่ช่องถัดไป ถ้ามีค่า
    if (value.length === 1 && index < this.length - 1) {
      setTimeout(() => this.otpInputsList.toArray()[index + 1].nativeElement.focus(), 10);
    }
    
    this.updateOtpControl();
  }
  
  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && this.otpDigits[index] === '' && index > 0) {
      event.preventDefault();
      this.otpInputsList.toArray()[index - 1].nativeElement.focus();
    }
  }
  
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, this.length).split('');
    
    digits.forEach((digit, index) => {
        this.otpDigits[index] = digit;
    });

    this.updateOtpControl();

    setTimeout(() => this.otpInputsList.toArray()[this.otpDigits.length - 1].nativeElement.focus(), 10);
    }
    
  private updateOtpControl() {
    const combinedOtp = this.otpDigits.join('');
    this.otpControl.setValue(combinedOtp);
    this.otpChange.emit(combinedOtp);
  }
}
