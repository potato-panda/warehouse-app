import {ResolveFn} from '@angular/router';
import {ContactsResourceResponse, ContactsService,} from '../../../../../services/contacts.service';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, of} from 'rxjs';

export type ResolvedData = {
  contact: ContactsResourceResponse,
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const contactsService = inject(ContactsService);
  const id = route.params['id'];
  if (id) {
    return contactsService.getOne(id).pipe(
      concatMap((contactResponse) => {
        if (contactResponse) {
          return of({
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
