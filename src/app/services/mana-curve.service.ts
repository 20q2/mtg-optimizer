import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScryfallCardObject } from '../model/tag-objects';

@Injectable({
  providedIn: 'root',
})
export class ManaCurveService {

  ideal40: {[key: number | string]: number} = {
    land: 17,
    1: 2,
    2: 7,
    3: 7,
    4: 4,
    5: 3,
  }

  ideal60: {[key: number | string]: number} = {
    land: 26,
    1: 3,
    2: 10,
    3: 10,
    4: 7,
    5: 4,
  }

  commander2: {[key: number | string]: number} = {
    land: 42,
    1: 9,
    2: 0,
    3: 20,
    4: 14,
    5: 9,
    6: 4,
    rocks: 1
  }

  commander3: {[key: number | string]: number} = {
    land: 42,
    1: 8,
    2: 19,
    3: 0,
    4: 16,
    5: 10,
    6: 3,
    rocks: 1
  }

  commander4: {[key: number | string]: number} = {
    land: 39,
    1: 6,
    2: 12,
    3: 13,
    4: 0,
    5: 13,
    6: 8,
    rocks: 8
  }

  commander5: {[key: number | string]: number} = {
    land: 39,
    1: 6,
    2: 12,
    3: 10,
    4: 13,
    5: 0,
    6: 10,
    rocks: 9
  }

  commander6: {[key: number | string]: number} = {
    land: 38,
    1: 6,
    2: 12,
    3: 10,
    4: 14,
    5: 9,
    6: 0,
    rocks: 10
  }

  constructor(private snackBar: MatSnackBar) {}

  compareCurve(deck: ScryfallCardObject[]) {
    const deckCurve: {[key: number]: number} = {};

    for (const card of deck) {
      if (!deckCurve[card.cmc]) {
        deckCurve[card.cmc] = 1;
      } else {
        deckCurve[card.cmc] += 1;
      }
    }

    let toCompare = undefined;
    if (deck.length <= 40) {
      toCompare = this.ideal40;
    } else if (deck.length <= 60) {      
      toCompare = this.ideal60;
    } else if (deck.length <= 100) {
      toCompare = this.commander2;
      console.log('oh no its commander')
    } else {
      toCompare = this.ideal60;
    }

    const keys = Object.keys(toCompare);
    const difference: {[key: string]: number} = {};


    for (let key of keys) {
      difference[key] = deckCurve[+key] - toCompare[key];
    }

    return difference;
  }
}