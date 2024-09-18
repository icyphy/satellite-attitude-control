import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconTudComponent} from './icon-tud.component';

describe('IconTudComponent', () => {
  let component: IconTudComponent;
  let fixture: ComponentFixture<IconTudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconTudComponent]
    });
    fixture = TestBed.createComponent(IconTudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
