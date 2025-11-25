import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MenuCategory, NavigationService } from 'src/app/shared/services/navigation.service';
import { AppTranslateService } from 'src/app/shared/services/translate.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <nav id="sidebar" [class.active]="!isSidebarCollapsed">
       <!--<div class="sidebar-header d-flex justify-content-between align-items-center">
       
        <div class="logo-container">
          <img src="assets/images/logo.png" alt="Logo" class="logo" [class.small]="isSidebarCollapsed">
        </div>
        <button class="toggle-btn d-md-none" (click)="toggleSidebar()">
          <i class="fas" [class.fa-times]="!isSidebarCollapsed" [class.fa-bars]="isSidebarCollapsed"></i>
        </button>
       
      </div>-->
      
      <div class="sidebar-content mt-4">
        <!-- User Profile Section -->
        <div class="user-profile mb-4 text-center" [class.collapsed]="isSidebarCollapsed">
          <img src="assets/images/user-avatar.jpg" alt="User Avatar" class="rounded-circle mb-2">
          <div class="user-info" [class.d-none]="isSidebarCollapsed">
            <h6 class="mb-0">John Doe</h6>
            <p class="text-muted small">Administrator</p>
          </div>
        </div>
        
        <!-- Navigation Menu -->
        <ul class="list-unstyled components">
        <li class="mb-2">
            <a 
              [routerLink]="['/dashboard']" 
              routerLinkActive="active"
              class="nav-link d-flex align-items-center"
            >
              <span class="menu-icon">
                <i class="fas fa-tachometer-alt  me-2"></i>
              </span>
              <span class="menu-text" >Dashboard</span>
            </a>
          </li>
          <li *ngFor="let category of menuCategories; let i = index" class="mb-2">
            <a 
              href="javascript:void(0)" 
              (click)="toggleCategory(i)"
              class="nav-link d-flex justify-content-between align-items-center"
              [class.collapsed]="!isCategoryExpanded(i)"
              [class.active]="isCategoryActive(category)"
            >
              <span>
                <i [class]="category.icon" class="me-2"></i>
                <span  >{{ category.label }}</span>
              </span>
              <i class="fas fa-chevron-down" 
                 [@rotateChevron]="isCategoryExpanded(i) ? 'down' : 'right'"
                 ></i>
            </a>
            <ul class="submenu" [@submenuAnimation]="isCategoryExpanded(i) ? 'expanded' : 'collapsed'">
              <li *ngFor="let menu of category.items">
                <a 
                  [routerLink]="[menu.url]"
                  routerLinkActive="active"
                  class="nav-link ps-4"
                >
                 
                  <span >{{ menu.label }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Footer Links 
        <div class="sidebar-footer mt-5" [class.icons-only]="isSidebarCollapsed">
          <ul class="list-unstyled">
       
            <li>
              <a href="#" class="nav-link">
                <i class="fas fa-question-circle me-2"></i>
                <span [class.d-none]="isSidebarCollapsed">Help</span>
              </a>
            </li>
            <li>
              <a href="#" class="nav-link text-danger">
                <i class="fas fa-sign-out-alt me-2"></i>
                <span [class.d-none]="isSidebarCollapsed">Logout</span>
              </a>
            </li>
          </ul>
        </div>-->
      </div>
    </nav>
    <div class="sidebar-overlay" [class.active]="!isSidebarCollapsed && isMobile" (click)="closeSidebar()"></div>
  `,
  styles: [`
    #sidebar {
      
      width: 220px;
      background: linear-gradient(to bottom, #0a7c76, #064e4a);
      color: #fff;
      transition: all 0.3s;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      overflow-y: auto;
    }
    
    #sidebar.active {
      margin-left: 0;
    }
    
    #sidebar.collapsed {
      min-width: 80px;
      max-width: 80px;
    }
    
    .sidebar-header {
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
    }
    
    .sidebar-content {
      
    }
    
    .logo {
      max-width: 120px;
      transition: all 0.3s;
    }
    
    .logo.small {
      max-width: 40px;
    }
    
    .toggle-btn {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }
    
    .user-profile {
      transition: all 0.3s;
    }
    
    .user-profile img {
      width: 80px;
      height: 80px;
      transition: all 0.3s;
    }
    
    .user-profile.collapsed img {
      width: 40px;
      height: 40px;
    }
    
    #sidebar .components {
      padding: 0;
    }
    
    #sidebar .nav-link {
      padding: 10px 15px;
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    #sidebar .nav-link:hover {
      color: #fff;
      background: rgba(0, 0, 0, 0.2);
    }
    
    #sidebar .nav-link.active {
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
    }
    
    .submenu {
      overflow: hidden;
      list-style: none;
      margin-left: 0px;
      padding-left: 0px;
      transition: all 0.3s;
    }
    
    #sidebar ul li ul li a {
      padding-left: 30px;
      background: rgba(0, 0, 0, 0.25);
    }
    
    #sidebar ul li ul li a:hover {
      background: rgba(0, 0, 0, 0.35);
    }
    
    .small-icon {
      font-size: 0.5rem;
    }
    
    #sidebar .sidebar-footer {
      border-top: 1px solid rgb(4, 74, 70);
      padding-top: 15px;
      transition: all 0.3s;
    }
    
    .sidebar-footer.icons-only i {
      margin-right: 0 !important;
      font-size: 1.2rem;
    }
    
    /* Custom scrollbar */
    #sidebar::-webkit-scrollbar {
      width: 5px;
    }
    
    #sidebar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    
    #sidebar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    #sidebar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .sidebar-overlay {
      display: none;
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      transition: all 0.3s;
      top: 0;
      left: 0;
    }
    
    .sidebar-overlay.active {
      display: block;
      opacity: 1;
    }
    
    @media (max-width: 768px) {
      #sidebar {
        margin-left: -250px;
      }
      
      #sidebar.active {
        margin-left: 0;
      }
      
      #sidebar.collapsed {
        margin-left: -80px;
      }
      
      #sidebar.collapsed.active {
        margin-left: 0;
      }
    }
  `],
  animations: [
    trigger('submenuAnimation', [
      state('expanded', style({
        height: '*',
        opacity: 1
      })),
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('expanded <=> collapsed', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('rotateChevron', [
      state('down', style({
        transform: 'rotate(0deg)'
      })),
      state('right', style({
        transform: 'rotate(-90deg)'
      })),
      transition('down <=> right', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  menuCategories: MenuCategory[] = [];
  expandedStates: boolean[] = [];
  isSidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  currentUrl: string = '';
  
  constructor(
    private navigationService: NavigationService,
    private translateService: AppTranslateService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if mobile on init
    this.checkScreenSize();
    
    // Get current URL immediately
    this.currentUrl = this.router.url;
    
    // Track URL changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      this.autoExpandActiveCategory();
    });
    
    // Load menu items from the navigation service
    this.navigationService.loadMenuItems().subscribe(categories => {
      this.menuCategories = categories;
      // Initialize all categories as collapsed
      this.expandedStates = new Array(categories.length).fill(false);
      // Auto expand active category after menu items are loaded
      this.autoExpandActiveCategory();
    });
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }
  
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  
  closeSidebar(): void {
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }
  
  toggleCategory(index: number): void {
    // If in mobile or collapsed mode, expand the sidebar first
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }
    
    // Close other categories when opening a new one
    if (!this.expandedStates[index]) {
      this.expandedStates = this.expandedStates.map((_, i) => i === index);
    } else {
      this.expandedStates[index] = !this.expandedStates[index];
    }
  }
  
  isCategoryExpanded(index: number): boolean {
    return this.expandedStates[index];
  }
  
  isCategoryActive(category: MenuCategory): boolean {
    if (!this.currentUrl || !category) return false;
    
    // Check if any menu item in the category matches current URL
    return category.items?.some(item => 
      this.currentUrl === item.url || this.currentUrl.startsWith(item.url + '/')
    ) || false;
  }
  
  autoExpandActiveCategory(): void {
    if (!this.currentUrl || !this.menuCategories.length) return;
    
    // Find the category that contains the current URL
    const activeIndex = this.menuCategories.findIndex(category => 
      category.items?.some(item => 
        this.currentUrl === item.url || this.currentUrl.startsWith(item.url + '/')
      )
    );
    
    if (activeIndex >= 0) {
      // Expand only the active category
      this.expandedStates = this.expandedStates.map((_, i) => i === activeIndex);
    }
  }
}