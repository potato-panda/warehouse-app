import {ResolveFn} from '@angular/router';
import {
  PurchaseOrdersDetailResourceResponse,
  PurchaseOrdersService
} from '../../../../../services/purchase-orders.service';
import {inject} from '@angular/core';
import {catchError, EMPTY, mergeMap, of} from 'rxjs';

export type ResolvedData = {
  purchaseOrder: PurchaseOrdersDetailResourceResponse,
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const purchaseOrdersService = inject(PurchaseOrdersService);
  const id = route.params['id'];
  if (id) {
    return purchaseOrdersService.getOneDetail(id).pipe(
      mergeMap(response => of({purchaseOrder: response})),
      catchError(() => EMPTY)
    );
  }
  return EMPTY;
};
