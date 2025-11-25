import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'newline'
})
export class NewlinePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return value;
    
    // Replace newlines with <br> tags and sanitize the HTML
    const withBr = value.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(withBr);
  }
}
