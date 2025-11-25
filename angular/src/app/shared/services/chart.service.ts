import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EChartsOption } from 'echarts';

export interface ChartData {
  budgetUtilization: {
    categories: string[];
    planned: number[];
    actual: number[];
  };
  incomeVsExpenses: {
    months: string[];
    income: number[];
    expenses: number[];
  };
  cashFlowTrend: {
    months: string[];
    cashFlow: number[];
  };
  expenseBreakdown: {
    categories: string[];
    values: number[];
  };
  budgetVariance: {
    categories: string[];
    planned: number[];
    actual: number[];
    variance: number[];
  };
  topSpendingCategories: {
    categories: string[];
    currentMonth: number[];
    previousMonth: number[];
  };
  upcomingPayments: Array<{
    name: string;
    amount: number;
    dueDate: string;
    category: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(private http: HttpClient) { }

  getChartData(): Observable<ChartData> {
    return this.http.get<ChartData>('assets/data/chart-data.json');
  }

  // Budget Utilization Chart (Donut/Pie Chart)
  getBudgetUtilizationChartOptions(data: ChartData): EChartsOption {
    const { categories, planned, actual } = data.budgetUtilization;
    const utilization = actual.map((value, index) => {
      return {
        name: categories[index],
        value: value,
        itemStyle: {
          color: this.getColorByIndex(index)
        }
      };
    });

    const remaining = planned.map((value, index) => {
      const diff = value - actual[index];
      return {
        name: `${categories[index]} (Remaining)`,
        value: diff > 0 ? diff : 0,
        itemStyle: {
          color: this.getColorByIndex(index, 0.3)
        }
      };
    });

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: categories
      },
      series: [
        {
          name: 'Budget Utilization',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [...utilization, ...remaining]
        }
      ]
    };
  }

  // Income vs Expenses Chart (Bar/Line Chart)
  getIncomeVsExpensesChartOptions(data: ChartData): EChartsOption {
    const { months, income, expenses } = data.incomeVsExpenses;
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Income', 'Expenses']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Income',
          type: 'bar',
          data: income,
          itemStyle: {
            color: '#0a7c76'
          }
        },
        {
          name: 'Expenses',
          type: 'bar',
          data: expenses,
          itemStyle: {
            color: '#e74c3c'
          }
        },
        {
          name: 'Income Trend',
          type: 'line',
          smooth: true,
          data: income,
          symbol: 'none',
          lineStyle: {
            width: 3,
            color: '#0a7c76'
          }
        },
        {
          name: 'Expenses Trend',
          type: 'line',
          smooth: true,
          data: expenses,
          symbol: 'none',
          lineStyle: {
            width: 3,
            color: '#e74c3c'
          }
        }
      ]
    };
  }

  // Cash Flow Trend Chart (Line Chart)
  getCashFlowTrendChartOptions(data: ChartData): EChartsOption {
    const { months, cashFlow } = data.cashFlowTrend;
    
    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Cash Flow',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(10, 124, 118, 0.8)'
                },
                {
                  offset: 1,
                  color: 'rgba(10, 124, 118, 0.1)'
                }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: cashFlow
        }
      ]
    };
  }

  // Expense Breakdown Chart (Pie Chart)
  getExpenseBreakdownChartOptions(data: ChartData): EChartsOption {
    const { categories, values } = data.expenseBreakdown;
    
    const pieData = categories.map((category, index) => {
      return {
        name: category,
        value: values[index],
        itemStyle: {
          color: this.getColorByIndex(index)
        }
      };
    });

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: categories
      },
      series: [
        {
          name: 'Expense Breakdown',
          type: 'pie',
          radius: '55%',
          center: ['40%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  // Budget Variance Chart (Column/Waterfall Chart)
  getBudgetVarianceChartOptions(data: ChartData): EChartsOption {
    const { categories, planned, actual, variance } = data.budgetVariance;
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const planned = params[0].value;
          const actual = params[1].value;
          const variance = actual - planned;
          const category = params[0].name;
          
          return `${category}<br/>
                  Planned: ${planned}<br/>
                  Actual: ${actual}<br/>
                  Variance: ${variance > 0 ? '+' + variance : variance}`;
        }
      },
      legend: {
        data: ['Planned', 'Actual']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Planned',
          type: 'bar',
          data: planned,
          itemStyle: {
            color: '#3498db'
          }
        },
        {
          name: 'Actual',
          type: 'bar',
          data: actual,
          itemStyle: {
            color: function(params: any) {
              const index = params.dataIndex;
              return variance[index] > 0 ? '#e74c3c' : '#2ecc71';
            }
          }
        }
      ]
    };
  }

  // Top Spending Categories Chart (Horizontal Bar Chart)
  getTopSpendingCategoriesChartOptions(data: ChartData): EChartsOption {
    const { categories, currentMonth, previousMonth } = data.topSpendingCategories;
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Current Month', 'Previous Month']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: categories
      },
      series: [
        {
          name: 'Current Month',
          type: 'bar',
          data: currentMonth,
          itemStyle: {
            color: '#0a7c76'
          }
        },
        {
          name: 'Previous Month',
          type: 'bar',
          data: previousMonth,
          itemStyle: {
            color: '#064e4a'
          }
        }
      ]
    };
  }

  // Helper function to generate colors
  private getColorByIndex(index: number, opacity: number = 1): string {
    const colors = [
      `rgba(10, 124, 118, ${opacity})`,
      `rgba(230, 126, 34, ${opacity})`,
      `rgba(52, 152, 219, ${opacity})`,
      `rgba(155, 89, 182, ${opacity})`,
      `rgba(46, 204, 113, ${opacity})`,
      `rgba(231, 76, 60, ${opacity})`,
      `rgba(149, 165, 166, ${opacity})`
    ];
    
    return colors[index % colors.length];
  }
}
