import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  serverUrl: string;
  constructor(private http: HttpClient) {
    this.serverUrl = environment.baseUrl + "/api";
  }

  // Common HTTP methods
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.serverUrl}${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.serverUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.serverUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.serverUrl}${endpoint}`);
  }

  // File upload
  upload(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post(`${this.serverUrl}${endpoint}`, formData);
  }
  export<T>(url: string): Observable<Blob> {
    return this.http.get(this.serverUrl + url, { responseType: 'blob' });
  }
  public download<T>(url: string): Observable<Blob> {
      return this.http.get(this.serverUrl + url, { responseType: 'blob' });
  }
  // Authentication methods
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.post('/auth/login', credentials);
  }
  // Add to your http.service.ts
  postWithProgress(url: string, data: any): Observable<any> {
    return this.http.post(`${this.serverUrl}${url}`, data, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
            return { type: 'progress', progress: progress };
          case HttpEventType.Response:
            return { type: 'response', body: event.body };
          default:
            return { type: 'other' };
        }
      })
    );
  }
  

  refreshToken(token: string): Observable<any> {
    return this.post('/auth/refresh-token', { token });
  }
}
