import {ResolveFn} from '@angular/router';
import {QuotationService, QuotationsTableResourceResponse} from '../../../../../services/quotation.service';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, forkJoin, of} from 'rxjs';
import {CompaniesSummaryResourceResponse} from '../../../../../services/company.service';

export type ResolvedData = {
  quotation: QuotationsTableResourceResponse,
  company: CompaniesSummaryResourceResponse | null
};

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const quotationsService = inject(QuotationService);
  const id = route.params['id'];
  if (id) {
    return forkJoin([quotationsService.getTableOne(id), quotationsService.getCompany(id)])
      .pipe(
        concatMap(([quotation, company]) => {
          return of({quotation, company});
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
