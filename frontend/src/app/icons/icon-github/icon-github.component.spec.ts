import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconGithubComponent} from './icon-github.component';

describe('IconGithubComponent', () => {
  let component: IconGithubComponent;
  let fixture: ComponentFixture<IconGithubComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconGithubComponent]
    });
    fixture = TestBed.createComponent(IconGithubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
