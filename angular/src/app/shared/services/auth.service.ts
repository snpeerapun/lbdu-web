import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HttpService } from './http.service';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
 
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly MENU_KEY = 'menu';
  private readonly USER_KEY = 'user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpService
  ) {}
  

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post('/auth/login', credentials).pipe(
      tap((response:any) => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.MENU_KEY, JSON.stringify(response.menu));
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
        this.isAuthenticatedSubject.next(true);
      })
    );
  }
  // 🔥 Call backend `/auth/google` with Google ID Token
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post('/auth/google', { idToken }).pipe(
      tap((response: any) => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

 
  loginWithFacebook(accessToken: string): Observable<LoginResponse> {
    return this.http.post('/auth/facebook', { accessToken }).pipe(
      tap((response:any) => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
        //localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post('/auth/register', userData);
  }
 
  verifyOtp(obj:any): Observable<any> {
    return this.http.post('/auth/verify-otp', obj);
  }

  resetPassword(data: { email: string; otp: string; password: string }): Observable<any> {
    return this.http.post('/auth/reset-password', data);
  }

  forgotPassword(obj: any): Observable<any> {
    return this.http.post('/auth/forgot-password',obj);
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.MENU_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    //console.log(token)
    return !!token;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
 
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getMenu(): any {
    const menuStr = localStorage.getItem(this.MENU_KEY);
    return menuStr ? JSON.parse(menuStr) : null;
  }
}
