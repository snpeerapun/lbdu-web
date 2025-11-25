import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum'
})
export class SumPipe implements PipeTransform {
  transform(items: any[], attr: string): string {
    if (!items || !Array.isArray(items)) {
      return '0.00';
    }

    const total = items.reduce((sum, item) => sum + (item[attr] || 0), 0);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
