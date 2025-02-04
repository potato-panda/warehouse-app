import {TestBed} from '@angular/core/testing';
import {ResolveFn} from '@angular/router';

import {detailsResolver} from './details.resolver';
import {ResourceWithContactsResponse} from '../../../../../services/company.service';

describe('detailsResolver', () => {
  const executeResolver: ResolveFn<ResourceWithContactsResponse> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => detailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
