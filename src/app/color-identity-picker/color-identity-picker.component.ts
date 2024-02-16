import { Component, EventEmitter, Output } from '@angular/core';
import { SpellChromaService } from '../services/spell-chroma.service';

@Component({
  selector: 'app-color-identity-picker',
  templateUrl: './color-identity-picker.component.html',
  styleUrls: ['./color-identity-picker.component.scss']
})
export class ColorIdentityPickerComponent {

  @Output()
  reloadRecommendedCards: EventEmitter<boolean> = new EventEmitter();

  constructor(public spellChromaService: SpellChromaService) {}

  onColorIdentityChange() {
    this.reloadRecommendedCards.emit(true);
  }

  resetColorIdentity() {
    this.spellChromaService.colorIdentity = {
      'W': false,
      'U': false,
      'B': false,
      'R': false,
      'G': false, 
    }
  }

  getColorIdentityString(): string {
    let colorString = '';
    for (let key of Object.keys(this.spellChromaService.colorIdentity)) {
      if (this.spellChromaService.colorIdentity[key]) {
        colorString += key;
      }
    }
    return colorString;
  }

}
