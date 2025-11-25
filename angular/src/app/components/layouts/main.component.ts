import { Component, OnInit, ViewChild, OnDestroy, HostListener, NgZone, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-main',
  template: `
    <div class="wrapper">
      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="(loading$ | async) ?? false">
        <div class="loading-spinner">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <app-sidebar #sidebar></app-sidebar>
      
      <!-- Page Content -->
      <div class="content" [class.sidebar-collapsed]="sidebar.isSidebarCollapsed">
        <!-- Navbar -->
        <app-navbar (sidebarToggle)="toggleSidebar()"></app-navbar>
        
        <!-- Main Content -->
        <div class="wrap-content">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Footer -->
        <app-footer></app-footer>
        <app-toast-container></app-toast-container>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      width: 100%;
      align-items: stretch;
      position: relative;
      min-height: 100vh;
    }
    
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-spinner {
      .spinner-border {
        width: 3rem;
        height: 3rem;
        color: var(--primary-500);
      }
    }
    
    .content {
      width: 100%;
      min-height: 100vh;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      margin-left: 220px;
    }
    
    
    
    .wrap-content {
      flex: 1;
      padding: 20px;
      
    }
    
    @media (max-width: 768px) {
      .content {
        margin-left: 0;
        padding: 0;
      }
      
      .content.sidebar-collapsed {
        margin-left: 0;
      }
      
      .wrap-content {
        padding: 15px;
      }
    }
  `]
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  private destroy$ = new Subject<void>();
  private resizeSubject = new Subject<void>();
  private currentScreenWidth: number = 0;
  
  loading$ = this.loadingService.loading$;

  
  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private ngZone: NgZone,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize screen width
    this.currentScreenWidth = window.innerWidth;
    
    // Setup resize debounce
    this.resizeSubject.pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.handleScreenResize();
    });

 

  }
  
  ngOnInit(): void {
    // Load menu data
    this.navigationService.loadMenuItems().subscribe();
    // ✅ Subscribe to loading$ to force Change Detection
    this.loadingService.loading$.subscribe(() => {
      this.cdr.detectChanges(); // ✅ Force Change Detection to avoid NG0100 error
    });
    // Listen for route changes to trigger DOM updates
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Update DOM after route change
        setTimeout(() => {
          this.updateChartsDom();
        }, 100);
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Initial DOM update after view initialization
    setTimeout(() => {
      this.updateChartsDom();
    }, 100);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
      
      // รอให้ animation เสร็จ แล้วอัปเดต DOM พร้อม trigger change detection ใหม่
      setTimeout(() => {
        this.updateChartsDom();
        this.cdr.detectChanges();
      }, 300); // รอประมาณ 300ms ตามที่คุณตั้งค่าไว้
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.ngZone.run(() => {
      this.resizeSubject.next();
    });
  }
  
  private handleScreenResize(): void {
    const newWidth = window.innerWidth;
    
    // Only update if there's a significant change in width
    if (Math.abs(this.currentScreenWidth - newWidth) > 10) {
      this.currentScreenWidth = newWidth;
      this.updateChartsDom();
    }
  }
  
  private updateChartsDom(): void {
    // Dispatch a custom resize event that chart components can listen for
    const resizeEvent = new Event('resize-charts');
    window.dispatchEvent(resizeEvent);
    
    // Force echarts instances to resize
    const chartElements = document.querySelectorAll('.chart-container');
    if (chartElements.length > 0) {
      chartElements.forEach(element => {
        // Add a small class toggle to force DOM reflow
        element.classList.add('resize-trigger');
        setTimeout(() => {
          element.classList.remove('resize-trigger');
        }, 10);
      });
    }
  }
}
