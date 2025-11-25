import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  forwardRef, 
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare var $: any; // jQuery

@Component({
  selector: 'ng-select',
  template: `
    <div class="ng-select-container" [class.ng-select-multiple]="multiple">

      <!-- Custom Select Display -->
      <div class="ng-select-display" 
           [class.ng-select-open]="isDropdownOpen"
           (click)="toggleDropdown()">
        
        <!-- Single Selection Display -->
        <div *ngIf="!multiple" class="ng-select-single">
          <span *ngIf="selectedDisplay; else placeholderTemplate" class="selected-text">
            {{ selectedDisplay }}
          </span>
          <ng-template #placeholderTemplate>
            <span class="placeholder-text">{{ placeholder }}</span>
          </ng-template>
          <div class="ng-select-actions">
            <i class="fas fa-chevron-down dropdown-arrow"></i>
          </div>
        </div>

        <!-- Multiple Selection Display -->
        <div *ngIf="multiple" class="ng-select-multiple-display">
          <div class="selected-tags" *ngIf="selectedItems.length > 0">
            <span class="tag" *ngFor="let item of selectedItems; trackBy: trackByFn">
              {{ item[labelProp] }}
              <i class="fas fa-times tag-remove" (click)="removeItem(item, $event)"></i>
            </span>
          </div>
          <span *ngIf="selectedItems.length === 0" class="placeholder-text">{{ placeholder }}</span>
          <div class="ng-select-actions">
            <i class="fas fa-chevron-down dropdown-arrow"></i>
          </div>
        </div>
      </div>

      <!-- Dropdown Options -->
      <div class="ng-select-dropdown" 
           [class.ng-select-dropdown-open]="isDropdownOpen"
           #dropdown>
        
        <!-- Search Input inside dropdown (always show when showFilter is true) -->
        <div class="ng-select-search-dropdown" *ngIf="showFilter">
          <input 
            #searchInput
            type="text" 
            class="form-control form-control-sm"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchText"
            (input)="onSearchChange()"
            (keydown)="onSearchKeyDown($event)"
            (blur)="onSearchBlur()"
          />
          
          <i class="fas fa-times clear-icon" 
             *ngIf="searchText" 
             (click)="clearSearch()"
             title="Clear search"></i>
        </div>
        
        <!-- No Results -->
        <div *ngIf="filteredOptions.length === 0 && searchText" class="no-results">
          
          {{ noResultsText }}
        </div>

        <!-- Options List -->
        <div class="options-list" *ngIf="filteredOptions.length > 0">
          <div 
            class="option-item"
            *ngFor="let opt of filteredOptions; let i = index; trackBy: trackByOption"
            [class.option-selected]="isSelected(opt[valueProp])"
            [class.option-highlighted]="i === highlightedIndex"
            [class.option-disabled]="opt.disabled"
            (click)="selectOption(opt)"
            (mouseenter)="highlightedIndex = i"
          >
            <!-- Checkbox for multiple -->
            <input 
              *ngIf="multiple" 
              type="checkbox" 
              [checked]="isSelected(opt[valueProp])"
              (click)="$event.stopPropagation()"
              readonly
            />
            
            <!-- Option text with highlighting -->
            <span [innerHTML]="highlightSearchText(opt[labelProp])"></span>
            
            <!-- Selected indicator -->
            <i *ngIf="!multiple && isSelected(opt[valueProp])" 
               class="fas fa-check option-check"></i>
          </div>
        </div>

        <!-- Select All / Clear All for multiple -->
        <div *ngIf="multiple && showSelectAll && filteredOptions.length > 0" class="select-all-section">
          <div class="option-item select-all-option" (click)="selectAll()">
            <input type="checkbox" [checked]="isAllSelected()" readonly>
            <span>{{ selectAllText }}</span>
          </div>
          <div class="option-item clear-all-option" (click)="clearAll()">
            <i class="fas fa-times"></i>
            <span>{{ clearAllText }}</span>
          </div>
        </div>
      </div>

      <!-- Hidden native select for form compatibility -->
      <select 
        #nativeSelect
        class="d-none"
        [attr.multiple]="multiple ? '' : null"
        (change)="onNativeSelectChange($event)"
        (blur)="onTouched()"
      >
        <option *ngIf="!multiple && placeholder" [value]="''">
          {{ placeholder }}
        </option>
        <option
          *ngFor="let opt of options"
          [value]="stringify(opt[valueProp])"
          [selected]="isSelected(opt[valueProp])"
        >
          {{ opt[labelProp] }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .ng-select-container {
      position: relative;
      width: 100%;
    }

    .ng-select-search-dropdown {
      position: relative;
      padding: 8px;
      border-bottom: 1px solid #dee2e6;
      background-color: #f8f9fa;
 

    }

    .ng-select-search-dropdown input {
      padding-right: 60px;
    }
    .ng-select-search-dropdown input:focus {
      border-color: none;
      box-shadow: none;
    }

    .search-icon {
      position: absolute;
      right: 38px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      pointer-events: none;
    }

    .clear-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .clear-icon:hover {
      color: #dc3545;
      background-color: #fff;
    }

    .ng-select-display {
      position: relative;
      min-height: 38px;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      padding: 6px 12px 6px 12px;
    }

    .ng-select-display:hover {
      border-color: #86b7fe;
    }

    .ng-select-display.ng-select-open {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 0.2rem rgba(28, 165, 155, 0.25);
  
    }

    .ng-select-single {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ng-select-multiple-display {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 26px;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      flex: 1;
    }

    .tag {
      background-color: #0d6efd;
      color: white;
      padding: 2px 6px;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 150px;
    }

    .tag-remove {
      cursor: pointer;
      font-size: 0.75rem;
      padding: 1px;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .tag-remove:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .placeholder-text {
      color: #6c757d;
      font-style: italic;
    }

    .selected-text {
      color: #212529;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ng-select-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .filter-btn {
      color: #6c757d;
      cursor: pointer;
      padding: 4px;
      border-radius: 3px;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .filter-btn:hover {
      color: #0d6efd;
      background-color: #f8f9fa;
    }

    .filter-btn.filter-active {
      color: #0d6efd;
      background-color: #e3f2fd;
    }

    .dropdown-arrow {
      color: #6c757d;
      transition: transform 0.2s;
      pointer-events: none;
      font-size: 0.875rem;
    }

    .ng-select-open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .ng-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      z-index: 1050;
      max-height: 300px;
      overflow-y: auto;
      display: none;
      margin-top: 2px;
    }

    .ng-select-dropdown-open {
      display: block;
    }

    .options-list {
      padding: 4px 0;
    }

    .option-item {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;
    }

    .option-item:hover,
    .option-highlighted {
      background-color: #f8f9fa;
    }

    .option-selected {
      background-color: #e3f2fd;
      border-left-color: #0d6efd;
    }

    .option-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-check {
      color: #0d6efd;
      margin-left: auto;
    }

    .no-results {
      padding: 20px;
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }

    .no-results i {
      display: block;
      font-size: 2rem;
      margin-bottom: 10px;
      opacity: 0.5;
    }

    .select-all-section {
      border-top: 1px solid #dee2e6;
      padding: 4px 0;
      background-color: #f8f9fa;
    }

    .select-all-option,
    .clear-all-option {
      font-weight: 500;
      color: #0d6efd;
    }

    .select-all-option:hover,
    .clear-all-option:hover {
      background-color: #e9ecef;
    }

    .highlight {
      background-color: #fff3cd;
      font-weight: bold;
      padding: 1px 2px;
      border-radius: 2px;
    }

    /* Responsive */
    @media (max-width: 576px) {
      .ng-select-dropdown {
        max-height: 200px;
      }
      
      .tag {
        max-width: 100px;
        font-size: 0.8rem;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelectComponent),
      multi: true,
    },
  ],
})
export class NgSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  
  @ViewChild('nativeSelect') nativeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('dropdown') dropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @Input() options: any[] = [];
  @Input() valueProp: string = 'id';
  @Input() labelProp: string = 'name';
  @Input() multiple: boolean = false;
  @Input() placeholder: string = 'Select an option';
  @Input() showFilter: boolean = true;
  @Input() searchPlaceholder: string = 'Search options...';
  @Input() noResultsText: string = 'No results found';
  @Input() showSelectAll: boolean = true;
  @Input() selectAllText: string = 'Select All';
  @Input() clearAllText: string = 'Clear All';
  @Input() caseSensitive: boolean = false;
  @Input() searchFields: string[] = []; // If empty, will use labelProp
  @Input() minSearchLength: number = 0;
  @Input() debounceTime: number = 300;

  @Output() onSelectionChange = new EventEmitter<any>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() onOpen = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  searchText: string = '';
  filteredOptions: any[] = [];
  isDropdownOpen: boolean = false;
  isSearchMode: boolean = false;
  highlightedIndex: number = -1;
  selectedItems: any[] = [];

  private _value: any = null;
  private onChangeFn: (val: any) => void = () => {};
  private onTouchFn: () => void = () => {};
  private searchTimeout: any;
  private documentClickListener?: (event: MouseEvent) => void;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    this.filteredOptions = [...this.options];
    this.updateSelectedItems();
    this.setupDocumentClickListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = [...this.options];
      this.updateSelectedItems();
      this.filterOptions();
    }
  }

  ngOnDestroy(): void {
    this.removeDocumentClickListener();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private setupDocumentClickListener(): void {
    this.documentClickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && !this.elementRef.nativeElement.contains(target)) {
        this.closeDropdown();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.documentClickListener);
    }
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener && typeof document !== 'undefined') {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this._value = value;
    this.updateSelectedItems();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  get selectedDisplay(): string {
    if (!this.multiple && this.selectedItems.length > 0) {
      return this.selectedItems[0][this.labelProp];
    }
    return '';
  }

  trackByFn(index: number, item: any): any {
    return item[this.valueProp] || index;
  }

  trackByOption(index: number, option: any): any {
    return option[this.valueProp] || index;
  }

  toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  toggleSearchMode(event: Event): void {
    event.stopPropagation();
    this.isSearchMode = !this.isSearchMode;
    
    if (this.isSearchMode) {
      if (!this.isDropdownOpen) {
        this.openDropdown();
      }
      // Focus search input after DOM update
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    } else {
      this.clearSearch();
    }
  }

  openDropdown(): void {
    this.isDropdownOpen = true;
    this.highlightedIndex = -1;
    this.onOpen.emit();
    
    // Auto focus search input if available
    if (this.showFilter && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.highlightedIndex = -1;
    this.onClose.emit();
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.filterOptions();
      this.onSearch.emit(this.searchText);
    }, this.debounceTime);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightPrevious();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  onSearchFocus(): void {
    if (!this.isDropdownOpen) {
      this.openDropdown();
    }
  }

  onSearchBlur(): void {
    // Delay to allow option click
    setTimeout(() => {
      if (!this.isDropdownOpen) {
        this.onTouchFn();
      }
    }, 150);
  }

  clearSearch(): void {
    this.searchText = '';
    this.filterOptions();
    this.onSearch.emit('');
  }

  private filterOptions(): void {
    if (!this.searchText || this.searchText.length < this.minSearchLength) {
      this.filteredOptions = [...this.options];
      return;
    }

    const searchFields = this.searchFields.length > 0 ? this.searchFields : [this.labelProp];
    const searchTerm = this.caseSensitive ? this.searchText : this.searchText.toLowerCase();

    this.filteredOptions = this.options.filter(option => {
      return searchFields.some(field => {
        const fieldValue = option[field];
        if (fieldValue) {
          const textValue = this.caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();
          return textValue.includes(searchTerm);
        }
        return false;
      });
    });

    this.highlightedIndex = -1;
  }

  highlightSearchText(text: string): string {
    if (!this.searchText || this.searchText.length < this.minSearchLength) {
      return text;
    }

    const searchTerm = this.caseSensitive ? this.searchText : this.searchText.toLowerCase();
    const targetText = this.caseSensitive ? text : text.toLowerCase();
    
    const index = targetText.indexOf(searchTerm);
    if (index !== -1) {
      const before = text.substring(0, index);
      const match = text.substring(index, index + searchTerm.length);
      const after = text.substring(index + searchTerm.length);
      return `${before}<span class="highlight">${match}</span>${after}`;
    }
    
    return text;
  }

  private highlightNext(): void {
    if (this.filteredOptions.length === 0) return;
    
    this.highlightedIndex = Math.min(
      this.highlightedIndex + 1, 
      this.filteredOptions.length - 1
    );
  }

  private highlightPrevious(): void {
    if (this.filteredOptions.length === 0) return;
    
    this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
  }

  selectOption(option: any): void {
    if (option.disabled) return;

    const value = option[this.valueProp];

    if (this.multiple) {
      const currentValues = Array.isArray(this._value) ? [...this._value] : [];
      const index = currentValues.findIndex(val => this.stringify(val) === this.stringify(value));
      
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      
      this._value = currentValues;
      this.onChangeFn(currentValues);
      this.onSelectionChange.emit(currentValues);
    } else {
      this._value = value;
      this.onChangeFn(value);
      this.onSelectionChange.emit(value);
      this.closeDropdown();
    }

    this.updateSelectedItems();
  }

  removeItem(item: any, event: Event): void {
    event.stopPropagation();
    
    if (!this.multiple) return;

    const currentValues = Array.isArray(this._value) ? [...this._value] : [];
    const index = currentValues.findIndex(val => 
      this.stringify(val) === this.stringify(item[this.valueProp])
    );
    
    if (index > -1) {
      currentValues.splice(index, 1);
      this._value = currentValues;
      this.onChangeFn(currentValues);
      this.onSelectionChange.emit(currentValues);
      this.updateSelectedItems();
    }
  }

  selectAll(): void {
    if (!this.multiple) return;

    const allValues = this.filteredOptions
      .filter(opt => !opt.disabled)
      .map(opt => opt[this.valueProp]);
    
    this._value = allValues;
    this.onChangeFn(allValues);
    this.onSelectionChange.emit(allValues);
    this.updateSelectedItems();
  }

  clearAll(): void {
    if (this.multiple) {
      this._value = [];
    } else {
      this._value = null;
    }
    
    this.onChangeFn(this._value);
    this.onSelectionChange.emit(this._value);
    this.updateSelectedItems();
  }

  isAllSelected(): boolean {
    if (!this.multiple || this.filteredOptions.length === 0) return false;
    
    const availableOptions = this.filteredOptions.filter(opt => !opt.disabled);
    const currentValues = Array.isArray(this._value) ? this._value : [];
    
    return availableOptions.every(opt => 
      currentValues.some(val => this.stringify(val) === this.stringify(opt[this.valueProp]))
    );
  }

  private updateSelectedItems(): void {
    if (this.multiple) {
      const currentValues = Array.isArray(this._value) ? this._value : [];
      this.selectedItems = this.options.filter(option =>
        currentValues.some(val => this.stringify(val) === this.stringify(option[this.valueProp]))
      );
    } else if (this._value !== null && this._value !== undefined && this._value !== '') {
      const selectedOption = this.options.find(option =>
        this.stringify(option[this.valueProp]) === this.stringify(this._value)
      );
      this.selectedItems = selectedOption ? [selectedOption] : [];
    } else {
      this.selectedItems = [];
    }
  }

  onNativeSelectChange(event: Event): void {
    // Fallback for form compatibility
    this.onTouched();
  }

  onTouched(): void {
    this.onTouchFn();
  }

  isSelected(optionVal: any): boolean {
    if (this.multiple) {
      return Array.isArray(this._value) && this._value.some(val => 
        this.stringify(val) === this.stringify(optionVal)
      );
    }
    return this.stringify(this._value) === this.stringify(optionVal);
  }

  stringify(val: any): string {
    return val != null ? String(val) : '';
  }

  // Public methods
  public focus(): void {
    // Focus on the main select display instead of search input
    const displayElement = this.elementRef.nativeElement.querySelector('.ng-select-display');
    if (displayElement) {
      displayElement.focus();
    }
  }

  public clearSelection(): void {
    this.clearAll();
  }

  public getSelectedOptions(): any[] {
    return [...this.selectedItems];
  }

  public refreshOptions(): void {
    this.filteredOptions = [...this.options];
    this.updateSelectedItems();
    this.cdr.detectChanges();
  }
}