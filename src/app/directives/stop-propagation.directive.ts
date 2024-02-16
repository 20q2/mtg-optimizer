import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appStopProp]'
})
export class StopPropagationDirective {

  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    event.stopPropagation();
  }
}