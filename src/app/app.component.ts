import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  deckList = '';
  cards: any[] = [];
  
  previewCard: any;
  previewCardTagInfo: any;
  
  previewCardList = true;



  xCsrfToken: string = '';
  sessionToken: string = '';

  serverUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  async parseDeckList() {
    this.cards = [];

    const lines = this.deckList.split('\n');
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
  }

  fetchCardData(cardName: string) {
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {          
          this.cards.push(response);
        } else {
          console.error(response);
        }
      },
      (error) => {
        console.log('Error fetching card data:', error);
      }
    );
  }

  async fetchPreviewCardTags(cardSetName: string, cardCollectorNumber: string) {
    const callUrl = this.serverUrl + '/gettag?setname=' + cardSetName + '&number=' + cardCollectorNumber;

    this.http.get(callUrl).subscribe((result: any) => {
      this.previewCardTagInfo = result['data']['card']['taggings'];
    });
  }



  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onCardClick() {
    this.fetchPreviewCardTags(this.previewCard['set'], this.previewCard['collector_number'])
  }
    
}

  // this.getTaggerAuthToken(cardSetName, cardCollectorNumber);
    // https://tagger.scryfall.com/card/{set}/{collector_number}
    //https://cors-proxy.htmldriven.com/?url=https://tagger.scryfall.com/card/${cardSetName}/${cardCollectorNumber}
    //https://cors-proxy.htmldriven.com/?url=https://tagger.scryfall.com/card/c21/59
    //https://thingproxy.freeboard.io/fetch/https://tagger.scryfall.com/card/c21/59

    //https://tagger.scryfall.com/graphql
    // while (this.xCsrfToken === '') {
    //   await this.delay(1000);
    // }
    
    // const requestPayload = {
    //   operationName: "FetchCard",
    //   query: "query FetchCard($set:String! $number:String! $back:Boolean=false $moderatorView:Boolean=false){card:cardBySet(set:$set number:$number back:$back){...CardAttrs backside layout scryfallUrl sideNames twoSided rotatedLayout taggings(moderatorView:$moderatorView){...TaggingAttrs tag{...TagAttrs ancestorTags{...TagAttrs}}}relationships(moderatorView:$moderatorView){...RelationshipAttrs}}}fragment CardAttrs on Card{artImageUrl backside cardImageUrl collectorNumber id illustrationId name oracleId printingId set}fragment RelationshipAttrs on Relationship{classifier classifierInverse annotation subjectId subjectName createdAt creatorId foreignKey id name pendingRevisions relatedId relatedName status type}fragment TagAttrs on Tag{category createdAt creatorId id name namespace pendingRevisions slug status type}fragment TaggingAttrs on Tagging{annotation subjectId createdAt creatorId foreignKey id pendingRevisions type status weight}",
    //   variables: {
    //     set: cardSetName,
    //     number: cardCollectorNumber,
    //     back: false,
    //     moderatorView: false
    //   },
    //   back: false,
    //   moderatorView: false,
    //   number: cardCollectorNumber,
    //   set: cardSetName,
    // };
    // const taggerSessionToken = '';

    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Cookie': '_scryfall_tagger_session=' + taggerSessionToken,
    //   'X-CSRF-Token': this.xCsrfToken });
    // let options = { headers: headers, withCredentials: true };

    // this.http.post(`https://thingproxy.freeboard.io/fetch/https://tagger.scryfall.com/graphql`, requestPayload, options).subscribe(
    //   (response) => {
    //     if (response) {
    //       console.log(response);
    //     }        
    //   },
    //   (error) => {
    //     console.log('Error fetching card data:', error);
    //   }
    // );