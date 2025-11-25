import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError, shareReplay } from 'rxjs/operators';

export interface MenuItem {
  label: string;
  key: string;
  icon: string;
  url: string;
}

export interface MenuCategory {
 
  label: string;
  key: string;
  icon: string;
  url: string;
  items: MenuItem[];
}

export interface MenuItemLookupResult {
  category?: MenuCategory;
  item?: MenuItem;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private menuCategoriesSubject = new BehaviorSubject<MenuCategory[]>([]);
  menuCategories$: Observable<MenuCategory[]> = this.menuCategoriesSubject.asObservable();
  
  private expandedCategories: BehaviorSubject<boolean>[] = [];
  private menuDataLoaded = false;
  private cachedMenuRequest: Observable<MenuCategory[]> | null = null;

  constructor(private http: HttpClient) {}

  loadMenuItems(): Observable<MenuCategory[]> {
    // Return cached data if already loaded
    if (this.menuDataLoaded) {
      return of(this.menuCategoriesSubject.value);
    }
    
    // Return cached observable if request is in progress
    if (this.cachedMenuRequest) {
      return this.cachedMenuRequest;
    }
    
    // Make the HTTP request and cache it
    this.cachedMenuRequest = this.http.get<MenuCategory[]>('assets/menu.json').pipe(
      tap(categories => {
        this.menuCategoriesSubject.next(categories);
        this.menuDataLoaded = true;
        
        // Initialize expanded state for each category (first one expanded by default)
        this.expandedCategories = categories.map((_, index) => 
          new BehaviorSubject<boolean>(index === 0)
        );
      }),
      catchError(error => {
        console.error('Error loading menu items:', error);
        return of([]);
      }),
      shareReplay(1)
    );
    
    return this.cachedMenuRequest;
  }
  
  toggleCategory(index: number): void {
    if (this.expandedCategories[index]) {
      const currentValue = this.expandedCategories[index].value;
      this.expandedCategories[index].next(!currentValue);
    }
  }
  
  isCategoryExpanded(index: number): Observable<boolean> {
    return this.expandedCategories[index] ? this.expandedCategories[index].asObservable() : of(false);
  }
  
  getIconClass(key: string): string {
    // Map route keys to Font Awesome icon classes
    const iconMap: {[key: string]: string} = {
      'dashboard': 'fa-tachometer-alt',
      'budget': 'fa-chart-pie',
      'income': 'fa-money-bill-wave',
      'expense': 'fa-shopping-cart',
      'users': 'fa-users',
      'settings': 'fa-cog',
      'profile': 'fa-user',
      // Add more mappings as needed
    };
    
    return iconMap[key] || 'fa-circle'; // Default icon if not found
  }
  
  /**
   * Finds a menu item by its route key and returns both the item and its parent category
   * @param key The route key to search for
   * @returns An observable with the menu item and its category
   */
  getMenuItemByKey(key: string): Observable<MenuItemLookupResult> {
    return this.loadMenuItems().pipe(
      map(categories => {
        const result: MenuItemLookupResult = {};
        
        for (const category of categories) {
          const item = category.items.find(item => item.key === key);
          if (item) {
            result.category = category;
            result.item = item;
            break;
          }
        }
        
        return result;
      })
    );
  }
  
  /**
   * Gets the URL for a menu item by its key
   * @param key The menu item key
   * @returns The URL string or empty string if not found
   */
  getUrlByKey(key: string): Observable<string> {
    return this.getMenuItemByKey(key).pipe(
      map(result => {
        if (result.item && result.item.url) {
          return result.item.url;
        }
        return '';
      })
    );
  }
}
