import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardTagObject, ScryfallCardObject } from '../model/tag-objects';
import { HttpClient } from '@angular/common/http';
import { toIgnore } from '../model/proper-words';

@Injectable({
  providedIn: 'root',
})
export class SpellChromaService {
  constructor() {}

  xCsrfToken: string = '';
  sessionToken: string = '';



  deck: ScryfallCardObject[] = []
  deckTags: CardTagObject[] = [];
  filteredDeck: ScryfallCardObject[] = [];

  previewCard?: ScryfallCardObject;


  activeFilters: string[] = [];
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

}