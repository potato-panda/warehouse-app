import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeliveryReceiptDialogComponent } from './create-delivery-receipt-dialog.component';

describe('CreateDeliveryReceiptDialogComponent', () => {
  let component: CreateDeliveryReceiptDialogComponent;
  let fixture: ComponentFixture<CreateDeliveryReceiptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeliveryReceiptDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDeliveryReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
