import { Directive, ElementRef, HostListener, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[numberFormat]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NumberFormatDirective),
    multi: true
  }]
})
export class NumberFormatDirective implements ControlValueAccessor {
  private regex: RegExp = new RegExp(/^\d*\.?\d*$/); // Allow only numbers and one dot
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('focus') onFocus() {
    let value = this.el.nativeElement.value;
    this.el.nativeElement.value = value.replace(/,/g, ''); // Remove commas on focus
  }

  @HostListener('blur') onBlur() {
    let value = this.el.nativeElement.value;
    if (value) {
      const num = parseFloat(value.replace(/,/g, ''));
      this.el.nativeElement.value = isNaN(num) ? '' : num.toLocaleString();
      this.onChange(num); // ✅ Update `ngModel`
    }
  }

  @HostListener('input', ['$event']) onInput(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    let value = input.value.replace(/,/g, ''); // Remove commas

    if (!this.regex.test(value)) {
      input.value = value.substring(0, value.length - 1); // Prevent invalid input
      return;
    }

    if (value.split('.').length > 2) {
      input.value = value.slice(0, -1); // Ensure only one dot
      return;
    }

    this.onChange(value); // ✅ Update `ngModel`
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      this.renderer.setProperty(this.el.nativeElement, 'value', value.toLocaleString());
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
