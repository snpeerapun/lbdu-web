import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ng-multi-select',
  templateUrl: './ng-multi-select.component.html',
  styleUrls: ['./ng-multi-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgMultiSelectComponent),
      multi: true
    }
  ]
})
export class NgMultiSelectComponent implements ControlValueAccessor {
  @Input() availableItems: any[] = [];
  @Input() availableLabel: string = 'name';
  @Input() selectedLabel: string = 'name';
  @Input() availableValue: string = 'id';
  @Input() selectedValue: string = 'id';
  @Input() width: string = '100%';

  /** ใส่ expression เช่น "{{code}} - {{name}} ({{country}})" */
  @Input() availableLabelExpr: string | null = null;
  @Input() selectedLabelExpr: string | null = null;

  availableFilter: string = '';
  selectedFilter: string = '';

  onChange: any = () => {};
  onTouch: any = () => {};
  selectedAvailable: any[] = [];
  selectedSelected: any[] = [];
  selectedItems: any[] = [];

  writeValue(obj: any): void {
    this.selectedItems = obj ? [...obj] : [];
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }

  add() {
    this.selectedItems.push(...this.selectedAvailable);
    this.availableItems = this.availableItems.filter(i => !this.selectedAvailable.includes(i));
    this.selectedAvailable = [];
    this.onChange(this.selectedItems);
  }
  addAll() {
    this.selectedItems.push(...this.availableItems);
    this.availableItems = [];
    this.selectedAvailable = [];
    this.onChange(this.selectedItems);
  }
  remove() {
    this.availableItems.push(...this.selectedSelected);
    this.selectedItems = this.selectedItems.filter(i => !this.selectedSelected.includes(i));
    this.selectedSelected = [];
    this.onChange(this.selectedItems);
  }
  removeAll() {
    this.availableItems.push(...this.selectedItems);
    this.selectedItems = [];
    this.selectedSelected = [];
    this.onChange(this.selectedItems);
  }

  updateSelectedAvailable(selectedOptions: any[]) {
    this.selectedAvailable = selectedOptions.map(o => o.value);
  }
  updateSelectedSelected(selectedOptions: any[]) {
    this.selectedSelected = selectedOptions.map(o => o.value);
  }

  /** แปลง item -> label text ด้วย expression หรือ fallback เป็น key */
  displayOf(item: any, listType: 'available' | 'selected'): string {
    const expr = listType === 'available' ? this.availableLabelExpr : this.selectedLabelExpr;
    const fallbackKey = listType === 'available' ? this.availableLabel : this.selectedLabel;

    if (expr && typeof expr === 'string') {
      return this.interpolate(expr, item);
    }
    const v = this.safeResolve(item, fallbackKey);
    return (v ?? '').toString();
  }

  /** ใช้กับ filter ให้ค้นหาจากข้อความที่ render จริง */
  matchesFilter(item: any, q: string, listType: 'available' | 'selected'): boolean {
    if (!q) return true;
    return this.displayOf(item, listType).toLowerCase().includes(q.toLowerCase());
  }

  /** รองรับ {{path.to.field}} แบบง่าย ๆ */
  private interpolate(expr: string, ctx: any): string {
    return expr.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path) => {
      const v = this.safeResolve(ctx, path.trim());
      return v != null ? String(v) : '';
    });
  }

  /** อ่านค่าจาก path แบบ a.b.c โดยไม่โยน error ถ้า path หาย */
  private safeResolve(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
  }
}
