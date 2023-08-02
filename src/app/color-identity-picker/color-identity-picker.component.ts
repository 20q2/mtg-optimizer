import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-color-identity-picker',
  templateUrl: './color-identity-picker.component.html',
  styleUrls: ['./color-identity-picker.component.scss']
})
export class ColorIdentityPickerComponent {

  reloadRecommendedCards: EventEmitter<boolean> = new EventEmitter();

  colorIdentity: {[key: string]: boolean } = {
    'G': false,
    'R': false,
    'W': false,
    'U': false,
    'B': false,
  }

  onColorIdentityChange() {
    this.reloadRecommendedCards.emit(true);
  }

  resetColorIdentity() {
    this.colorIdentity = {
      'G': false,
      'R': false,
      'W': false,
      'U': false,
      'B': false,
    }
  }

}
