import {TestBed} from '@angular/core/testing';
import {ResolveFn} from '@angular/router';

import {detailsResolver, ResolvedData} from './details.resolver';

describe('detailsResolver', () => {
  const executeResolver: ResolveFn<ResolvedData> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => detailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
