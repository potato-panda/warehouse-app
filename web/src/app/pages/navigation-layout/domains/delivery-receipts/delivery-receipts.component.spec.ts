import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReceiptsComponent } from './delivery-receipts.component';

describe('ReceiptsComponent', () => {
  let component: DeliveryReceiptsComponent;
  let fixture: ComponentFixture<DeliveryReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryReceiptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
