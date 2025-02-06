import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Product, ProductRelations} from '../interfaces/entities/product';

type ResourceResponse = Resource<Product, 'product', ProductRelations>;
type CollectionResourceResponse = CollectionResource<Product, 'product', 'products', ProductRelations>;

export type ProductsResourceResponse = ResourceResponse;
export type ProductsCollectionResourceResponse = CollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/products`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}`, {
      params: {...pageable},
    });
  }

  getPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}/search/byName`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  createOne(product: Omit<Product, 'id'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, product);
  }

  updateOne(product: Product) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${product.id}`, product);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
