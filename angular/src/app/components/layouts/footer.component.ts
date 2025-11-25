import { Component } from '@angular/core';
import { AppTranslateService } from 'src/app/shared/services/translate.service';
 
@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer mt-auto py-3">
      <div class="container-fluid">
        <div class="row align-items-center">
          <!-- Copyright -->
          <div class="col-md-4 text-center text-md-start">
            <span class="text-muted"> 2025 LHFUND. All rights reserved.</span>
          </div>
          
    
          
          <!-- App Download Links -->
          <div class="col-md-8 text-center text-md-end">
          <span class="text-muted"> PROD Version 1.2.34443.</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
    
      font-size: 0.875rem;
    }
     
    
    @media (max-width: 768px) {
      .footer {
        text-align: center;
      }
      
      .social-links, .app-links {
        margin-top: 1rem;
      }
    }
  `]
})
export class FooterComponent {
  constructor(private translateService: AppTranslateService) {}
}
