import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {CompanyService, ResourceCollectionResponse} from '../../../../services/company.service';
import {catchError, EMPTY} from 'rxjs';

export const clientsResolver: ResolveFn<ResourceCollectionResponse> = (route, state) => {
  const service = inject(CompanyService);
  return service.getPage().pipe(catchError((err, caught) => {
    return EMPTY;
  }));
};
