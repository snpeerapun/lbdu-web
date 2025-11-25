import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showScrollButton = false;

  constructor(private translate: TranslateService) {
    // Get saved language or use browser language or default to 'th'
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = savedLang || (browserLang === 'th' ? 'th' : 'en');

    // Set default language
    translate.setDefaultLang('th');
    
    // Use the determined language
    this.setLanguage(defaultLang);
  }

  ngOnInit(): void {}

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Show button when page is scrolled more than 300px
    this.showScrollButton = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
