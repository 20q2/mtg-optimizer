import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardTagObject, ScryfallCardObject } from '../model/tag-objects';
import { HttpClient } from '@angular/common/http';
import { loadingPhrases, rareQuotes } from '../model/loading-phrases';
import { toIgnore } from '../model/proper-words';
import { ScryfallService } from './scryfall.service';
import { AppMode } from '../model/app-mode';

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

  allTagsSortAscending: boolean = true;
  allTagsLastSortMode = 'name';
  
  /** Used to make explorer/optimizer fullscreen */
  altModeFullscreen = false;
  previewCardSize = 3;

  colorIdentity: {[key: string]: boolean } = {
    'W': true,
    'U': true,
    'B': true,
    'R': true,
    'G': true,        
  }

  constructor() {
    this.getRandomLoadingQuote();
    
    setInterval(() => {
      this.getRandomLoadingQuote();
    }, 7000);
  }

  

  filterDeckByTag(tagSlug: string) {
    if (!this.activeFilters.includes(tagSlug)) {
      this.activeFilters.push(tagSlug);
    } else {
      this.activeFilters = this.activeFilters.filter(item => item !== tagSlug);
    }

    this.filteredDeck = this.deck.filter(item => {
      for (const filter of this.activeFilters) {
        const allCardTags = this.getCardTagsAsArray(item);
        if (!allCardTags.includes(filter)) {
          return false;
        }
      }
      return true;
    });
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

    ret.sort(value => this.onIgnoreList(value) ? 1 : -1);

    return ret;
  }

  onIgnoreList(tag: string) {
    return toIgnore.includes(tag) || /cycle-/.test(tag) || /-storyline-in-cards/.test(tag);
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

