import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  forwardRef, 
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare var $: any; // jQuery
declare var Chosen: any; // Chosen library

@Component({
  selector: 'ng-select3',
  template: `
    <select
      #selectElement
      class="form-select chosen-select"
      [attr.multiple]="multiple ? '' : null"
      [attr.data-placeholder]="placeholder"
      [style.width]="width"
    >
      <!-- Placeholder (เฉพาะ single) -->
      <option *ngIf="!multiple && placeholder" [value]="''">
        {{ placeholder }}
      </option>

      <!-- วนลูปรายการ options -->
      <ng-container *ngFor="let opt of options">
        <option
          [value]="stringify(opt[valueProp])"
          [selected]="isSelected(opt[valueProp])"
          [disabled]="opt.disabled || false"
        >
          {{ opt[labelProp] }}
        </option>
      </ng-container>
    </select>
  `,
 
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelect3Component),
      multi: true,
    },
  ],
})
export class NgSelect3Component implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit, OnChanges {
  
  @ViewChild('selectElement', { static: true }) selectElement!: ElementRef<HTMLSelectElement>;
  
  @Input() options: any[] = [];
  @Input() valueProp: string = 'id';
  @Input() labelProp: string = 'name';
  @Input() multiple: boolean = false;
  @Input() placeholder: string = 'Select an option';
  @Input() width: string = '100%';
  @Input() allowDeselect: boolean = true;
  @Input() noResultsText: string = 'No results match';
  @Input() searchContains: boolean = false;
  @Input() maxSelectedOptions: number | null = null;
  @Input() disableSearch: boolean = false;
  @Input() disableSearchThreshold: number = 0;
  @Input() includeGroupLabelInSelected: boolean = false;
  @Input() inheritSelectClasses: boolean = false;
  @Input() dropDirection: 'auto' | 'up' | 'down' = 'auto';

  /** Event ที่จะใช้แจ้ง component ภายนอก */
  @Output() onSelectionChange = new EventEmitter<any>();
  @Output() onReady = new EventEmitter<any>();
  @Output() onMaxSelected = new EventEmitter<void>();
  @Output() onShowing = new EventEmitter<void>();
  @Output() onHiding = new EventEmitter<void>();

  private _value: any = null;
  private onChangeFn: (val: any) => void = () => {};
  private onTouchFn: () => void = () => {};
  private chosenInstance: any = null;
  private isInitialized: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Initialize will happen in ngAfterViewInit
  }

  ngAfterViewInit(): void {
    // เช็คว่า jQuery และ Chosen พร้อมใช้งาน
    if (typeof $ === 'undefined') {
      console.error('NgSelect: jQuery is required for Chosen functionality');
      return;
    }
    
    if (typeof $.fn.chosen === 'undefined') {
      console.error('NgSelect: Chosen jQuery plugin is required');
      return;
    }

    this.initializeChosen();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.isInitialized) {
      // รอ DOM update แล้วค่อย trigger chosen
      setTimeout(() => {
        this.updateChosen();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyChosen();
  }

  private initializeChosen(): void {
    const selectEl = $(this.selectElement.nativeElement);
    
    const chosenOptions = {
      allow_single_deselect: this.allowDeselect,
      no_results_text: this.noResultsText,
      search_contains: this.searchContains,
      disable_search_threshold: this.disableSearchThreshold,
      disable_search: this.disableSearch,
      inherit_select_classes: this.inheritSelectClasses,
      include_group_label_in_selected: this.includeGroupLabelInSelected,
      drop_direction: this.dropDirection,
      width: this.width,
      placeholder_text_multiple: this.multiple ? this.placeholder : undefined,
      placeholder_text_single: !this.multiple ? this.placeholder : undefined,
      max_selected_options: this.maxSelectedOptions
    };

    // Initialize Chosen
    selectEl.chosen(chosenOptions);
    this.chosenInstance = selectEl.data('chosen');
    this.isInitialized = true;

    // Bind events
    selectEl.on('change', (event: any) => {
      this.onSelect(event);
    });

    selectEl.on('chosen:ready', () => {
      this.onReady.emit();
    });

    selectEl.on('chosen:maxselected', () => {
      this.onMaxSelected.emit();
    });

    selectEl.on('chosen:showing_dropdown', () => {
      this.onShowing.emit();
    });

    selectEl.on('chosen:hiding_dropdown', () => {
      this.onHiding.emit();
    });

    // Set initial value if exists
    if (this._value !== null) {
      this.setChosenValue(this._value);
    }
  }

  private updateChosen(): void {
    if (this.chosenInstance) {
      const selectEl = $(this.selectElement.nativeElement);
      selectEl.trigger('chosen:updated');
    }
  }

  private destroyChosen(): void {
    if (this.chosenInstance) {
      const selectEl = $(this.selectElement.nativeElement);
      selectEl.off('change chosen:ready chosen:maxselected chosen:showing_dropdown chosen:hiding_dropdown');
      selectEl.chosen('destroy');
      this.chosenInstance = null;
      this.isInitialized = false;
    }
  }

  private setChosenValue(value: any): void {
    if (!this.isInitialized) return;
    
    const selectEl = this.selectElement.nativeElement;
    
    if (this.multiple) {
      // Clear all selections first
      Array.from(selectEl.options).forEach(option => {
        option.selected = false;
      });
      
      // Set selected values
      if (Array.isArray(value)) {
        value.forEach(val => {
          const option = Array.from(selectEl.options).find(opt => 
            opt.value === this.stringify(val)
          );
          if (option) {
            option.selected = true;
          }
        });
      }
    } else {
      selectEl.value = this.stringify(value);
    }
    
    this.updateChosen();
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this._value = value;
    
    if (this.isInitialized) {
      this.setChosenValue(value);
    }
    
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.isInitialized) {
      const selectEl = $(this.selectElement.nativeElement);
      selectEl.prop('disabled', isDisabled);
      this.updateChosen();
    }
  }

  /** เมื่อเลือกค่าใหม่ใน <select> */
  onSelect(event: Event) {
    this.onTouchFn();
    const selectEl = event.target as HTMLSelectElement;

    if (this.multiple) {
      const selectedValues: any[] = [];
      for (let i = 0; i < selectEl.selectedOptions.length; i++) {
        const value = selectEl.selectedOptions[i].value;
        if (value !== '') { // Skip empty placeholder
          selectedValues.push(this.parseValue(value));
        }
      }
      this._value = selectedValues;
      this.onChangeFn(selectedValues);
      this.onSelectionChange.emit(selectedValues);
    } else {
      const val = selectEl.value;
      const parsedVal = val === '' ? null : this.parseValue(val);
      this._value = parsedVal;
      this.onChangeFn(parsedVal);
      this.onSelectionChange.emit(parsedVal);
    }
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

  private parseValue(strVal: string): any {
    // Try to parse as number if it looks like a number
    const numVal = Number(strVal);
    if (!isNaN(numVal) && strVal !== '') {
      return numVal;
    }
    return strVal;
  }

  // Public methods for external control
  public updateOptions(newOptions: any[]): void {
    this.options = newOptions;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.updateChosen();
    });
  }

  public clearSelection(): void {
    if (this.multiple) {
      this.writeValue([]);
    } else {
      this.writeValue(null);
    }
  }

  public selectAll(): void {
    if (this.multiple) {
      const allValues = this.options.map(opt => opt[this.valueProp]);
      this.writeValue(allValues);
    }
  }

  public refresh(): void {
    this.updateChosen();
  }

  public getSelectedOptions(): any[] {
    if (!this._value) return [];
    
    if (this.multiple) {
      return this.options.filter(opt => 
        Array.isArray(this._value) && this._value.includes(opt[this.valueProp])
      );
    } else {
      const selectedOption = this.options.find(opt => 
        opt[this.valueProp] === this._value
      );
      return selectedOption ? [selectedOption] : [];
    }
  }
}