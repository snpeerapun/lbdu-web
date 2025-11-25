import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
declare var google: any;
declare var FB: any;

// Extend the Window interface globally
declare global {
  interface Window {
    fbAsyncInit: () => void;
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get redirect URL from query params if it exists
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params['redirect'] || null;
    });

    if (this.authService.isAuthenticated()) {
      this.navigateAfterLogin();
    }
    console.log(environment.googleClientId)
    
  }
 

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (data:any) => {
         
          this.navigateAfterLogin();
        },
        error: (error) => {
          this.alertService.error(error.error.message || 'Login failed');
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
 
  // Helper method to navigate after successful login
  private navigateAfterLogin(): void {
    if (this.redirectUrl) {
      // Remove any leading slashes to ensure proper navigation
      const redirectPath = this.redirectUrl.replace(/^\/+/, '');
     
      this.router.navigate(['/' + redirectPath]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
