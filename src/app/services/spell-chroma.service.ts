import { Injectable } from '@angular/core';
import { CardTagObject, ScryfallCardObject } from '../model/tag-objects';
import { loadingPhrases, rareQuotes } from '../model/loading-phrases';
import { toIgnore } from '../model/proper-words';
import { AppMode } from '../model/app-mode';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root',
})
export class SpellChromaService {
  
  deck: ScryfallCardObject[] = []
  deckTags: CardTagObject[] = [];
  previewCard?: ScryfallCardObject;

  activeFilters: string[] = [];
  filteredDeck: ScryfallCardObject[] = [];

  /** All the tags of the deck, aggregated */
  tags: {[key: string]: number} = {};

  topTags: { key: string, instances: number }[] = [];

  loadingPhrase = '';

  appMode: AppMode = AppMode.EXPLORE;
  sortAscending: boolean = true;
  lastSortMode = 'name';
  
  appIsLoading = false;
  loadingDeckList = false;
  previewCardIsLoading = false;

  allTagsSortAscending: boolean = true;
  allTagsLastSortMode = 'name';

  /** Used to make explorer/optimizer fullscreen */
  altModeFullscreen = false;
  previewCardSize = 3;

  deckListMode = 'input';
  deckColorIdentity = "WUBRG";

  colorIdentity: {[key: string]: boolean } = {
    'W': true,
    'U': true,
    'B': true,
    'R': true,
    'G': true,        
  }

  constructor(private tagService: TagService) {
    this.getRandomLoadingQuote();
    
    setInterval(() => {
      this.getRandomLoadingQuote();
    }, 7000);
  }

  /**
   * Given a card, return a string[] of its tags
   */
  getCardTagsAsArray(card: ScryfallCardObject): string[] {
    if (!card) {
      return [];
    }
    
    const ret: string[] = [];
    for (let tagObject of card.tags) {
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

  getBackgroundFromColorIdentity(colorIdentity: string) {
    const backgroundArray: {[key: string]: string} = {
      "WBG": "abzan",
      "WU": "azorius",
      "WUG": "bant",
      "WR": "boros",
      "UB": "dimir",
      "WBRG": "dune-brood",
      "WUB": "esper",
      "G": "forest",
      "UBRG": "glint-eye",
      "BG": "golgari",
      "UBR": "grixis",
      "RG": "gruul",
      "WURG": "ink-treader",
      "U": "island",
      "UR": "izzet",
      "WUR": "jeskai",
      "BRG": "jund",
      "WBR": "mardu",
      "R": "mountain",
      "WRG": "naya",
      "WB": "orzhov",
      "W": "plains",
      "BR": "rakdos",
      "WG": "selesnya",
      "UG": "simic",
      "UBG": "sultai",
      "B": "swamp",
      "URG": "temur",
      "WUBG": "witch-maw",
      "WUBR": "yore-tiller",
      "WUBRG": "wubrg",
      "": "wastes"
    }

    let backgroundLocation = 'assets/color-backgrounds/';
    if (backgroundArray[colorIdentity]) {
      backgroundLocation += backgroundArray[colorIdentity];
    } else {
      backgroundLocation += 'wastes';
    }

    return backgroundLocation + '.png';


  }

  getRandomLoadingQuote() {
    const rare = Math.floor(Math.random() * 100) === 0;
    if (rare) {
      const i = Math.floor(Math.random() * rareQuotes.length);
      this.loadingPhrase = rareQuotes[i];
    } else {    
      const i = Math.floor(Math.random() * loadingPhrases.length);
      this.loadingPhrase = loadingPhrases[i];
    }
  }  

}

