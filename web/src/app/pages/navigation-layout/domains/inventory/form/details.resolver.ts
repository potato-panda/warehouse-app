import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, forkJoin, mergeMap, of} from 'rxjs';
import {InventoryDetailResourceResponse, InventoryService} from '../../../../../services/inventory.service';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';
import {SitesDetailResourceResponse} from '../../../../../services/sites.service';

export type ResolvedData = {
  inventory: InventoryDetailResourceResponse,
  site: SitesDetailResourceResponse | null,
  product: ProductsResourceResponse | null
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const inventoryService = inject(InventoryService);
  const productsService = inject(ProductsService);
  const id = route.params['id'];
  if (id) {
    return inventoryService.getDetailOne(id)
      .pipe(
        concatMap((inventoryResponse) => {
          const productId = inventoryResponse.product.id;
          if (productId) {
            return forkJoin([
              productsService.getOne(productId).pipe(catchError(err => of(null))),
              inventoryService.getSite(productId).pipe(catchError(err => of(null)))
            ]).pipe(
              mergeMap(([productResponse, siteResponse]) => {
                return of({
                  inventory: inventoryResponse,
                  product: productResponse,
                  site: siteResponse
                } as ResolvedData);
              }),
              catchError((err, caught) => of())
            );
          }
          return of({
            inventory: inventoryResponse,
            site: null,
            product: null
          });
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
