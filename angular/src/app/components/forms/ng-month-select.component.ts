import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type MonthValue = string; // 'YYYY-MM'

@Component({
  selector: 'ng-month-select',
  template: `
    <div class="ng-month-select">
      <select [disabled]="disabled" class="form-control" [ngModel]="month" (ngModelChange)="onMonthChange($event)">
        <option *ngFor="let m of months" [value]="m.value">{{ m.name }}</option>
      </select>

      <select [disabled]="disabled" class="form-control" [ngModel]="year" (ngModelChange)="onYearChange($event)">
        <option *ngFor="let y of years" [value]="y">{{ y }}</option>
      </select>
    </div>
  `,
  styles: [`
    .ng-month-select {
      display: inline-flex;
      width: 270px;
      gap: .5rem;
    }
    .ng-month-select select {
      width: 100%;
      appearance:auto;
      padding: .375rem .5rem;
    }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgMonthSelectComponent),
    multi: true
  }]
})
export class NgMonthSelectComponent implements ControlValueAccessor, OnInit {
  months = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 }, { name: 'March', value: 3 },
    { name: 'April', value: 4 }, { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 }, { name: 'September', value: 9 },
    { name: 'October', value:10 }, { name: 'November', value:11 }, { name: 'December', value:12 },
  ];

  years: number[] = [];
  year!: number;
  month!: number;
  disabled = false;

  private onChange: (val: MonthValue) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    const now = new Date();
    const y = now.getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => y - i);

    if (this.year == null || this.month == null) {
      const d = new Date(y, now.getMonth() - 1, 1); // last month
      this.year = d.getFullYear();
      this.month = d.getMonth() + 1;
      this.emit();
    }
  }

  // ControlValueAccessor
  writeValue(value: MonthValue | null): void {
    if (!value) return;
    const m = /^(\d{4})-(\d{2})$/.exec(value);
    if (m) {
      this.year = +m[1];
      this.month = +m[2];
    }
  }
  registerOnChange(fn: (val: MonthValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }

  onYearChange(y: string) {
    this.year = +y;
    this.emit();
  }
  onMonthChange(m: string) {
    this.month = +m;
    this.emit();
  }

  private emit() {
    if (this.year && this.month) {
      const mm = this.month.toString().padStart(2, '0');
      this.onChange(`${this.year}-${mm}`);
      this.onTouched();
    }
  }
}
