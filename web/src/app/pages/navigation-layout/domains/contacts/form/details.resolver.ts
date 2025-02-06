import {ResolveFn} from '@angular/router';
import {ContactsResourceResponse, ContactsService,} from '../../../../../services/contacts.service';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, mergeMap, of} from 'rxjs';
import {CompaniesResourceResponse, CompanyService,} from '../../../../../services/company.service';

export type ResolvedData = {
  contact: ContactsResourceResponse,
  company: CompaniesResourceResponse | null
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const contactsService = inject(ContactsService);
  const companyService = inject(CompanyService);
  const id = route.params['id'];
  if (id) {
    return contactsService.getOne(id).pipe(
      concatMap((contactResponse) => {
        const companyId = contactResponse._embedded?.company.id;
        if (contactResponse) {
          if (companyId) {
            return companyService.getOne(companyId).pipe(
              mergeMap(companyResponse => {
                console.log(companyResponse);
                return of({
                  company: companyResponse,
                  contact: contactResponse
                } as ResolvedData);
              }),
              catchError((err, caught) => of()),
            );
          }
          return of({
            company: null,
            contact: contactResponse
          });
        }
        return EMPTY;
      }),
      catchError((err, caught) => EMPTY)
    );
  }
  return EMPTY;
};
