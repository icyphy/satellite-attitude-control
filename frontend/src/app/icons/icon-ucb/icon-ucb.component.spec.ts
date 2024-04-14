import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconUcbComponent} from './icon-ucb.component';

describe('IconTudComponent', () => {
  let component: IconUcbComponent;
  let fixture: ComponentFixture<IconUcbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconUcbComponent]
    });
    fixture = TestBed.createComponent(IconUcbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
