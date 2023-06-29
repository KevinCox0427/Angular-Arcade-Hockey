import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RinkComponent } from './rink.component';

describe('RinkComponent', () => {
  let component: RinkComponent;
  let fixture: ComponentFixture<RinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RinkComponent]
    });
    fixture = TestBed.createComponent(RinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
