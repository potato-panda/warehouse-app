import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { detailsResolver } from './details.resolver';
import {ResourceResponse} from '../../../../../services/company.service';

describe('detailsResolver', () => {
  const executeResolver: ResolveFn<ResourceResponse> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => detailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
