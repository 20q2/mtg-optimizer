import { Injectable, OnInit } from '@angular/core';
import { allTags } from '../model/tag-list';
import { SearchedTag } from '../model/tag-objects';

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

  loadAllTags() {
    this.allTags = allTags.filter((tag: SearchedTag) => tag.taggingCount > 2)
      .map(item => item.slug);
    this.filteredTags = this.allTags.slice(0);
  }

  filterTags(filterString: string) {
    this.filteredTags = this.allTags.filter(item => item.includes(filterString));
  }

}