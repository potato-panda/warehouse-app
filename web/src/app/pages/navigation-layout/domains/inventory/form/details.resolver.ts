import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, mergeMap, of} from 'rxjs';
import {InventoryService, InventoryWithProductResourceResponse} from '../../../../../services/inventory.service';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';

export type ResolvedData = {
  inventory: InventoryWithProductResourceResponse,
  product: ProductsResourceResponse | null
}

export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const inventoryService = inject(InventoryService);
  const productsService = inject(ProductsService);
  const id = route.params['id'];
  if (id) {
    return inventoryService.getOneWithProduct(id)
      .pipe(
        concatMap((inventoryResponse) => {
          const productId = inventoryResponse.product.id;
          if (productId) {
            return productsService.getOne(productId).pipe(
              mergeMap(productResponse => {
                return of({
                  inventory: inventoryResponse,
                  product: productResponse
                } as ResolvedData);
              }),
              catchError((err, caught) => of())
            );
          }
          return of({
            inventory: inventoryResponse,
            product: null
          });
        }),
        catchError(() => EMPTY)
      );
  }
  return EMPTY;
};
