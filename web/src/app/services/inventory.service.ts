import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {RestService} from './rest.service';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Inventory, InventoryProduct, InventoryRelations} from '../interfaces/entities/inventory';

type ResourceResponse = Resource<Inventory, 'inventory', InventoryRelations>;
type WithProductResourceResponse = Resource<InventoryProduct, 'inventory', InventoryRelations>
type CollectionResourceResponse = CollectionResource<Inventory, 'inventory', 'inventories', InventoryRelations>;
type WithProductCollectionResourceResponse = CollectionResource<InventoryProduct, 'inventory', 'inventories', InventoryRelations>

export type InventoryResourceResponse = ResourceResponse;
export type InventoryWithProductResourceResponse = WithProductResourceResponse;
export type InventoryCollectionResourceResponse = CollectionResourceResponse;
export type InventoryWithProductCollectionResourceResponse = WithProductCollectionResourceResponse;

type ResourceProjections = 'product' | null;

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/inventories`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<WithProductCollectionResourceResponse>(`${this.resourceEndpoint}?projection=product`, {
      params: {...pageable},
    });
  }

  getPageByProductName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<WithProductCollectionResourceResponse>(`${this.resourceEndpoint}/search/byName?projection=product`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  getOneWithProduct(id: string | number) {
    return this.http.get<WithProductResourceResponse>(`${this.resourceEndpoint}/${id}?projection=product`);
  }

  createOne(inventory: Omit<Inventory, 'id'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, inventory);
  }

  updateOne(inventory: Inventory) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${inventory.id}`, inventory);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
