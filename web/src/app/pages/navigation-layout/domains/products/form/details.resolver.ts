import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, of} from 'rxjs';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';

export type ResolvedData = ProductsResourceResponse;

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const productsService = inject(ProductsService);
  const id = route.params['id'];
  if (id) {
    return productsService.getOne(id)
      .pipe(
        concatMap((productResponse) => {
          return of(productResponse);
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
