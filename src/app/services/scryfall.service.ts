import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScryfallCardObject } from '../model/tag-objects';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from './snackbar.service';
import { SpellChromaService } from './spell-chroma.service';

@Injectable({
  providedIn: 'root',
})
export class ScryfallService {
  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private spellChromaService: SpellChromaService) {}

  awaitingResponse = false;

  serverUrl = 'https://1f5fr8bzm2.execute-api.us-east-1.amazonaws.com/default/get-tags-proxy';
  scryfallSearchUrl = "https://api.scryfall.com/cards/search";

  /**
   * Calls scryfall to fetch the given card
   * @param cardName 
   * @returns ScryfallCardObject
   */
  fetchCardData(cardName: string): ScryfallCardObject[] {
    this.awaitingResponse = true;
    
    const cards: ScryfallCardObject[] = []
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {
          response = this.assignCardImageUrl(response);
          cards.push(response);
          this.fetchCardTags(response);
        } else {
          console.error(response);
        }
      },
      (error) => {
        this.snackbarService.showSnackbar('There was an error trying to fetch information on that tag');
        this.awaitingResponse = false;
        console.log('Error fetching card data:', error);
      }
    );

    return cards;
  }

  async fetchPreviewCardTags(cardSetName: string, cardCollectorNumber: string) {
    this.awaitingResponse = true;
    // const callUrl = this.serverUrl + '/gettag?setname=' + cardSetName + '&number=' + cardCollectorNumber;
    const callUrl = this.serverUrl + '?setname=' + cardSetName + '&number=' + cardCollectorNumber;


    this.http.get(callUrl).subscribe((result: any) => {
      if (this.spellChromaService.previewCard) {
        this.spellChromaService.previewCard.tags = result['data']['card']['taggings'];
      }
      this.awaitingResponse = false;
    });
  }

  async fetchCardTags(card: ScryfallCardObject) {
    // const callUrl = this.serverUrl + '/gettag?setname=' + card['set'] + '&number=' + card['collector_number'];
    const callUrl = this.serverUrl + '?setname=' + card['set'] + '&number=' + card['collector_number'];

    this.http.get(callUrl).subscribe(((result: any) => {
      card.tags = result['data']['card']['taggings'];
      card.showingTags = false;
    }))
  }

  assignCardImageUrl(card: ScryfallCardObject): ScryfallCardObject {
    if (card.image_uris && card.image_uris['normal']) {
      card.imageUrl = card.image_uris['normal'];
      return card;
    } else if (card.card_faces && card.card_faces[0]) {
      if (card.card_faces[0].image_uris && card.card_faces[0].image_uris['normal']) {
        card.imageUrl = card.card_faces[0].image_uris['normal'];
        return card;
      }
    }
    return card;
  }
}