import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardTagObject, ScryfallCardObject, TagInformation } from './tag-objects';
import { ECharts, EChartsOption } from 'echarts';
import { toIgnore } from './proper-words';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('echart')
  echart!: ECharts;
  
  deckList = '';
  cards: ScryfallCardObject[] = [];
  cardsToDisplay: ScryfallCardObject[] = [];
  
  previewCard!: ScryfallCardObject;
  previewCardTagList: CardTagObject[] = [];
  displayCardList = true;

  relatedCardsByTag: ScryfallCardObject[] = [];
  selectedTags: string[] = [];
  displayRelatedCards = true;

  colorIdentity: {[key: string]: boolean } = {
    'G': false,
    'R': false,
    'W': false,
    'U': false,
    'B': false,
  }
  lastSearchedColors = '';

  xCsrfToken: string = '';
  sessionToken: string = '';

  serverUrl = 'http://127.0.0.1:5000';
  scryfallSearchUrl = "https://api.scryfall.com/cards/search";

  appIsLoading = false;
  lastSortMode = '';

  suggestedCommanders: ScryfallCardObject[] = [];

  /** All the tags of the deck, aggregated */
  tags: {[key: string]: number} = {};
  chartOptions!: EChartsOption;

  topTags: { key: string, instances: number }[] = [];


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.chartOptions = {
      xAxis: {
        type: 'category',
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [10, 20, 15, 30, 25],
          type: 'bar',
        },
      ],
    };
  }

  async parseDeckList() {
    this.cards = [];
    this.tags = {};

    const lines = this.deckList.split('\n');
    this.appIsLoading = true;
    for (let line of lines) {
      line = line.trim();
      const match = line.match(/(\d+x?)\s+([^(\n]+)/);
      if (match) {
        const cardName = match[2];
        this.fetchCardData(cardName);
        await this.delay(50).then(() => {          
        });
      }
    }
    this.appIsLoading = false;
    this.cards.sort((a,b) => a.name.localeCompare(b.name));
    this.assignColorIdentity();
    this.calculateDifferentCardTypes();
    this.populateChart();
    this.topTags = this.findTop10Tags();

    this.cardsToDisplay = this.cards.slice(0);
  }

  assignColorIdentity() {
    let mostColors: string[] = [];
    this.cards.forEach(card => {
      if (card.color_identity.length > mostColors.length) {
        mostColors = card.color_identity;
      }
    });
    this.resetColorIdentity();

    mostColors.forEach(color => {
      this.colorIdentity[color] = true;
    })
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
      this.previewCardTagList = result['data']['card']['taggings'];
      this.appIsLoading = false;
    });
  }

  async fetchCardTags(card: ScryfallCardObject) {
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
    this.previewCardTagList = [];
    console.dir(this.previewCard);

  }

  onTagClick(tagSlug: string) {
    if (this.selectedTags.includes(tagSlug)) {
      this.selectedTags = this.selectedTags.filter(item => item !== tagSlug);
    } else {
      this.selectedTags.push(tagSlug);
    }  

    this.loadRecommendedCardsByTag();
  }

  loadRecommendedCardsByTag() {
    let colorString = '';
    let tagString = '';
    
    if (this.selectedTags.length === 0) {
      this.relatedCardsByTag = [];
      return;
    }

    this.selectedTags.forEach(tag => {
      tagString += 'otag:' + tag + ' ';
    })

    for (let key of Object.keys(this.colorIdentity)) {
      if (this.colorIdentity[key]) {
        colorString += key;
      }
    }
    const sub = this.http.get(this.scryfallSearchUrl, {
      params: {
        q: `${tagString} ${colorString ? 'id<=' + colorString : ''}`
      }
    })

    this.appIsLoading = true;
    this.lastSearchedColors = colorString;

    sub.subscribe((result: any) => {
      this.appIsLoading = false;
      this.relatedCardsByTag = [];
      for (let card of result.data) {
        if ((card as ScryfallCardObject).games.includes('paper')) {
          this.relatedCardsByTag.push(card);
        }
      }
    });
  }

  sortRelatedBy(event: MouseEvent) {
    const value = ((event.target as HTMLButtonElement).parentElement as any).value;

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

  compressAllCardTags(tagObjectList: CardTagObject[]): string[] {
    if (!tagObjectList) {
      return [];
    }
    
    const ret: string[] = [];
    for (let tagObject of tagObjectList) {
      const tag = tagObject.tag;
        if (tag.status !== 'REJECTED' && tag.namespace === 'card') {
          if (!ret.includes(tag.slug)) {
            ret.push(tag.slug)
          }
        }
        
        if (tag.ancestorTags && tag.ancestorTags.length > 0) {
          for (let ancestor of tag.ancestorTags) {
            if (ancestor.status !== 'REJECTED' && ancestor.namespace === 'card') {
              if (!ret.includes(ancestor.slug)) {
                ret.push(ancestor.slug)
              }
            }
          }
        }
      
    }

    return ret;
  }

  calculateDifferentCardTypes() {    
    for (let card of this.cards) {
      const condensed = this.compressAllCardTags(card.tags)
      for (let tag of condensed) {
        if (!this.tags[tag]) {
          this.tags[tag] = 1;
        } else {
          this.tags[tag] += 1;
        }
      }
    }

    return this.tags;
  }

  populateChart() {
    const xAxisLabels = [];

    const tagKeys = Object.keys(this.tags);
    for (const key of tagKeys) {
      xAxisLabels.push(key);
    }

    console.log(this.findTop10Tags());
    // this.echart.setOption({xAxis: { type: 'category', data: xAxisLabels }});

  }



  findTop10Tags(): { key: string, instances: number }[] {
    let topTags: { key: string, instances: number }[] = [];
    const tagKeys = Object.keys(this.tags);

    for (let key of tagKeys) {
      const found = topTags.find(item => item.instances <= this.tags[key]);
      if ((found || topTags.length < 10) && !toIgnore.includes(key) && !(/cycle-/.test(key))) {
        topTags = topTags.filter(item => item !== found);
        topTags.push({instances: this.tags[key], key: key});
      }
    }

    topTags.sort((a,b) => b.instances - a.instances)
    return topTags;
  }

  activeFilters: string[] = [];
  filterDeckByTag(tagSlug: string) {
    if (!this.activeFilters.includes(tagSlug)) {
      this.activeFilters.push(tagSlug);
    } else {
      this.activeFilters = this.activeFilters.filter(item => item !== tagSlug);
    }

    this.cardsToDisplay = this.cards.filter(item => {
      for (const filter of this.activeFilters) {
        const allCardTags = this.compressAllCardTags(item.tags);
        if (!allCardTags.includes(filter)) {
          return false;
        }
      }
      return true;
    });
  }

  getTagSlug(tag: any) {
    return tag.tag.slug;
  }
  
    
}
