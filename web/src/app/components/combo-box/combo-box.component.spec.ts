import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ComboBoxComponent} from './combo-box.component';

describe('ComboBoxComponent', () => {
  let component: ComboBoxComponent<any>;
  let fixture: ComponentFixture<ComboBoxComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboBoxComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ComboBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
