import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScryfallCardObject } from '../model/tag-objects';

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent {
  @Input()
  cardsToDisplay: ScryfallCardObject[] = [];

  @Output()
  previewCardEmit: EventEmitter<ScryfallCardObject> = new EventEmitter();

}
