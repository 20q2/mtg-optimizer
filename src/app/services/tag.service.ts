import { Injectable, OnInit } from '@angular/core';
import { allTags } from '../model/tag-list';
import { SearchedTag } from '../model/tag-objects';
import { toIgnore } from '../model/proper-words';

@Injectable({
  providedIn: 'root',
})
export class TagService implements OnInit {
  constructor() {}

  allTags: string[] = [];
  filteredTags: string[] = [];

  ngOnInit(): void {
    this.loadAllTags()
  }

  // Loads all tags from a local file to populate add dropdown
  loadAllTags() {
    this.allTags = allTags.filter((tag: SearchedTag) => tag.taggingCount > 2)
      .map(item => item.slug);
    this.filteredTags = this.allTags.slice(0).sort();
  }

  // Filters all tags add dropdown from user input
  filterTags(filterString: string) {
    this.filteredTags = this.allTags.filter(item => item.includes(filterString)).reverse();
  }

  onIgnoreList(tag: string) {
    return toIgnore.includes(tag) || /cycle-/.test(tag) || /-storyline-in-cards/.test(tag);
  }

}