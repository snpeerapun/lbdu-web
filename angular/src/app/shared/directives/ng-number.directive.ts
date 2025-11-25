import { Directive, HostListener, ElementRef, Renderer2, Self, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ngNumber]'
})
export class NgNumberDirective {
  @Input() decimalPlaces: number = 0; // Default to 0 decimal places

  constructor(
    @Self() private ngControl: NgControl,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.ngControl.valueChanges.subscribe(value => {
      if (value === null || value === undefined) return;
      this.formatValue(value, false);
    });
  }

  private formatValue = (value: any, enforceDecimalPlaces: boolean) => {
    let stringValue = value.toString().replace(/[^0-9.]+/g, '');
    let [integerPart, decimalPart] = stringValue.split('.');

    if (enforceDecimalPlaces) {
      if (decimalPart !== undefined) {
        decimalPart = decimalPart.padEnd(this.decimalPlaces, '0').substring(0, this.decimalPlaces);
      } else if (this.decimalPlaces > 0) {
        decimalPart = ''.padEnd(this.decimalPlaces, '0');
      }
    } else if (decimalPart !== undefined) {
      decimalPart = decimalPart.substring(0, this.decimalPlaces);
    }

    stringValue = integerPart;
    if (this.decimalPlaces > 0 && decimalPart !== undefined) {
      stringValue += '.' + decimalPart;
    }

    const formattedValue = this.formatWithCommas(stringValue);
    
    this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);
  };

  private formatWithCommas(value: string): string {
    if (value === '') {
      return value;
    }
    
    let [integerPart, decimalPart] = value.split('.');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // If there is a decimal part, append it back to the formatted integer part
    if (decimalPart !== undefined) {
      return `${integerPart}.${decimalPart}`;
    }

    // If the value ends with a dot, ensure the dot is kept
    if (value.endsWith('.')) {
      return `${integerPart}.`;
    }
  
    return integerPart;
  }

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string) {
    let sanitizedValue = value.replace(/[^0-9.]+/g, '');

    if (sanitizedValue === '') {
      this.ngControl.control.setValue(null, { emitEvent: false });
    } else {
      this.ngControl.control.setValue(sanitizedValue, { emitEvent: false });
      this.formatValue(sanitizedValue, false);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 
      'Delete', 'Enter', 'c', 'v', 'a'
    ];
    const isNumberKey = event.key >= '0' && event.key <= '9';
    const isDotKey = event.key === '.' && !this.el.nativeElement.value.includes('.');
    
    // Allow Ctrl+C, Ctrl+V, Ctrl+A (copy, paste, select all)
    const isCtrlCommand = (event.ctrlKey || event.metaKey) && 
                          ['c', 'v', 'a'].includes(event.key.toLowerCase());
  
    if (!allowedKeys.includes(event.key) && !isNumberKey && !isDotKey && !isCtrlCommand) {
      event.preventDefault();
    }
  }

  @HostListener('blur')
  onBlur() {
    const value = this.ngControl.control.value;
    if (value === null || value === '') {
      this.ngControl.control.setValue(null, { emitEvent: false });
    } else {
      this.formatValue(value, true);
    }
  }

  @HostListener('focus')
  onFocus() {
    const value = this.el.nativeElement.value;
    const plainNumber = value.replace(/,/g, '');
    this.renderer.setProperty(this.el.nativeElement, 'value', plainNumber);
  }
}
