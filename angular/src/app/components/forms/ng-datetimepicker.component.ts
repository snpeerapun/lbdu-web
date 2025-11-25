import { Component, Input, ViewChild, ElementRef, forwardRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
declare var $: any;

const DATETIMEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgDateTimePickerComponent),
  multi: true
};

@Component({
  selector: 'ng-datetime-picker',
  template: `
    <div class="input-group date-picker" [ngClass]="{'inline-picker': inline}">
      <div *ngIf="!iconOnRight" class="input-group-text">
        <i class="fa fa-calendar"></i>
      </div>
      <input 
        type="text" 
        [readOnly]="readonly" 
        #datetimepicker 
        class="form-control" 
        autocomplete="off"
        [placeholder]="placeholder">
      <div *ngIf="iconOnRight" class="input-group-text">
        <i class="fa fa-calendar"></i>
      </div>
    </div>
    <div *ngIf="inline" #inlinepicker class="inline-datepicker-container mt-2"></div>
  `,
  styles: [`
    .inline-picker .form-control {
      border-radius: 0.25rem !important;
    }
    .inline-picker .input-group-text:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }
    .inline-picker .input-group-text:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
    .inline-datepicker-container {
      width: 100%;
    }
  `],
  providers: [DATETIMEPICKER_VALUE_ACCESSOR]
})
export class NgDateTimePickerComponent implements ControlValueAccessor, AfterViewInit, OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() format: string = 'YYYY-MM-DD';
  @Input() readonly: boolean = false;
  @Input() inline: boolean = false;
  @Input() iconOnRight: boolean = false;
  @Input() showClear: boolean = false;
  @Input() minDate: Date | string | null = null;
  @Input() maxDate: Date | string | null = null;
  @Input() disabledDates: Array<Date | string> = [];
  
  @ViewChild('datetimepicker', { static: false }) datetimepicker!: ElementRef;
  @ViewChild('inlinepicker', { static: false }) inlinepicker?: ElementRef;

  private _value: any = null;
  private _isDisabled: boolean = false;
  private _isInitialized: boolean = false;
  private _pendingValue: any = null;
  
  onChange: any = () => { };
  onTouched: any = () => { };

  ngOnInit() {
    // OnInit lifecycle hook - no initialization needed here
  }

  ngAfterViewInit() {
    // Initialize the datepicker after the view is ready
    this.initDatetimePicker();
  }

  ngOnDestroy() {
    // Clean up any jQuery bindings
    this.destroyDatepicker();
  }

  private destroyDatepicker() {
    try {
      if (this.datetimepicker && this._isInitialized) {
        const $input = $(this.datetimepicker.nativeElement);
        $input.datetimepicker('destroy');
      }
      
      if (this.inline && this.inlinepicker && this._isInitialized) {
        const $container = $(this.inlinepicker.nativeElement);
        if ($container.data('DateTimePicker')) {
          $container.datetimepicker('destroy');
        }
      }
    } catch (error) {
      // Silent fail on destroy
    }
  }

  private initDatetimePicker() {
    try {
      // Check for jQuery
      if (typeof $ === 'undefined') {
        throw new Error('jQuery is not loaded');
      }

      // Check for the plugin
      if (typeof $.fn.datetimepicker === 'undefined') {
        throw new Error('datetimepicker plugin is not loaded');
      }

      // Check for element
      if (!this.datetimepicker) {
        throw new Error('Datetimepicker element not found');
      }

      const input = this.datetimepicker.nativeElement;
      if (!input) {
        throw new Error('Datetimepicker native element not found');
      }

      const $input = $(input);
      if (!$input.length) {
        throw new Error('jQuery element not found');
      }

      // Base options for the datepicker
      const options: any = {
        format: this.format,
        allowInputToggle: true,
        showClear: this.showClear,
        useCurrent: false
      };

      // Add min date if specified
      if (this.minDate) {
        options.minDate = moment(this.minDate);
      }

      // Add max date if specified
      if (this.maxDate) {
        options.maxDate = moment(this.maxDate);
      }

      // Add disabled dates if specified
      if (this.disabledDates && this.disabledDates.length > 0) {
        options.disabledDates = this.disabledDates.map(date => moment(date));
      }

      // Init for inline or normal mode
      if (this.inline && this.inlinepicker) {
        // Initialize inline picker
        const $container = $(this.inlinepicker.nativeElement);
        options.inline = true;
        
        $container.datetimepicker(options).on('dp.change', (event: any) => {
          if (event && event.date) {
            const selectedDate = moment(event.date).format(this.format);
            this._value = selectedDate;
            this.onChange(selectedDate);
            this.onTouched();
            
            // Also update the input value
            $input.val(selectedDate);
          }
        });
        
        // Link input field to inline picker
        $input.on('focus', function() {
          $container.data('DateTimePicker').show();
        });
      } else {
        // Initialize normal picker on input
        $input.datetimepicker(options).on('dp.change', (event: any) => {
          if (event && event.date) {
            const selectedDate = moment(event.date).format(this.format);
            this._value = selectedDate;
            this.onChange(selectedDate);
            this.onTouched();
          }
        });
      }

      // Set placeholder
      if (this.placeholder) {
        $input.attr('placeholder', this.placeholder);
      }

      // Mark as initialized
      this._isInitialized = true;

      // Apply initial states
      this.setDisabledState(this._isDisabled);
      
      // Set initial value if one was provided before initialization
      if (this._pendingValue !== null) {
        this.writeValue(this._pendingValue);
        this._pendingValue = null;
      } else if (this._value !== null) {
        this.writeValue(this._value);
      }
    } catch (error) {
      console.error('Failed to initialize datetimepicker:', error);
    }
  }

  writeValue(value: any): void {
    this._value = value;
    
    // If not initialized yet, save for later
    if (!this._isInitialized) {
      this._pendingValue = value;
      return;
    }

    try {
      const $input = $(this.datetimepicker.nativeElement);
      
      if (value) {
        // Validate value is a valid date before formatting
        const momentDate = moment(value);
        if (momentDate.isValid()) {
          const formattedDate = momentDate.format(this.format);
          
          // Update input
          $input.val(formattedDate);
          
          // Update datepicker
          if (this.inline && this.inlinepicker) {
            const $container = $(this.inlinepicker.nativeElement);
            if ($container.data('DateTimePicker')) {
              $container.data('DateTimePicker').date(momentDate);
            }
          } else {
            $input.data('DateTimePicker')?.date(momentDate);
          }
        } else {
          $input.val(value); // Just set as is if not a valid date
        }
      } else {
        $input.val('');
        
        // Clear datepicker
        if (this.inline && this.inlinepicker) {
          const $container = $(this.inlinepicker.nativeElement);
          if ($container.data('DateTimePicker')) {
            $container.data('DateTimePicker').clear();
          }
        } else {
          $input.data('DateTimePicker')?.clear();
        }
      }
    } catch (error) {
      console.error('Error writing value to datetimepicker:', error);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    
    if (!this._isInitialized) {
      return;
    }

    try {
      const $input = $(this.datetimepicker.nativeElement);
      $input.prop('disabled', isDisabled);
      
      if (this.inline && this.inlinepicker) {
        const $container = $(this.inlinepicker.nativeElement);
        if ($container.data('DateTimePicker')) {
          if (isDisabled) {
            $container.data('DateTimePicker').disable();
          } else {
            $container.data('DateTimePicker').enable();
          }
        }
      } else {
        if (isDisabled) {
          $input.data('DateTimePicker')?.disable();
        } else {
          $input.data('DateTimePicker')?.enable();
        }
      }
    } catch (error) {
      console.error('Error setting disabled state:', error);
    }
  }
}