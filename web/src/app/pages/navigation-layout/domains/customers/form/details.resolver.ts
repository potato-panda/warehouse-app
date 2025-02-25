import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {CustomersService, CustomersSummaryResourceResponse} from '../../../../../services/customers.service';
import {catchError, concatMap, EMPTY, forkJoin, mergeMap, of} from 'rxjs';
import {ContactsResourceResponse} from '../../../../../services/contacts.service';
import {AddressesResourceResponse} from '../../../../../services/address.service';

export type ResolvedData = {
  contacts: ContactsResourceResponse[],
  customer: CustomersSummaryResourceResponse,
  shippingAddresses: AddressesResourceResponse[],
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const customerService = inject(CustomersService);
  const id = route.params['id'];
  if (id) {
    return customerService.getOne(id)
      .pipe(
        concatMap((customerResponse) =>
          forkJoin([customerService.getContacts(id), customerService.getShippingAddresses(id)])
            .pipe(
              mergeMap(([contactsCollectionResponse, shippingAddressesCollectionResource]) => {
                return of<ResolvedData>({
                  contacts: contactsCollectionResponse._embedded.contacts,
                  customer: customerResponse,
                  shippingAddresses: shippingAddressesCollectionResource._embedded.addresses,
                });
              }),
              catchError(() => of<ResolvedData>({
                contacts: [],
                customer: customerResponse,
                shippingAddresses: [],
              })),
            )
        ),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
