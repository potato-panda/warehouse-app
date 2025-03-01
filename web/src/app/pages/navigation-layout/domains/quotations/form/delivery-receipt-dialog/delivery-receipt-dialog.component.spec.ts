import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReceiptDialogComponent } from './delivery-receipt-dialog.component';

describe('CreateDeliveryReceiptDialogComponent', () => {
  let component: DeliveryReceiptDialogComponent;
  let fixture: ComponentFixture<DeliveryReceiptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryReceiptDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
