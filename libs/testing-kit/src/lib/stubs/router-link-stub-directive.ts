/* eslint-disable @angular-eslint/directive-selector */
import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[routerLink]',
  standalone: true,
})
export class RouterLinkStubDirective {
  @Input()
  routerLink: unknown;
  navigatedTo: unknown = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.routerLink;
  }
}
