import {TestBed} from '@angular/core/testing';

import {DeliveryReceiptsService} from './delivery-receipts.service';

describe('DeliveryReceiptsService', () => {
  let service: DeliveryReceiptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryReceiptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
