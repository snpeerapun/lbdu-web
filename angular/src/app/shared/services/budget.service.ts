import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Budget, BudgetItem, Department, BudgetCategory } from '../models/budget.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = environment.baseUrl + '/api/budgets';
  private mockDataUrl = 'assets/mock/budgets.json';

  // Temporary mock data
  private mockDepartments: Department[] = [
    { id: 1, name: 'IT Department', code: 'IT' },
    { id: 2, name: 'Marketing Department', code: 'Marketing' },
    { id: 3, name: 'HR Department', code: 'HR' }
  ];

  private mockCategories: BudgetCategory[] = [
    {
      id: 1,
      name: 'Infrastructure',
      code: 'INFRA',
      subCategories: [
        { id: 1, name: 'Cloud Services', code: 'CLOUD', categoryId: 1 },
        { id: 2, name: 'Data Center', code: 'DC', categoryId: 1 },
        { id: 3, name: 'Network', code: 'NET', categoryId: 1 }
      ]
    },
    {
      id: 2,
      name: 'Software',
      code: 'SW',
      subCategories: [
        { id: 4, name: 'Licenses', code: 'LIC', categoryId: 2 },
        { id: 5, name: 'Development Tools', code: 'DEV', categoryId: 2 },
        { id: 6, name: 'Security Software', code: 'SEC', categoryId: 2 }
      ]
    },
    {
      id: 3,
      name: 'Marketing',
      code: 'MKT',
      subCategories: [
        { id: 7, name: 'Digital Marketing', code: 'DIG', categoryId: 3 },
        { id: 8, name: 'Content Creation', code: 'CONT', categoryId: 3 },
        { id: 9, name: 'Events', code: 'EVT', categoryId: 3 }
      ]
    },
    {
      id: 4,
      name: 'Training',
      code: 'TRN',
      subCategories: [
        { id: 10, name: 'Technical Training', code: 'TECH', categoryId: 4 },
        { id: 11, name: 'Soft Skills', code: 'SOFT', categoryId: 4 },
        { id: 12, name: 'Certifications', code: 'CERT', categoryId: 4 }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return of(this.mockDepartments);
  }

  getCategories(): Observable<BudgetCategory[]> {
    return of(this.mockCategories);
  }

  getBudgets(filters?: any): Observable<Budget[]> {
    return this.http.get<{budgets: Budget[]}>('assets/mock/budgets.json').pipe(
      map(response => {
        let budgets = response.budgets;
        
        // Apply filters if provided
        if (filters) {
          if (filters.fiscalYear) {
            budgets = budgets.filter(budget => budget.fiscalYear === filters.fiscalYear);
          }
          if (filters.department) {
            budgets = budgets.filter(budget => budget.department === filters.department);
          }
          if (filters.status) {
            budgets = budgets.filter(budget => budget.status === filters.status);
          }
        }
        
        return budgets;
      }),
      catchError(error => {
        console.error('Error loading budgets:', error);
        return of([]);
      })
    );
  }

  getBudgetById(id: string | number): Observable<Budget | null> {
    return this.http.get<{budgets: Budget[]}>('assets/mock/budgets.json').pipe(
      map(response => {
        const budget = response.budgets.find(b => b.id.toString() === id.toString());
        return budget || null;
      }),
      catchError(error => {
        console.error(`Error loading budget with id ${id}:`, error);
        return of(null);
      })
    );
  }

  saveBudget(budget: Budget): Observable<Budget> {
    if (budget.id) {
      return this.http.put<Budget>(`${this.apiUrl}/${budget.id}`, budget);
    }
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Helper methods
  calculateMonthlyTotal(items: BudgetItem[], month: number): number {
    return items.reduce((sum, item) => sum + (item.monthlyAmounts[month] || 0), 0);
  }

  calculateTotalAmount(items: BudgetItem[]): number {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  }

  getFiscalYears(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }
}
