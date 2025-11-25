import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NgOtpInputComponent } from 'src/app/components/forms/ng-otp-input.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  newPasswordForm: FormGroup;
  isLoading = false;
  showOtpScreen = false;
  showNewPasswordScreen = false;
  email = '';
  refCode='';
  showPassword = false;
  showConfirmPassword = false;

  @ViewChild('otpInput') otpInputComponent!: NgOtpInputComponent;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.newPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // No longer needed as we're using the OTP component
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.email = this.forgotPasswordForm.value.email;
    var forgot= {
      email: this.email
    }
    this.authService.forgotPassword(forgot).subscribe({
      next: (response:any) => {
        this.showOtpScreen = true;
        this.isLoading = false;
        this.refCode=response.refCode
      },
      error: (error) => {
        this.alertService.error(error.error.message || 'Failed to send reset instructions');
        this.isLoading = false;
      }
    });
  }

  onOtpChange(otp: string) {
    console.log('OTP changed:', otp);
    // The OTP value is already set in the form control by the NgOtpInputComponent
    // We just need to check if we should verify the OTP
    
    // Verify OTP if all 6 digits are entered
    if (otp.length === 6) {
      this.verifyOtp();
    }
  }

  verifyOtp() {
    console.log('Verifying OTP:', this.otpForm.value);
    console.log('Form validity:', this.otpForm.valid);
    
    if (this.otpForm.invalid) {
      console.log('Form is invalid:', this.otpForm.errors);
      return;
    }

    this.isLoading = true;
    const data = {
      email: this.email,
      refCode:this.refCode,
      otp: this.otpForm.value.otp
    };

    console.log('Sending verification data:', data);
    
    this.authService.verifyOtp(data).subscribe({
      next: () => {
        this.showNewPasswordScreen = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.error(error.error.message || 'Invalid OTP. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onResetPassword() {
    if (this.newPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const data = {
      email: this.email,
      otp: this.otpForm.value.otp,
      refCode:this.refCode,
      password: this.newPasswordForm.value.password
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.alertService.success('Password reset successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.alertService.error(error.error.message || 'Failed to reset password');
        this.isLoading = false;
      }
    });
  }

  resendOtp() {
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.alertService.success('New OTP sent successfully');
        this.isLoading = false;
        
        // Clear the OTP input
        if (this.otpInputComponent) {
          this.otpForm.get('otp')?.setValue('');
        }
      },
      error: (error) => {
        this.alertService.error(error.error.message || 'Failed to resend OTP');
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
