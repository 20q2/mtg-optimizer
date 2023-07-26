import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CardTagObject, TagInformation } from './tag-objects';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  deckList = '';
  cards: any[] = [];
  
  previewCard: any;
  previewCardTagInfo: CardTagObject[] = [];
  previewCardList = true;

  relatedCardsByTag: any[] = [];
  selectedTag = '';

  colorIdentity: {[key: string]: boolean } = {
    'G': true,
    'R': false,
    'W': false,
    'U': false,
    'B': true,
  }
  lastSearchedColors = '';


  xCsrfToken: string = '';
  sessionToken: string = '';

  serverUrl = 'http://127.0.0.1:5000';
  scryfallSearchUrl = "https://api.scryfall.com/cards/search";

  appIsLoading = false;
  lastSortMode = '';

  constructor(private http: HttpClient) { }

  async parseDeckList() {
    this.cards = [];

    const lines = this.deckList.split('\n');
    this.appIsLoading = true;
    for (let line of lines) {
      line = line.trim();
      const match = line.match(/(\d+x?)\s+([^(\n]+)/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const cardName = match[2];
        this.fetchCardData(cardName);
        await this.delay(50).then(() => {          
        });
      }
    }
    this.appIsLoading = false;
  }

  fetchCardData(cardName: string) {
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {          
          this.cards.push(response);
          this.fetchCardTags(response);
        } else {
          console.error(response);
        }
      },
      (error) => {
        this.appIsLoading = false;
        console.log('Error fetching card data:', error);
      }
    );
  }

  async fetchPreviewCardTags(cardSetName: string, cardCollectorNumber: string) {
    this.appIsLoading = true;
    const callUrl = this.serverUrl + '/gettag?setname=' + cardSetName + '&number=' + cardCollectorNumber;

    this.http.get(callUrl).subscribe((result: any) => {
      this.previewCardTagInfo = result['data']['card']['taggings'];
      this.appIsLoading = false;
    });
  }

  async fetchCardTags(card: any) {
    const callUrl = this.serverUrl + '/gettag?setname=' + card['set'] + '&number=' + card['collector_number'];
    this.http.get(callUrl).subscribe(((result: any) => {
      card.tags = result['data']['card']['taggings'];
      card.showingTags = false;
    }))
  }



  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onCardClick() {
    this.fetchPreviewCardTags(this.previewCard['set'], this.previewCard['collector_number']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.previewCardTagInfo = [];

  }

  onTagClick(tagSlug: string) {
    let colorString = '';
    this.selectedTag = tagSlug;
    for (let key of Object.keys(this.colorIdentity)) {
      if (this.colorIdentity[key]) {
        colorString += key;
      }
    }
    const sub = this.http.get(this.scryfallSearchUrl, {
      params: {
        q: `otag:${tagSlug} ${colorString ? 'id<=' + colorString : ''}`
      }
    })

    this.appIsLoading = true;
    this.lastSearchedColors = colorString;

    sub.subscribe((result: any) => {
      this.appIsLoading = false;
      this.relatedCardsByTag = result.data;
    })
  }

  sortRelatedBy(event: MouseEvent) {
    const value = (event.target as HTMLButtonElement).value;

    if (value === 'cmc') {
      this.relatedCardsByTag.sort((a, b) => {
        return a['cmc'] - b['cmc']
      })
    } else if (value === 'name') {
      this.relatedCardsByTag.sort((a, b) => {
        return (a['name'] as string).localeCompare(b['name'])
      })
    } else if (value === 'color') {
      this.relatedCardsByTag.sort((a, b) => {
        return (a['color_identity'] as string[]).join('').localeCompare((b['color_identity'] as string[]).join(''))
      })
    }

    if (value === this.lastSortMode) {
      this.relatedCardsByTag.reverse();
      this.lastSortMode = '';
    } else {
      this.lastSortMode = value;
    }

    
  }

  compressCardTags(tags: CardTagObject[]): string[] {
    const ret = [];
    for (let tag of tags) {
      if (tag.tag.status !== 'REJECTED' && tag.tag.namespace === 'card') {
        ret.push(tag.tag.slug)
      }
      
      if (tag.tag.ancestorTags) {
        for (let ancestor of tag.tag.ancestorTags) {
          if (ancestor.status !== 'REJECTED' && ancestor.namespace === 'card') {
            ret.push(ancestor.slug)
          }
        }
      }
    }

    return ret;
  }
    
}
