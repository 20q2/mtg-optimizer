import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TagService } from '../services/tag.service';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-tag-add',
  templateUrl: './tag-add.component.html',
  styleUrls: ['./tag-add.component.scss']
})
export class TagAddComponent {

  @Output()
  tagClick: EventEmitter<string> = new EventEmitter();

  inputValue: string = '';

  constructor(public tagService: TagService) 
  {
  }


  addTag() {

  }

}
