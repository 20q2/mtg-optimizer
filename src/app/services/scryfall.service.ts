import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScryfallCardObject } from '../model/tag-objects';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ScryfallService {
  constructor(private http: HttpClient) {}

  fetchCardData(cardName: string) {
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {
          response = this.assignCardImageUrl(response);
          this.manaCurve.updateManaCurve((response as ScryfallCardObject).cmc);
          this.cards.push(response);
          this.fetchCardTags(response);
        } else {
          console.error(response);
        }
      },
      (error) => {
        this.snackbarService.showSnackbar('There was an error trying to fetch information on that tag');
        this.appIsLoading = false;
        console.log('Error fetching card data:', error);
      }
    );
  }

  async fetchPreviewCardTags(cardSetName: string, cardCollectorNumber: string) {
    this.appIsLoading = true;
    // const callUrl = this.serverUrl + '/gettag?setname=' + cardSetName + '&number=' + cardCollectorNumber;
    const callUrl = this.serverUrl + '?setname=' + cardSetName + '&number=' + cardCollectorNumber;


    this.http.get(callUrl).subscribe((result: any) => {
      this.previewCardTagList = result['data']['card']['taggings'];
      this.appIsLoading = false;
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