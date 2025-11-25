import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AppTranslateService {

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en'); // Set default language
    this.translate.use(this.getSavedLanguage()); // Use saved language or default
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('app_language', lang); // Save selected language
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }

  private getSavedLanguage(): string {
    return localStorage.getItem('app_language') || 'en';
  }

  translateKey(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}