import {ResolveFn} from '@angular/router';
import {ContactsResourceResponse} from '../../../../../services/contacts.service';
import {SuppliersResourceResponse, SuppliersService} from '../../../../../services/suppliers.service';
import {AddressesResourceResponse} from '../../../../../services/address.service';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, forkJoin, mergeMap, of} from 'rxjs';

export type ResolvedData = {
  supplier: SuppliersResourceResponse,
  addresses: AddressesResourceResponse[],
  contacts: ContactsResourceResponse[]
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const supplierService = inject(SuppliersService);
  const id = route.params['id'];
  if (id) {
    return supplierService.getOne(id)
      .pipe(
        concatMap((supplierResponse) =>
          forkJoin([supplierService.getContacts(id), supplierService.getAddresses(id)])
            .pipe(
              mergeMap(([contactsCollectionResponse, addressesCollectionResource]) => {
                return of<ResolvedData>({
                  contacts: contactsCollectionResponse._embedded.contacts,
                  supplier: supplierResponse,
                  addresses: addressesCollectionResource._embedded.addresses,
                });
              }),
              catchError(() => of<ResolvedData>({
                contacts: [],
                supplier: supplierResponse,
                addresses: [],
              })),
            )
        ),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
