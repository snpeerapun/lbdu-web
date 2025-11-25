import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}
  private isFileUploadRequest(request: HttpRequest<any>): boolean {
    // ตรวจสอบ FormData
    if (request.body instanceof FormData) return true;
    
    // ตรวจสอบ Content-Type
    const contentType = request.headers.get('Content-Type');
    if (contentType?.includes('multipart/form-data')) return true;
    
    // ตรวจสอบ URL patterns
    const uploadEndpoints = ['/upload', '/import', '/file'];
    return uploadEndpoints.some(endpoint => request.url.includes(endpoint));
  }
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Show loading indicator
    this.loadingService.show();

    // ไม่แทรกแซง request ที่ไปยัง OpenAI API
    if (request.url.includes('api.openai.com')) {
      return next.handle(request).pipe(finalize(() => {
        // Hide loading when request completes
        this.loadingService.hide();
      }));
    }

    // Get the auth token from local storage
    const token = localStorage.getItem('access_token');
    const currentLang = localStorage.getItem('app_language') || 'th';

        // Check if this is a file upload request
    const isFileUpload = this.isFileUploadRequest(request);

    // Set headers based on request type
    let headers: { [key: string]: string } = {
      'Accept': 'application/json',
      'Accept-Language': currentLang
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    
    // For file uploads, don't set Content-Type (let browser set it with boundary)
    if (!isFileUpload) {
      headers['Content-Type'] = 'application/json';
    }
    const authReq = request.clone({
      setHeaders: headers
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Clear auth data
          this.authService.logout();
          // Show error message
          //this.alertService.error('Your session has expired. Please log in again.');
          
          // Redirect to login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }
        return throwError(() => error);
      }),
      // Hide loading indicator when request completes
      finalize(() => {
        
        this.loadingService.hide();
      })
    );
  }
}
