// filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, labelField: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    
    searchText = searchText.toLowerCase();
    return items.filter(item => {
      const fieldValue = item[labelField]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchText);
    });
  }
}