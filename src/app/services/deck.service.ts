import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardTagObject, ScryfallCardObject } from '../model/tag-objects';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeckService {
  constructor() {}

  deck: ScryfallCardObject[] = []
  deckTags: CardTagObject[] = [];


}