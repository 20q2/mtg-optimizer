import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorIdentityPickerComponent } from './color-identity-picker.component';

describe('ColorIdentityPickerComponent', () => {
  let component: ColorIdentityPickerComponent;
  let fixture: ComponentFixture<ColorIdentityPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ColorIdentityPickerComponent]
    });
    fixture = TestBed.createComponent(ColorIdentityPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
