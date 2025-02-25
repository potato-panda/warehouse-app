import {ResolveFn} from '@angular/router';
import {QuotationService, QuotationsTableResourceResponse} from '../../../../../services/quotation.service';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, forkJoin, of} from 'rxjs';
import {CustomersSummaryResourceResponse} from '../../../../../services/customers.service';

export type ResolvedData = {
  quotation: QuotationsTableResourceResponse,
  customer: CustomersSummaryResourceResponse | null
};

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const quotationsService = inject(QuotationService);
  const id = route.params['id'];
  if (id) {
    return forkJoin([quotationsService.getTableOne(id), quotationsService.getCustomer(id)])
      .pipe(
        concatMap(([quotation, customer]) => {
          return of({quotation, customer});
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
