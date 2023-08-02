import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGridComponent } from './card-grid.component';

describe('CardGridComponent', () => {
  let component: CardGridComponent;
  let fixture: ComponentFixture<CardGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardGridComponent]
    });
    fixture = TestBed.createComponent(CardGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
