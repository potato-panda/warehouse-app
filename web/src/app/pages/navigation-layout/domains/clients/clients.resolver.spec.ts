import {TestBed} from '@angular/core/testing';
import {ResolveFn} from '@angular/router';

import {clientsResolver} from './clients.resolver';
import {ResourceCollectionResponse} from '../../../../services/company.service';

describe('clientsResolver', () => {
  const executeResolver: ResolveFn<ResourceCollectionResponse> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => clientsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
