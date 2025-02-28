import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScryfallCardObject } from '../model/tag-objects';
import { SpellChromaService } from '../services/spell-chroma.service';
import { Element } from '@angular/compiler';

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent {
  private _cardsToDisplay: ScryfallCardObject[] = [];

  @Input()
  set cardsToDisplay(cards: ScryfallCardObject[]) {
    this._cardsToDisplay = cards;
    this.assignCardEvents();
  }

  get cardsToDisplay(): ScryfallCardObject[] {
    return this._cardsToDisplay;
  }

  @Input()
  sortingMode: string = 'name';

  @Output()
  previewCardEmit: EventEmitter<ScryfallCardObject> = new EventEmitter();

  constructor(
    public spellChromaService: SpellChromaService,
    ) {}

  assignCardEvents() {
    setTimeout(() => {    
      const cardContainer = document.querySelector(".grid-container");
      if (cardContainer) {
        cardContainer.addEventListener("mousemove", (event: Event) => {
          if (event instanceof MouseEvent) {
            this.handleCardMove(event);
          }
        });
      }
  
      // Add mouseleave event listener for each card
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
          card.addEventListener('mouseleave', () => {
              (card as HTMLElement).style.transform = "rotateX(0deg) rotateY(0deg)";
          });
      }); 
    }, 0)
  }

  isCardMoving = false;
  handleCardMove(event: MouseEvent) {
    if (!this.isCardMoving) {
        this.isCardMoving = true;
        requestAnimationFrame(() => {
          const activeCard = document.querySelector(".card:hover");
          if (activeCard) {
              const cardRect = activeCard.getBoundingClientRect();
              const x = event.clientX - cardRect.left - cardRect.width / 2;
              const y = event.clientY - cardRect.top - cardRect.height / 2;

              let rotateX = (y / cardRect.height) * 30 * -1;
              let rotateY = (x / cardRect.width) * 30;

              if (rotateX > 20) {
                rotateX = 20;
              }
              if (rotateY > 20) {
                rotateY = 20;
              }

              (activeCard as HTMLElement).style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          }

          this.isCardMoving = false;
        });
    }
  }  

}
