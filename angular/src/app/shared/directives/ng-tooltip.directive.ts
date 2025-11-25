import { Directive, Input, ElementRef, Renderer2, OnInit, HostListener } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[ngToolTip]',
  providers: [NgbTooltip]
})
export class NgToolTipDirective implements OnInit {
  @Input('ngToolTip') tooltipTitle: string | undefined;
  @Input() placement: string = 'top';
  @Input() delay: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer2, private ngbTooltip: NgbTooltip) { }

  ngOnInit() {
    this.ngbTooltip.placement = this.placement;
    this.ngbTooltip.triggers = 'manual';
    this.ngbTooltip.tooltipClass = 'custom-tooltip';
    this.ngbTooltip.ngbTooltip = this.tooltipTitle;
    this.ngbTooltip.container = 'body';
    this.ngbTooltip.autoClose = false;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.ngbTooltip.open();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.ngbTooltip.close();
  }
}
