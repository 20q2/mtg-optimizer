import { Component,  OnInit,  ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ColorIdentityPickerComponent } from './color-identity-picker/color-identity-picker.component';
import { ignoreLayouts, toIgnore } from './model/proper-words';
import { CardTagObject, ScryfallCardObject } from './model/tag-objects';
import { SnackbarService } from './services/snackbar.service';
import { AppMode } from './model/app-mode';
import { SpellChromaService } from './services/spell-chroma.service';
import { ScryfallService } from './services/scryfall.service';
import { TagService } from './services/tag.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('colorPicker')
  colorPicker!: ColorIdentityPickerComponent;

  @ViewChild('searchInput')
  searchInput!: HTMLInputElement;
  

  deckTextInput = '';
  cardsToDisplay: ScryfallCardObject[] = [];
  
  displayCardList = true;

  relatedCardsByTag: ScryfallCardObject[] = [];
  filteredRelatedCardsByTag: ScryfallCardObject[] = [];
  selectedTags: string[] = [];
  displayRelatedCards = true;

  lastSearchedColors = '';

  xCsrfToken: string = '';
  sessionToken: string = '';

  serverUrl = 'https://1f5fr8bzm2.execute-api.us-east-1.amazonaws.com/default/get-tags-proxy';
  scryfallSearchUrl = "https://api.scryfall.com/cards/search";

  appIsLoading = false;
  lastSortMode = 'name';
  sortAscending = true;

  suggestedCommanders: ScryfallCardObject[] = [];

  /** All the tags of the deck, aggregated */
  tags: {[key: string]: number} = {};

  topTags: { key: string, instances: number }[] = [];

  appMode: AppMode = AppMode.EXPLORE;
  deckListMode = 'input';

  /** Used to make explorer/optimizer fullscreen */
  altModeFullscreen = false;

  deckColorIdentity = "WUBRG";

  constructor(
    private http: HttpClient,
    public snackbarService: SnackbarService,
    public spellChromaService: SpellChromaService,
    public scryfallService: ScryfallService,
    public tagService: TagService
  ) { }

  ngOnInit(): void {
    this.tagService.loadAllTags(); 
  }

  get AppMode() {
    return AppMode;
  }

  async parseDeckList() {
    this.spellChromaService.deck = [];
    this.tags = {};
    this.appMode = AppMode.EXPLORE;

    if (this.deckTextInput.trim() === '') {
      return;
    }

    const lines = this.deckTextInput.split('\n');        
    this.appIsLoading = true;
    for (let line of lines) {
      line = line.trim();
      const match = line.match(/(\d+x?)?\s*([^(\n]+)/);
      if (match) {
        const cardName = match[2];
        this.fetchCardData(cardName);
        await this.delay(50).then(() => {          
        });
      }
    }
    this.appIsLoading = false;
    this.spellChromaService.deck.sort((a,b) => a.name.localeCompare(b.name));
    this.assignColorIdentity();
    this.calculateDifferentCardTypes();
    // this.populateChart();
    this.topTags = this.findTop10Tags();

    this.cardsToDisplay = this.spellChromaService.deck.slice(0);
    this.deckListMode = 'visual'
  }

  clearPreviewCard() {
    this.spellChromaService.previewCard = undefined;
  }

  onIgnoreList(tag: string) {
    return toIgnore.includes(tag) || /cycle-/.test(tag) || /-storyline-in-cards/.test(tag);
  }

  assignColorIdentity() {
    let mostColors: string[] = [];
    this.spellChromaService.deck.forEach(card => {
      if (card.color_identity.length >= mostColors.length) {
        mostColors = card.color_identity;     
      }
    });
    this.colorPicker.resetColorIdentity();    

    mostColors.forEach(color => {
      this.colorPicker.colorIdentity[color] = true;      
    })

    this.updateDeckColorIdentity();
  }

  fetchCardData(cardName: string) {
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {
          response = this.assignCardImageUrl(response);
          // this.manaCurve.updateManaCurve((response as ScryfallCardObject).cmc);
          this.spellChromaService.deck.push(response);
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
    const callUrl = this.serverUrl + '?setname=' + cardSetName + '&number=' + cardCollectorNumber;
    this.http.get(callUrl).subscribe((result: any) => {
      if (this.spellChromaService.previewCard) {
        this.spellChromaService.previewCard.tags = result['data']['card']['taggings'];      
      }
      this.appIsLoading = false;
    });
  }

  async fetchCardTags(card: ScryfallCardObject) {
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

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  swapAppMode(mode: AppMode) {
    this.appMode = mode;
  }

  onCardClick(card: ScryfallCardObject) {
    this.spellChromaService.previewCard = card;
    this.fetchPreviewCardTags(this.spellChromaService.previewCard['set'], this.spellChromaService.previewCard['collector_number']);
  }

  sendToSearch(key: string) {
    this.onTagClick(key);
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
    let tagString = '';
    
    if (this.selectedTags.length === 0) {
      this.relatedCardsByTag = [];
      return;
    }

    this.selectedTags.forEach(tag => {
      tagString += 'otag:' + tag + ' ';
    })

    const colorString = this.colorPicker.getColorIdentityString();  
    this.lastSearchedColors = colorString;

    const sub = this.http.get(this.scryfallSearchUrl, {
      params: {
        q: `${tagString} ${colorString ? 'id<=' + colorString : ''}`
      }
    })

    this.appIsLoading = true;

    sub.subscribe((result: any) => {
      this.appIsLoading = false;
      this.relatedCardsByTag = [];
      this.scryfallService.moreRelatedCardsLink = '';    
      this.scryfallService.hasMoreRelatedCards = result.has_more;

      if (this.scryfallService.hasMoreRelatedCards) {
        this.scryfallService.moreRelatedCardsLink = result.next_page;
        result.total_cards
      }

      for (let card of result.data) {
        if ((card as ScryfallCardObject).games.includes('paper') && !ignoreLayouts.includes((card.layout as string).toLocaleLowerCase()) && !ignoreLayouts.includes((card.type_line as string).toLocaleLowerCase())) {
          this.relatedCardsByTag.push(this.assignCardImageUrl(card));
        }
      }

      this.filteredRelatedCardsByTag = this.relatedCardsByTag;
      
    }, (error) => {
      console.error(error);
      if (error.status === 404) {
        this.snackbarService.showSnackbar('There were no results using that search criteria');
      } else {
        this.snackbarService.showSnackbar('There was an error when loading tag related cards');
      }
      this.appIsLoading = false;
    });
  }

  relatedCardPages: string[] = [];
  loadNextRecommendedPage() {
    this.appIsLoading = true;
    this.relatedCardPages.push()

    this.http.get(this.scryfallService.moreRelatedCardsLink).subscribe(      
      (result: any) => {
        this.appIsLoading = false;
        this.scryfallService.moreRelatedCardsLink = '';    
        this.scryfallService.hasMoreRelatedCards = result.has_more;

        if (this.scryfallService.hasMoreRelatedCards) {
          this.scryfallService.moreRelatedCardsLink = result.next_page;
        }

        for (let card of result.data) {
          if ((card as ScryfallCardObject).games.includes('paper') && !ignoreLayouts.includes((card.layout as string).toLocaleLowerCase()) && !ignoreLayouts.includes((card.type_line as string).toLocaleLowerCase())) {
            this.relatedCardsByTag.push(this.assignCardImageUrl(card));
          }
        }
        this.filterTagResults(this.searchInput.value);
      }
    )
  }

  loadPreviousPage() {

  }

  sortRelatedBy(event: MouseEvent) {
    const value = ((event.target as HTMLButtonElement).parentElement as any).value;
    

    if (value === 'cmc') {
      this.relatedCardsByTag.sort((a, b) => {
        return (a['cmc'] - b['cmc'] || (a['name'] as string).localeCompare(b['name']))
      })
    } else if (value === 'name') {
      this.relatedCardsByTag.sort((a, b) => {
        return (a['name'] as string).localeCompare(b['name'])
      })
    } else if (value === 'color') {
      this.relatedCardsByTag.sort((a, b) => {
        return ((a['color_identity'] as string[]).join('').localeCompare((b['color_identity'] as string[]).join('')) || (a['name'] as string).localeCompare(b['name']))
      })
    } else if (value === 'type') {
      this.relatedCardsByTag.sort((a, b) => {
        return ((a['type_line']).localeCompare((b['type_line'])) || (a['name'] as string).localeCompare(b['name']))
      })
    } else if (value === 'latest') {
      this.relatedCardsByTag.sort((a, b) => {
        return ((a['released_at'].localeCompare((b['released_at']))) || (a['name'] as string).localeCompare(b['name']))
      })
    }    

    if (value === this.lastSortMode && this.sortAscending) {
      this.relatedCardsByTag.reverse();
      this.sortAscending = false;
    } else {
      this.lastSortMode = value;
      this.sortAscending = true;
    }    
  }

  filterTagResults(filterString: string): void {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag.filter(item => {
      return (item.name && item.name.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())) || 
        (item.oracle_text && item.oracle_text.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()));
    })
  }

  /**
   * Given a card, return a string[] of its tags
   */
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

    ret.sort(value => this.onIgnoreList(value) ? 1 : -1);

    return ret;
  }

  calculateDifferentCardTypes() {        
    for (let card of this.spellChromaService.deck) {
      const condensed = this.compressAllCardTags(card.tags);
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

  /** dw bout this */
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
      if ((found || topTags.length < 10) && !this.onIgnoreList(key)) {
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

    this.cardsToDisplay = this.spellChromaService.deck.filter(item => {
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

  updateDeckColorIdentity(): void {
    this.deckColorIdentity = this.colorPicker.getColorIdentityString();
  }
  
  getObjectKeys(obj: { [key: string]: any }) {
    return Object.keys(obj).sort();
  }
    
}
