import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { clientsResolver } from './clients.resolver';
import {PageableResourceResponse} from '../../../../services/company.service';

describe('clientsResolver', () => {
  const executeResolver: ResolveFn<PageableResourceResponse> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => clientsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
