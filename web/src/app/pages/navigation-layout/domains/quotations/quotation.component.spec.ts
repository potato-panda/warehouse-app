import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationComponent } from './quotation.component';

describe('QuotationsComponent', () => {
  let component: QuotationComponent;
  let fixture: ComponentFixture<QuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
