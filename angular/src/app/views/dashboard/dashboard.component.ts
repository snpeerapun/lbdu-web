import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';

import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartData, ChartService } from 'src/app/shared/services/chart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  chartData: ChartData | null = null;
  loading = true;
  error = false;
  
  // Chart options
  budgetUtilizationOptions: EChartsOption = {};
  incomeVsExpensesOptions: EChartsOption = {};
  cashFlowTrendOptions: EChartsOption = {};
  expenseBreakdownOptions: EChartsOption = {};
  budgetVarianceOptions: EChartsOption = {};
  topSpendingCategoriesOptions: EChartsOption = {};
  
  // Upcoming payments
  upcomingPayments: any[] = [];
  
  // Chart loading states
  chartLoading = {
    budgetUtilization: true,
    incomeVsExpenses: true,
    cashFlowTrend: true,
    expenseBreakdown: true,
    budgetVariance: true,
    topSpendingCategories: true
  };
  
  // Chart update options
  updateOptions: any = {
    notMerge: true,
    lazyUpdate: true
  };

  // For cleanup
  private destroy$ = new Subject<void>();
  private chartInstances = new Map<string, echarts.ECharts>();
  private resizeHandler: () => void;

  constructor(
    private chartService: ChartService,
    private ngZone: NgZone
  ) {
    this.resizeHandler = this.handleChartResize.bind(this);
  }

  ngOnInit(): void {
    this.loadChartData();
    window.addEventListener('resize-charts', this.resizeHandler);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize-charts', this.resizeHandler);
    
    this.chartInstances.forEach(instance => {
      if (instance && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
        } catch (error) {
          console.error('Error disposing chart:', error);
        }
      }
    });
    this.chartInstances.clear();
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.ngZone.run(() => {
      this.handleChartResize();
    });
  }

  // Export chart as image
  exportChart(chartId: string): void {
    const chart = this.getChartInstance(chartId);
    if (chart) {
      try {
        const base64 = chart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = base64;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting chart:', error);
      }
    }
  }

  // Toggle fullscreen mode for a chart
  toggleFullscreen(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.card') as HTMLElement;
    
    if (!card) return;

    if (!document.fullscreenElement) {
      card.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Get chart instance by ID
  private getChartInstance(chartId: string): echarts.ECharts | null {
    const instance = this.chartInstances.get(chartId);
    if (!instance) {
      console.warn(`Chart instance not found for ID: ${chartId}`);
      return null;
    }
    return instance;
  }

  // Handle chart resize events
  private handleChartResize(): void {
    if (this.chartInstances.size > 0) {
      setTimeout(() => {
        this.updateOptions = {
          ...this.updateOptions,
          animation: false
        };
        
        this.chartInstances.forEach(instance => {
          if (instance && typeof instance.resize === 'function') {
            try {
              instance.resize();
            } catch (error) {
              console.error('Error resizing chart:', error);
            }
          }
        });
      }, 50);
    }
  }

  // Load chart data
  loadChartData(): void {
    this.loading = true;
    this.error = false;
    
    Object.keys(this.chartLoading).forEach(key => {
      this.chartLoading[key as keyof typeof this.chartLoading] = true;
    });
    
    this.chartService.getChartData()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading chart data:', error);
          this.error = true;
          Object.keys(this.chartLoading).forEach(key => {
            this.chartLoading[key as keyof typeof this.chartLoading] = false;
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(data => {
        if (data) {
          this.chartData = data;
          this.initializeCharts(data);
          this.upcomingPayments = this.sortUpcomingPayments(data.upcomingPayments);
        }
      });
  }
  
  refreshData(): void {
    this.chartInstances.forEach(instance => {
      if (instance && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
        } catch (error) {
          console.error('Error disposing chart:', error);
        }
      }
    });
    this.chartInstances.clear();
    
    this.loadChartData();
  }
  
  // Initialize all charts
  initializeCharts(data: ChartData): void {
    this.initializeBudgetUtilizationChart(data);
    this.initializeIncomeVsExpensesChart(data);
    this.initializeCashFlowTrendChart(data);
    this.initializeExpenseBreakdownChart(data);
    this.initializeBudgetVarianceChart(data);
    this.initializeTopSpendingCategoriesChart(data);
  }
  
  initializeBudgetUtilizationChart(data: ChartData): void {
    this.budgetUtilizationOptions = this.chartService.getBudgetUtilizationChartOptions(data);
    this.chartLoading.budgetUtilization = false;
  }
  
  initializeIncomeVsExpensesChart(data: ChartData): void {
    this.incomeVsExpensesOptions = this.chartService.getIncomeVsExpensesChartOptions(data);
    this.chartLoading.incomeVsExpenses = false;
  }
  
  initializeCashFlowTrendChart(data: ChartData): void {
    this.cashFlowTrendOptions = this.chartService.getCashFlowTrendChartOptions(data);
    this.chartLoading.cashFlowTrend = false;
  }
  
  initializeExpenseBreakdownChart(data: ChartData): void {
    this.expenseBreakdownOptions = this.chartService.getExpenseBreakdownChartOptions(data);
    this.chartLoading.expenseBreakdown = false;
  }
  
  initializeBudgetVarianceChart(data: ChartData): void {
    this.budgetVarianceOptions = this.chartService.getBudgetVarianceChartOptions(data);
    this.chartLoading.budgetVariance = false;
  }
  
  initializeTopSpendingCategoriesChart(data: ChartData): void {
    this.topSpendingCategoriesOptions = this.chartService.getTopSpendingCategoriesChartOptions(data);
    this.chartLoading.topSpendingCategories = false;
  }
  
  sortUpcomingPayments(payments: any[]): any[] {
    return payments.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  
  getDaysRemaining(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  getStatusClass(daysRemaining: number): string {
    if (daysRemaining < 0) {
      return 'badge badge-danger';
    } else if (daysRemaining <= 3) {
      return 'badge badge-warning';
    } else {
      return 'badge badge-success';
    }
  }
  
  getStatusText(daysRemaining: number): string {
    if (daysRemaining < 0) {
      return 'เลยกำหนด';
    } else if (daysRemaining === 0) {
      return 'วันนี้';
    } else {
      return `อีก ${daysRemaining} วัน`;
    }
  }
  
  // Method to handle chart initialization
  onChartInit(chartInstance: echarts.ECharts): void {
    if (chartInstance) {
      try {
        const chartId = this.getChartId(chartInstance);
        
        this.chartInstances.set(chartId, chartInstance);
        
        setTimeout(() => {
          if (chartInstance && typeof chartInstance.resize === 'function') {
            chartInstance.resize();
          }
        }, 0);
      } catch (error) {
        console.error('Error initializing chart:', error);
      }
    }
  }
  
  // Helper method to get a unique identifier for a chart instance
  private getChartId(instance: echarts.ECharts): string {
    const container = instance.getDom();
    if (container && container.parentElement) {
      const cardHeader = container.parentElement.querySelector('.card-title');
      return cardHeader ? cardHeader.textContent || 'unknown' : 'unknown';
    }
    return 'unknown-' + Math.random().toString(36).substr(2, 9);
  }
}
