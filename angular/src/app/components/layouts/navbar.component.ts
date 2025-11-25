import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
 
interface Breadcrumb {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-light ">
      <div class="container-fluid">
        <!-- Sidebar Toggle Button -->
        <button type="button" id="sidebarCollapse" class="btn btn-primary me-3 d-md-none">
          <i class="fas fa-bars"></i>
        </button>
        
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="d-none d-md-block">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item" *ngFor="let breadcrumb of breadcrumbs; let last = last">
              <a *ngIf="!last" [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
              <span *ngIf="last" class="active">{{ breadcrumb.label }}</span>
            </li>
          </ol>
        </nav>
        
        <!-- Navbar Right Side -->
        <div class="ms-auto d-flex align-items-center">
          <!-- Search -->
          <div class="position-relative me-3 d-none d-md-block">
            <input type="text" class="form-control form-control-sm" placeholder="Search...">
            <i class="fas fa-search position-absolute top-50 end-0 translate-middle-y me-2"></i>
          </div>
          
          <!-- Notifications -->
          <div class="dropdown me-3">
            <a class="nav-link position-relative" href="#" role="button" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-bell"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
              <li><h6 class="dropdown-header">Notifications</h6></li>
              <li><a class="dropdown-item" href="#">New budget alert</a></li>
              <li><a class="dropdown-item" href="#">Expense approval needed</a></li>
              <li><a class="dropdown-item" href="#">Budget limit reached</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-primary" href="#">View all notifications</a></li>
            </ul>
          </div>
          
          <!-- User Profile -->
          <div class="dropdown">
            <a class="nav-link d-flex align-items-center" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="assets/images/user-avatar.jpg" alt="User Avatar" class="rounded-circle me-2" style="width: 32px; height: 32px;">
              <span class="d-none d-md-block">John Doe</span>
              <i class="fas fa-chevron-down ms-1 small"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i> Profile</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i> Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" (click)="logout()"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
     
      padding: 0.75rem 1rem;
    }
    
    .breadcrumb {
      margin-bottom: 0;
      background: transparent;
    }
    
    .breadcrumb-item a {
      color: #0a7c76;
      text-decoration: none;
    }
    
    .breadcrumb-item a:hover {
      color: #064e4a;
      text-decoration: underline;
    }
    
    .breadcrumb-item.active {
      color: #495057;
    }
    
    .form-control {
      border-radius: 20px;
      padding-right: 30px;
      border-color: #e9ecef;
    }
    
    .form-control:focus {
      border-color: #0a7c76;
      box-shadow: 0 0 0 0.25rem rgba(10, 124, 118, 0.25);
    }
    
    .dropdown-menu {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 8px;
    }
    
    .dropdown-item {
      padding: 0.5rem 1rem;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .dropdown-item.active, .dropdown-item:active {
      background-color: #0a7c76;
      color: #fff;
    }
    
    #sidebarCollapse {
      background-color: #0a7c76;
      border-color: #0a7c76;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
    }
    
    #sidebarCollapse:hover {
      background-color: #064e4a;
      border-color: #064e4a;
    }
    
    .badge {
      background-color: #dc3545;
    }
  `]
})
export class NavBarComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to route changes to update breadcrumbs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumbs();
    });
    
    // Initialize breadcrumbs
    this.updateBreadcrumbs();
  }
  
  updateBreadcrumbs(): void {
    // Start with home
    this.breadcrumbs = [
      { label: 'Home', url: '/', isActive: false }
    ];
    
    // Get current URL path
    const urlPath = this.router.url;
    if (urlPath === '/') {
      return;
    }
    
    // Split the URL path into segments
    const segments = urlPath.split('/').filter(segment => segment);
    
    if (segments.length > 0) {
      // First segment is usually the main category
      const categoryKey = segments[0];
      
      this.navigationService.loadMenuItems().subscribe(categories => {
        // Find the category
        const category = categories.find(cat => cat.key.toLowerCase() === categoryKey);
        
        if (category) {
          this.breadcrumbs.push({
            label: category.label,
            url: category.url,
            isActive: segments.length === 1
          });
          
          // If we have a second segment, it's a menu item
          if (segments.length > 1) {
            const itemKey = segments[1];
            const item = category.items.find(i => i.key === itemKey || i.url.includes(itemKey));
            
            if (item) {
              this.breadcrumbs.push({
                label: item.label,
                url: item.url,
                isActive: true
              });
            }
          }
        }
      });
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
}
