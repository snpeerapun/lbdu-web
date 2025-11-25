import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  forwardRef, 
  OnInit, 
  OnChanges, 
  SimpleChanges, 
  ChangeDetectorRef 
} from '@angular/core';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  ControlContainer, 
  NgForm 
} from '@angular/forms';

export interface SelectOption {
  id: string | number | null;
  name: string;
  parentId?: string | number | null;
  level?: number;
  prefix?: string;
  hasChildren?: boolean;
}

@Component({
  selector: 'ng-select2',
  template: `
    <div class="form-group">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <select 
        class="form-select" 
        [class.is-invalid]="isInvalid"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [attr.disabled]="disabled ? '' : null"
        [name]="name">
        <option [ngValue]="null" *ngIf="placeholder">{{ placeholder }}</option>
        <ng-container *ngIf="isHierarchy && filteredOptions.length > 0; else basicOptions">
          <option *ngFor="let option of filteredOptions" 
                  [ngValue]="option.id"
                  [disabled]="!allowsSelectParent && option.hasChildren">
            {{ option.prefix }}{{ option.name }}
          </option>
        </ng-container>
        <ng-template #basicOptions>
          <option *ngFor="let option of filteredOptions" [ngValue]="option.id">
            {{ option.name }}
          </option>
        </ng-template>
      </select>
      <div class="invalid-feedback" *ngIf="isInvalid && errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1rem;
    }
    .form-label {
      margin-bottom: 0.5rem;
    }
    .form-select {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #ced4da;
    }
    .form-select:focus {
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    .form-select option {
      font-family: monospace;
      padding: 4px 8px;
    }
    .form-select option:disabled {
      color: #aaa;
    }
    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875em;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelect2Component),
      multi: true
    }
  ]
})
export class NgSelect2Component implements ControlValueAccessor, OnChanges {
  @Input() options: SelectOption[] = [];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() isInvalid: boolean = false;
  @Input() errorMessage?: string;
  @Input() isHierarchy: boolean = false;
  @Input() allowsSelectParent: boolean = false;
  @Input() name: string = '';
  @Output() valueChange = new EventEmitter<any>();

  hierarchicalOptions: SelectOption[] = [];
  filteredOptions: SelectOption[] = [];
  value: any = null;
  disabled: boolean = false;
  searchText: string = '';
  showSearch: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] || changes['isHierarchy']) {
      this.processOptions();
    }
    
    if (changes['searchText']) {
      this.onSearch();
    }
  }

  private processOptions() {
    if (this.isHierarchy) {
      this.buildHierarchicalOptions();
    }
    this.filteredOptions = this.isHierarchy ? this.hierarchicalOptions : this.options;
    
    // Validate and update value if it's no longer in options
    this.validateAndUpdateValue();
  }

  private validateAndUpdateValue() {
    if (this.value !== null) {
      const isValidOption = this.options.some(option => option.id === this.value);
      
      if (!isValidOption) {
        this.value = null;
        this.onChange(null);
        this.cdr.markForCheck();
      }
    }
  }

  onSearch() {
    const searchText = this.searchText.toLowerCase();
    const allOptions = this.isHierarchy ? this.hierarchicalOptions : this.options;
    
    if (!searchText) {
      this.filteredOptions = allOptions;
      return;
    }

    this.filteredOptions = allOptions.filter(option => 
      option.name.toLowerCase().includes(searchText)
    );
  }

  onValueChange(value: any) {
    const finalValue = value === '' ? null : value;
    this.value = finalValue;
    this.onChange(finalValue);
    this.valueChange.emit(finalValue);
    this.cdr.markForCheck();
  }

  onSelectBlur() {
    setTimeout(() => {
      this.showSearch = false;
    }, 200);
  }

  private buildHierarchicalOptions(parentId: string | number | null = null, level: number = 0): SelectOption[] {
    const items = this.options.filter(option => option.parentId === parentId);
    let result: SelectOption[] = [];

    items.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach(item => {
      const hasChildren = this.options.some(opt => opt.parentId === item.id);
      const prefix = level > 0 ? '│'.repeat(level - 1) + '├─ ' : '';
      
      result.push({ ...item, level, prefix, hasChildren });
      
      const children = this.buildHierarchicalOptions(item.id, level + 1);
      
      if (children.length > 0 && items[items.length - 1] === item) {
        children.forEach(child => {
          if (child.prefix) {
            child.prefix = child.prefix.replace('├─', '└─');
          }
        });
      }
      
      result = result.concat(children);
    });

    if (parentId === null) {
      this.hierarchicalOptions = result;
    }

    return result;
  }

  writeValue(value: any): void {
    // Convert value to match options
    if (value === null || value === undefined) {
      this.value = null;
    } else {
      // Try to find a matching option
      const matchingOption = this.options.find(option => option.id === value);
      this.value = matchingOption ? matchingOption.id : null;
    }
    
    // Trigger change detection
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}