import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconNtnuComponent} from './icon-ntnu.component';

describe('IconTudComponent', () => {
  let component: IconNtnuComponent;
  let fixture: ComponentFixture<IconNtnuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconNtnuComponent]
    });
    fixture = TestBed.createComponent(IconNtnuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
