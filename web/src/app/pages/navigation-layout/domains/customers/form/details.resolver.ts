import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {CompaniesSummaryResourceResponse, CompanyService} from '../../../../../services/company.service';
import {catchError, concatMap, EMPTY, mergeMap, of} from 'rxjs';
import {ContactsCollectionResourceResponse, ContactsResourceResponse} from '../../../../../services/contacts.service';

export type ResolvedData = {
  contact: ContactsResourceResponse | null,
  company: CompaniesSummaryResourceResponse
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const companyService = inject(CompanyService);
  const id = route.params['id'];
  if (id) {
    return companyService.getOne(id)
      .pipe(
        concatMap((companyResponse) => {
          const contactsUrl = companyResponse._links.contacts.href;

          return companyService.follow<ContactsCollectionResourceResponse>(contactsUrl)
            .pipe(
              mergeMap((contactsCollectionResponse) => {
                if (contactsCollectionResponse && contactsCollectionResponse?._embedded?.contacts?.length > 0) {
                  return of<ResolvedData>({
                    company: companyResponse,
                    contact: contactsCollectionResponse._embedded.contacts[0]
                  });
                }
                throw new Error();
              }),
              catchError(() => of<ResolvedData>({
                company: companyResponse,
                contact: null
              })),
            );
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
