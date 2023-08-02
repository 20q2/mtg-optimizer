import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManaCurveComponent } from './mana-curve.component';

describe('ManaCurveComponent', () => {
  let component: ManaCurveComponent;
  let fixture: ComponentFixture<ManaCurveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManaCurveComponent]
    });
    fixture = TestBed.createComponent(ManaCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
