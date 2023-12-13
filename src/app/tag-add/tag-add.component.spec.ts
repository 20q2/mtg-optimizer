import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagAddComponent } from './tag-add.component';

describe('TagAddComponent', () => {
  let component: TagAddComponent;
  let fixture: ComponentFixture<TagAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagAddComponent]
    });
    fixture = TestBed.createComponent(TagAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
