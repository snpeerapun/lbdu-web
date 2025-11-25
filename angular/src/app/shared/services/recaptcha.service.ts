import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  constructor(private http: HttpClient) {}

  verifyCaptcha(token: string): Observable<any> {
    // In a real application, you would verify with your backend
    return this.http.post('/api/verify-captcha', { token });
  }
}