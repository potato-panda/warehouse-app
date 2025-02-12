import {TestBed} from '@angular/core/testing';

import {QuoteItemService} from './quote-item.service';

describe('QuoteItemService', () => {
  let service: QuoteItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
