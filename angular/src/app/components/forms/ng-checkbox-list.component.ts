// ng-checkbox-list.component.ts
// Standalone Angular component: table list with configurable columns + checkbox selection
// รองรับ [(selectedKeys)] และ [(ngModel)]/formControlName ผ่าน ControlValueAccessor

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Column definition */
export interface NgcColumnDef<T = any> {
  field: string;                 // Property path (supports nested paths like "user.name")
  header: string;                // Header text to display
  width?: string;                // Optional width (e.g., '120px', '20%')
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => string; // Optional formatter for display
}

const CHECKBOXLIST_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgCheckBoxListComponent),
  multi: true,
};
@Component({
  selector: 'ng-checkbox-list',
  template: `
    <div class="ngc-table-wrapper" [class.sticky-header]="stickyHeader">
      <table class="ngc-table">
        <thead>
          <tr>
            <th class="col-checkbox" *ngIf="selectable">
              <label class="ngc-checkbox fancy-checkbox">
                <input type="checkbox"
                       [checked]="allSelected"
                       [indeterminate]="indeterminate"
                       [disabled]="controlDisabled"
                       (change)="toggleAll($event)" />
                <span></span>
              </label>
            </th>
            <th *ngFor="let col of columns"
                [style.width]="col.width || null"
                [class.align-right]="col.align === 'right'"
                [class.align-center]="col.align === 'center'">
              {{ col.header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of items; trackBy: trackByKey"
              (click)="rowClick(row)"
              [class.selected]="isSelected(row)">
            <td class="col-checkbox" *ngIf="selectable" (click)="$event.stopPropagation()">
              <label class="ngc-checkbox fancy-checkbox">
                <input type="checkbox"
                       [checked]="isSelected(row)"
                       [disabled]="isDisabled(row) || controlDisabled"
                       (change)="toggleRow(row, $event)" />
                <span></span>
              </label>
            </td>
            <td *ngFor="let col of columns"
                [class.align-right]="col.align === 'right'"
                [class.align-center]="col.align === 'center'">
              {{ renderCell(row, col) }}
            </td>
          </tr>
          <tr *ngIf="!items || items.length === 0">
            <td [attr.colspan]="(columns?.length || 0) + (selectable ? 1 : 0)" class="empty">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
    :host { display:block; }
    .ngc-table-wrapper { width: 100%; overflow: auto; border: 1px solid #e5e7eb; border-radius: 12px; }
    .ngc-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
    thead th { position: sticky; top: 0; background: #f8fafc; color: #111827; font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    .sticky-header thead th { position: sticky; top: 0; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #111827; }
    tbody tr:hover { background: #f8fafc; }
    tbody tr.selected { background: #eef2ff; }
    .col-checkbox { width: 44px; text-align: center; }
    .empty { text-align: center; color: #6b7280; padding: 20px; }
    .align-right { text-align: right; }
    .align-center { text-align: center; }

    /* Checkbox styling */
    .ngc-checkbox { display: inline-flex; align-items: center; cursor: pointer; }
    .ngc-checkbox input { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; margin: 0; border: 1px solid #cbd5e1; border-radius: 4px; display: grid; place-content: center; background: #fff; }
    .ngc-checkbox input:checked { background: #0a7c76;; border-color: #0a7c76;; }
    .ngc-checkbox input:indeterminate { background: #0a7c76;; border-color: #0a7c76;; }
    .ngc-checkbox span { display:none; }
    `
  ],
  providers: [CHECKBOXLIST_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgCheckBoxListComponent<T = any> implements OnInit, OnChanges, ControlValueAccessor {
  /** แหล่งข้อมูล */
  @Input() items: T[] = [];

  /** คอลัมน์ที่ต้องการแสดง */
  @Input() columns: NgcColumnDef<T>[] = [];

  /** ชื่อฟิลด์คีย์หลักสำหรับ trackBy/selection (เช่น 'id') */
  @Input() keyField: keyof T | string = 'id';

  /** กำหนดค่าเริ่มต้นของรายการที่ถูกเลือก (key list) */
  @Input() selectedKeys: Array<string | number> = [];

  /** ปิดการเลือกบางแถวด้วยฟังก์ชัน */
  @Input() disableWhen?: (row: T) => boolean;

  /** เปิด/ปิดความสามารถในการเลือก */
  @Input() selectable = true;

  /** แสดง header sticky */
  @Input() stickyHeader = true;

  /** ข้อความเมื่อไม่มีข้อมูล */
  @Input() emptyText = 'ไม่มีข้อมูล';

  /** ส่งอีเวนต์เมื่อรายการที่เลือกเปลี่ยนแปลง (array ของ key) */
  @Output() selectedKeysChange = new EventEmitter<Array<string | number>>();

  /** ส่งอีเวนต์เมื่อคลิกแถว */
  @Output() rowSelected = new EventEmitter<T>();

  /** ภายในเก็บ selection เป็น Set เพื่อประสิทธิภาพ */
  private _selection = new Set<string>(); // ใช้ string ให้ตรงชนิดเสมอ

  /** ควบคุม disabled จาก Angular Forms */
  controlDisabled = false;

  // ======= CVA callbacks =======
  private _onChange: (v: Array<string | number>) => void = () => {};
  private _onTouched: () => void = () => {};

  // ======= Lifecycle =======
  ngOnInit() {
    this.resetSelectionFromInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedKeys']) this.resetSelectionFromInput();
    if (changes['items']) {
      // prune key ที่ไม่อยู่ใน items แล้ว
      const available = new Set(this.items.filter(r => !this.isDisabled(r)).map(r => this.getKey(r)));
      for (const k of Array.from(this._selection)) if (!available.has(k)) this._selection.delete(k);
    }
  }

  // ======= Selection helpers =======
  get allSelected(): boolean {
    const enabled = this.items.filter(r => !this.isDisabled(r));
    return enabled.length > 0 && enabled.every(r => this._selection.has(this.getKey(r)));
  }

  get indeterminate(): boolean {
    const enabled = this.items.filter(r => !this.isDisabled(r));
    const cnt = enabled.filter(r => this._selection.has(this.getKey(r))).length;
    return cnt > 0 && cnt < enabled.length;
  }

  isDisabled(row: T): boolean { return !!this.disableWhen?.(row); }

  isSelected(row: T): boolean { return this._selection.has(this.getKey(row)); }

  toggleAll(evt: Event) {
    this._onTouched();
    const input = evt.target as HTMLInputElement;
    if (input.checked) {
      for (const r of this.items) if (!this.isDisabled(r)) this._selection.add(this.getKey(r));
    } else {
      for (const r of this.items) if (!this.isDisabled(r)) this._selection.delete(this.getKey(r));
    }
    this.emitSelection();
  }

  toggleRow(row: T, evt?: Event) {
    if (evt) evt.stopPropagation();
    if (this.isDisabled(row) || this.controlDisabled) return;
    this._onTouched();
    const k = this.getKey(row);
    if (this._selection.has(k)) this._selection.delete(k); else this._selection.add(k);
    this.emitSelection();
  }

  rowClick(row: T) {
    this.rowSelected.emit(row);
  }

  emitSelection() {
    const out = Array.from(this._selection);
    this.selectedKeysChange.emit(out);
    this._onChange(out);
  }

  trackByKey = (_: number, row: T) => this.getKey(row);

  private getKey(row: T): string {
    const k = this.getValueByPath(row as any, this.keyField as string);
    if (k === undefined || k === null) throw new Error(`[NgCheckBoxListComponent] keyField '${String(this.keyField)}' not found in row.`);
    return this.normalizeKey(k);
  }

  private resetSelectionFromInput() {
    this._selection.clear();
    for (const k of this.selectedKeys ?? []) this._selection.add(this.normalizeKey(k));
  }

  private normalizeKey(k: any): string {
    // normalize ให้เป็น string ทั้งสองฝั่ง ป้องกันเคส '1' !== 1
    return String(k);
  }

  // ======= Rendering helpers =======
  renderCell(row: T, col: NgcColumnDef<T>): string {
    const raw = this.getValueByPath(row as any, col.field);
    if (typeof col.format === 'function') {
      try { return col.format(raw, row) ?? ''; } catch { return String(raw ?? ''); }
    }
    return this.toStringSafe(raw);
  }

  private toStringSafe(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  private getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
  }

  // ======= CVA methods =======
  writeValue(val: Array<string | number> | null): void {
    this.selectedKeys = (val ?? []).map(k => this.normalizeKey(k));
    this.resetSelectionFromInput();
  }

  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }

  setDisabledState(isDisabled: boolean): void { this.controlDisabled = isDisabled; }
}

/* ===================== USAGE EXAMPLES =====================

// A) Two-way with selectedKeys
// <ng-checkbox-list
//   [items]="rows"
//   [columns]="cols"
//   keyField="id"
//   [(selectedKeys)]="selected">
// </ng-checkbox-list>

// B) Template-driven Forms (ngModel)
// <ng-checkbox-list name="teams" [(ngModel)]="selected"></ng-checkbox-list>

// C) Reactive Forms
// form = new FormGroup({ teams: new FormControl<string[]>(['1']) });
// <ng-checkbox-list formControlName="teams"></ng-checkbox-list>

*/