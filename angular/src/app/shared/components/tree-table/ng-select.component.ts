import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  id: string | number | null;
  name: string;
  parentId?: string | number | null;
  level?: number;
  prefix?: string;
  hasChildren?: boolean;
}

@Component({
  selector: 'ng-select',
  template: `
    <div class="form-group">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <select 
        class="form-select" 
        [class.is-invalid]="isInvalid"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        (blur)="onTouched()"
        [attr.disabled]="disabled ? '' : null">
        <option [ngValue]="null" *ngIf="placeholder">{{ placeholder }}</option>
        <ng-container *ngIf="isHierarchy && hierarchicalOptions.length > 0; else basicOptions">
          <option *ngFor="let option of hierarchicalOptions" 
                  [ngValue]="option.id"
                  [disabled]="!allowsSelectParent && option.hasChildren">
            {{ option.prefix }}{{ option.name }}
          </option>
        </ng-container>
        <ng-template #basicOptions>
          <option *ngFor="let option of options" [ngValue]="option.id">
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
    .form-select option {
      font-family: monospace;
    }
    .form-select option:disabled {
      color: #aaa;
 
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelectComponent),
      multi: true
    }
  ]
})
export class NgSelectComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: SelectOption[] = [];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() isInvalid: boolean = false;
  @Input() errorMessage?: string;
  @Input() isHierarchy: boolean = false;
  @Input() allowsSelectParent: boolean = false;
  @Output() valueChange = new EventEmitter<any>();

  hierarchicalOptions: SelectOption[] = [];
  value: any = null;
  disabled: boolean = false;
  onChange = (_: any) => {};
  onTouched = () => {};

  ngOnInit() {
    this.processOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['options'] && !changes['options'].firstChange) || 
        (changes['isHierarchy'] && !changes['isHierarchy'].firstChange)) {
      this.processOptions();
    }
  }

  private processOptions() {
    if (this.isHierarchy) {
      this.buildHierarchicalOptions();
    }
  }

  private buildHierarchicalOptions(parentId: string | number | null = null, level: number = 0): SelectOption[] {
    // First get root level items or children of current parent
    const items = this.options.filter(option => option.parentId === parentId);
    let result: SelectOption[] = [];

    // Sort items by name for better organization
    items.sort((a, b) => a.name.localeCompare(b.name));

    // Process each item
    items.forEach(item => {
      // Check if item has children
      const hasChildren = this.options.some(opt => opt.parentId === item.id);
      
      // Create indentation prefix
      const prefix = level > 0 ? '│'.repeat(level - 1) + '├─ ' : '';
      
      // Add current item with its prefix and hasChildren flag
      result.push({ ...item, level, prefix, hasChildren });
      
      // Recursively process children
      const children = this.buildHierarchicalOptions(item.id, level + 1);
      
      // If this is the last item at its level, update the prefix of its children
      if (children.length > 0 && items[items.length - 1] === item) {
        children.forEach(child => {
          if (child.prefix) {
            child.prefix = child.prefix.replace('├─', '└─');
          }
        });
      }
      
      result = result.concat(children);
    });

    // Only update hierarchicalOptions at the root level
    if (parentId === null) {
      this.hierarchicalOptions = result;
    }

    return result;
  }

  onValueChange(value: any) {
    const finalValue = value === '' ? null : value;
    this.onChange(finalValue);
    this.valueChange.emit(finalValue);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
