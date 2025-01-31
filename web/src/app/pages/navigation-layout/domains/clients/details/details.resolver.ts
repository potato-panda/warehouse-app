import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {CompanyService, ResourceWithContactsResponse} from '../../../../../services/company.service';
import {catchError, EMPTY} from 'rxjs';

export const detailsResolver: ResolveFn<ResourceWithContactsResponse> = (route, state) => {
  const service = inject(CompanyService);
  const id = route.params['id'];
  if (id) {
    return service.getOne(id, 'contacts').pipe(catchError((err, caught) => {
      return EMPTY;
    }));
  }
  return EMPTY;
};
