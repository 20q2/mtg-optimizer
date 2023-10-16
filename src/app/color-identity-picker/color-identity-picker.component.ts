import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-color-identity-picker',
  templateUrl: './color-identity-picker.component.html',
  styleUrls: ['./color-identity-picker.component.scss']
})
export class ColorIdentityPickerComponent {

  @Output()
  reloadRecommendedCards: EventEmitter<boolean> = new EventEmitter();

  colorIdentity: {[key: string]: boolean } = {
    'W': true,
    'U': true,
    'B': true,
    'R': true,
    'G': true,        
  }

  onColorIdentityChange() {
    this.reloadRecommendedCards.emit(true);
  }

  resetColorIdentity() {
    this.colorIdentity = {
      'W': false,
      'U': false,
      'B': false,
      'R': false,
      'G': false, 
    }
  }

  getColorIdentityString(): string {
    let colorString = '';
    for (let key of Object.keys(this.colorIdentity)) {
      if (this.colorIdentity[key]) {
        colorString += key;
      }
    }
    return colorString;
  }

}
