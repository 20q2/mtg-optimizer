import { Component,  HostListener,  OnInit,  ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ColorIdentityPickerComponent } from './color-identity-picker/color-identity-picker.component';
import { ignoreLayouts } from './model/proper-words';
import { CardTagObject, ScryfallCardObject } from './model/tag-objects';
import { SnackbarService } from './services/snackbar.service';
import { AppMode } from './model/app-mode';
import { SpellChromaService } from './services/spell-chroma.service';
import { ScryfallService } from './services/scryfall.service';
import { TagService } from './services/tag.service';
import { Observable, Subscription, catchError, forkJoin, interval, mergeMap, of } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { CategoryButton } from './model/category-button';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showingAddTag) {
      this.showingAddTag = false;
    }
  }

  @ViewChild('colorPicker')
  colorPicker!: ColorIdentityPickerComponent;

  @ViewChild('searchInput')
  searchInput!: HTMLInputElement;
  
  appMode = AppMode;
  loadingAmount = 0; // Out of 100
  loadingInterval: Subscription | undefined;
  loadedCards?: number;

  deckTextInput = '';
  cardsToDisplay: ScryfallCardObject[] = [];
  
  displayCardList = true;

  relatedCardsByTag: ScryfallCardObject[] = [];
  filteredRelatedCardsByTag: ScryfallCardObject[] = [];
  selectedTags: string[] = [];
  exploreCardCategories: CategoryButton[] = [];

  lastSearchedColors = '';

  serverUrl = 'https://1f5fr8bzm2.execute-api.us-east-1.amazonaws.com/default/get-tags-proxy';
  scryfallSearchUrl = "https://api.scryfall.com/cards/search";

  suggestedCommanders: ScryfallCardObject[] = [];

  showingAddTag = false;
  showingAddTagBottom = false;
  sortedTags: any[] = [];
  minimizeTopTags = false;
  minimizeFocusedTags = false;

  lastSortedMode: string = '';

  constructor(
    private http: HttpClient,
    public snackbarService: SnackbarService,
    public spellChromaService: SpellChromaService,
    public scryfallService: ScryfallService,
    public tagService: TagService,
    private clipboard: Clipboard,
  ) {
    
  }

  ngOnInit(): void {
    this.tagService.loadAllTags(); 
  }

  get AppMode() {
    return AppMode;
  }

  async parseDeckList() {
    this.spellChromaService.deck = [];
    this.spellChromaService.tags = {};
    this.spellChromaService.appMode = AppMode.EXPLORE;
    this.startLoadingBar();

    if (this.deckTextInput.trim() === '') {
      return;
    }

    const lines = this.deckTextInput.split('\n');        
    this.spellChromaService.appIsLoading = true;
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

    if (this.spellChromaService.deck.length === 0) {
      this.snackbarService.showSnackbar('No cards were found in your decklist');
      this.spellChromaService.appIsLoading = false;
      return;
    }

    await this.fetchCardTags(this.spellChromaService.deck).toPromise();

    this.spellChromaService.appIsLoading = false;
    this.spellChromaService.deck.sort((a,b) => a.name.localeCompare(b.name));
    this.assignColorIdentity();
    this.calculateDifferentCardTypes();
    this.spellChromaService.topTags = this.findTop10Tags();
    this.sortRelatedBy('');

    this.cardsToDisplay = this.spellChromaService.deck.slice(0);
    this.spellChromaService.deckListMode = 'visual'
  }

  clearPreviewCard() {
    this.spellChromaService.previewCard = undefined;
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
      this.spellChromaService.colorIdentity[color] = true;      
    })

    this.updateDeckColorIdentity();
  }

  fetchCardData(cardName: string) {
    this.http.get<any>('https://api.scryfall.com/cards/named?fuzzy=' + cardName).subscribe(
      (response) => {
        if (response.object === 'card') {
          response = this.assignCardImageUrl(response);
          this.spellChromaService.deck.push(response);
        } else {
          console.error(response);
        }
      },
      (error) => {
        this.snackbarService.showSnackbar('There was an error trying to fetch information on that tag');
        this.spellChromaService.appIsLoading = false;
        console.log('Error fetching card data:', error);
      }
    );
  }

  async fetchPreviewCardTags(card: ScryfallCardObject) {
    if (card.tags) {
      return;
    }

    this.spellChromaService.previewCardIsLoading = true;
    this.http.post(this.serverUrl, {'cards': [card]}).subscribe((results: any) => {
      this.spellChromaService.previewCardIsLoading = false;
      if (this.spellChromaService.previewCard) {
        card.tags = results[0]['data']['card']['taggings'];          
      }
    });
  }

  fetchCardTags(cards: ScryfallCardObject[]): Observable<any> {
    const batchSize = 15;
    const totalCards = cards.length;
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
  
    const options = {
      headers: headers,
      timeout: 30000, // Max 30 seconds for each batch
    };
  
    const observables = [];
  
    // Divide cards into batches
    for (let i = 0; i < totalCards; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
  
      // Create an observable for each batch
      const observable = this.http.post(this.serverUrl, { 'cards': batch }, options).pipe(
        catchError(error => {
          this.stopLoadingBar();
          return of(error);
        })
      );
  
      observables.push(observable);
    }
  
    // Combine all observables using forkJoin
    return forkJoin(observables).pipe(
      mergeMap((results: any[]) => {
        results = results.flat();
        for (const result of results) {
          if (result instanceof Error) {
            // Handle error for this card if needed
          }
          const matchingCard = cards.find(item => item.id === result['data']['card']['id'])
          if (matchingCard) {
            matchingCard.tags = result['data']['card']['taggings'];
          }
        }
  
        this.stopLoadingBar();
        return of(true); // Notify that the operation is complete
      })
    );
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
    this.spellChromaService.appMode = mode;

    if (mode === AppMode.VIEW) {
      this.sortedTags = this.getSortedAllTags();
    }
  }

  onCardClick(card: ScryfallCardObject) {
    this.spellChromaService.previewCard = card;
    this.minimizeFocusedTags = false;
    this.fetchPreviewCardTags(this.spellChromaService.previewCard);
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
      this.filteredRelatedCardsByTag = [];
      return;
    }

    this.selectedTags.forEach(tag => {
      tagString += 'otag:' + tag + ' ';
    })

    let colorString = 'WUBRG';
    if (this.colorPicker) {
      colorString = this.colorPicker.getColorIdentityString();  
    }
    this.lastSearchedColors = colorString;

    const sub = this.http.get(this.scryfallSearchUrl, {
      params: {
        q: `${tagString} ${colorString ? 'id<=' + colorString : ''}`
      }
    })

    this.spellChromaService.appIsLoading = true;

    sub.subscribe((result: any) => {
      this.spellChromaService.appIsLoading = false;
      this.relatedCardsByTag = [];
      this.scryfallService.moreRelatedCardsLink = '';    
      this.scryfallService.hasMoreRelatedCards = result.has_more;

      if (this.scryfallService.hasMoreRelatedCards) {
        this.scryfallService.moreRelatedCardsLink = result.next_page;
        this.scryfallService.numberOfUnloadedCards = result.total_cards
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
      this.spellChromaService.appIsLoading = false;
    });
  }

  incrementPreviewCardSize(amount: number) {
    this.spellChromaService.previewCardSize += amount;
    if (this.spellChromaService.previewCardSize < 0) {
      this.spellChromaService.previewCardSize = 0;
    }
    if (this.spellChromaService.previewCardSize > 5) {
      this.spellChromaService.previewCardSize = 5;
    }
  }

  relatedCardPages: string[] = [];
  loadNextRecommendedPage() {
    this.spellChromaService.appIsLoading = true;
    this.relatedCardPages.push()

    this.http.get(this.scryfallService.moreRelatedCardsLink).subscribe(      
      (result: any) => {
        this.spellChromaService.appIsLoading = false;
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

  loadAllRecommendedPages(url: string = this.scryfallService.moreRelatedCardsLink): void {
    if (!url) return;

    this.spellChromaService.appIsLoading = true;
    this.loadedCards = this.relatedCardsByTag.length;

    this.http.get(url).subscribe((result: any) => {
      const { data, has_more, next_page } = result;

      // Append filtered cards
      for (let card of data) {
        if (
          (card as ScryfallCardObject).games.includes('paper') &&
          !ignoreLayouts.includes((card.layout as string).toLowerCase()) &&
          !ignoreLayouts.includes((card.type_line as string).toLowerCase())
        ) {
          this.relatedCardsByTag.push(this.assignCardImageUrl(card));
          this.loadedCards! += 1;
        }
      }

      // Continue if there's more
      if (has_more && next_page) {
        this.loadAllRecommendedPages(next_page);
      } else {
        this.scryfallService.hasMoreRelatedCards = false;
        this.scryfallService.moreRelatedCardsLink = '';
        this.spellChromaService.appIsLoading = false;
        this.loadedCards = undefined;
        this.filterTagResults(this.searchInput.value);
      }
    });
  }

  sortRelatedBy(value: string) {
    if (value === '') {
      value = this.lastSortedMode;
    }

    this.lastSortedMode = value;
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

    if (value === this.spellChromaService.lastSortMode && this.spellChromaService.sortAscending) {
      this.relatedCardsByTag.reverse();
      this.spellChromaService.sortAscending = false;
    } else {
      this.spellChromaService.lastSortMode = value;
      this.spellChromaService.sortAscending = true;
    }

    this.updateExplorerCardCategories();
  }

  updateExplorerCardCategories() {
    // Populate exploreCardCategories based on current sort mode
    const categorySet = new Set<string>();

    this.filteredRelatedCardsByTag.forEach(card => {
      switch (this.lastSortedMode) {
        case 'cmc':
          categorySet.add(card.cmc.toString());
          break;

        case 'color':
          card.color_identity.forEach(color => categorySet.add(color));
          break;

        case 'type':
          const mainType = card.type_line.split('—')[0].trim();
          categorySet.add(mainType);
          break;
      }
    });

    const buttonMap = Array.from(categorySet).map(item => {
      return {
        category: item,
        selected: 0
      } as CategoryButton
    })

    // Just assign — no sorting
    this.exploreCardCategories = buttonMap;
  }



  getSortedAllTags() {  
    let entries =  Object.entries(this.spellChromaService.tags).sort((a,b) => {
      if (this.spellChromaService.allTagsLastSortMode === 'name') {
        return a[0].localeCompare(b[0]);
      } else if (this.spellChromaService.allTagsLastSortMode === 'number') {
        return b[1] - a[1];
      } else {
        return a[0].localeCompare(b[0]);
      }
    }); 

    if (!this.spellChromaService.allTagsSortAscending) {
      entries.reverse();
    }

    entries = entries.filter(item => !this.tagService.onIgnoreList(item[0]));

    return entries;
  }

  /* filters tag (Explorer) results based on a string. Updates filteredRelatedCardsByTag*/
  filterTagResults(filterString: string): void {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag.filter(item => {
      return (item.name && item.name.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())) || 
        (item.oracle_text && item.oracle_text.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()));
    })
  }

  onClickExplorerFilter(filter: CategoryButton) {
    filter.selected += 1;
    if (filter.selected === 2) {
      filter.selected = -1;
    }
    const selected = this.exploreCardCategories.filter(item => item.selected).map(item => item.category);

    this.filterExplorerByCategory();
  }

  /* filters tag (Explorer) results based on a  string category. Updates filteredRelatedCardsByTag*/
  filterExplorerByCategory() {
  // Get included and excluded categories
  const included = this.exploreCardCategories
    .filter(btn => btn.selected === 1)
    .map(btn => btn.category);

  const excluded = this.exploreCardCategories
    .filter(btn => btn.selected === -1) // or === -1 if that was intended
    .map(btn => btn.category);

  if (included.length === 0 && excluded.length === 0) {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag;
    return;
  }

  if (this.lastSortedMode === 'cmc') {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag.filter(item => {
      const cmcStr = item.cmc.toString();
      return (
        (included.length === 0 || included.includes(cmcStr)) &&
        !excluded.includes(cmcStr)
      );
    });
  }

  if (this.lastSortedMode === 'color') {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag.filter(item => {
      const colors = item.color_identity;
      return (
        (included.length === 0 || colors.some(c => included.includes(c))) &&
        !colors.some(c => excluded.includes(c))
      );
    });
  }

  if (this.lastSortedMode === 'type') {
    this.filteredRelatedCardsByTag = this.relatedCardsByTag.filter(item => {
      const types = item.type_line.split(' ');
      return (
        (included.length === 0 || types.some(t => included.includes(t))) &&
        !types.some(t => excluded.includes(t))
      );
    });
  }
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

    ret.sort(value => this.tagService.onIgnoreList(value) ? 1 : -1);

    return ret;
  }

  calculateDifferentCardTypes() {        
    for (let card of this.spellChromaService.deck) {
      const condensed = this.compressAllCardTags(card.tags);
      for (let tag of condensed) {
        if (!this.spellChromaService.tags[tag]) {
          this.spellChromaService.tags[tag] = 1;
        } else {
          this.spellChromaService.tags[tag] += 1;
        }
      }
    }

    return this.spellChromaService.tags;
  }

  findTop10Tags(): { key: string, instances: number }[] {
    let entries =  Object.entries(this.spellChromaService.tags).sort((a,b) => {   
      return b[1] - a[1];
    }); 

    entries = entries.filter(item => !this.tagService.onIgnoreList(item[0]));
    return entries.slice(0, 10).map(item => {
      return {key: item[0], instances: item[1]}
    });
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

  filterDeckByCmc(cmc: number) {
    if (cmc === -1) {
      this.cardsToDisplay = this.spellChromaService.deck.filter(item => {
        return item.type_line.toLocaleLowerCase().includes('land');
      });
    } else {
      this.cardsToDisplay = this.spellChromaService.deck.filter(item => {
        return item.cmc === cmc;
      });
    }
  }

  getTagSlug(tag: any) {
    return tag.tag.slug;
  }

  updateDeckColorIdentity(): void {
    this.spellChromaService.deckColorIdentity = this.colorPicker.getColorIdentityString();
  }
  
  getObjectKeys(obj: { [key: string]: any }) {
    return Object.keys(obj).sort();
  }

  private startLoadingBar() {
    this.loadingAmount = 0;
    this.spellChromaService.loadingDeckList = true;
    this.loadingInterval = interval(2000).subscribe(() => {
      if (this.loadingAmount < 100) {
        if (this.spellChromaService.deck.length >= 15) {
          this.loadingAmount += 100 / 5;
        } else {
          this.loadingAmount += 100 / this.spellChromaService.deck.length;
        }
      } else {
        // If the loading is complete, stop the interval
        this.stopLoadingBar();
      }
    });
  }

  private stopLoadingBar() {
    // Stop the loading bar interval
    this.loadingInterval?.unsubscribe();
    this.spellChromaService.loadingDeckList = false;
  }

  goToEdhrec(card: ScryfallCardObject) {
    window.open('https://edhrec.com/cards/' + card.name.toLocaleLowerCase().replace(/ /g, '-'), '_blank');
  }

  goToScryfall(card: ScryfallCardObject) {
    window.open(`https://scryfall.com/card/${card.set}/${card.collector_number}/${card.name.toLocaleLowerCase().replace(/[ \/]/g, '-')}`, '_blank');
  }

  addToDeck(card: ScryfallCardObject) {
    this.spellChromaService.deck.push(card);
  }

  copyCardName(card: ScryfallCardObject) {
    this.clipboard.copy(card.name);
    this.snackbarService.showSnackbar('\'' + card.name + '\' copied to clipboard!');
  }
    
}
