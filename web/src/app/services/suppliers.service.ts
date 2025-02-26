import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {resourceEndpoints} from './resource-endpoints';
import {CollectionResource, Resource} from '../interfaces/resource';
import {
  Supplier,
  SupplierCreateRequest,
  SupplierDetail,
  SupplierRelations,
  SupplierUpdateRequest
} from '../interfaces/entities/supplier';
import {ContactsCollectionResourceResponse} from './contacts.service';
import {AddressesCollectionResourceResponse} from './address.service';

type ResourceResponse = Resource<Supplier, 'supplier', SupplierRelations>;
type DetailResourceResponse = Resource<SupplierDetail, 'supplier', SupplierRelations>;
type CollectionResourceResponse = CollectionResource<Supplier, 'supplier', 'suppliers', SupplierRelations>;

export type SuppliersResourceResponse = ResourceResponse;
export type SuppliersCollectionResourceResponse = CollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class SuppliersService extends RestService {

  protected resourceEndpoint = resourceEndpoints.suppliers;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}`, {
      params: {...pageable},
    });
  }

  getPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}/search/byName`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(this.resourceEndpoint(id));
  }

  getDetailOne(id: string | number) {
    return this.http.get<DetailResourceResponse>(this.resourceEndpoint(id), {params: {projection: 'detail'}});
  }

  getContacts(id: string | number, pageable: Pageable = {page: 0}) {
    return this.http.get<ContactsCollectionResourceResponse>(this.resourceEndpoint(id) + '/contacts', {
      params: {
        ...pageable,
        size: 100
      }
    });
  }

  getAddresses(id: string | number, pageable: Pageable = {page: 0}) {
    return this.http.get<AddressesCollectionResourceResponse>(this.resourceEndpoint(id) + '/addresses', {
      params: {
        ...pageable,
        size: 100
      }
    });
  }

  createOne(supplier: any) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint(), supplier);
  }

  updateOne(supplier: any) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint(supplier.id), supplier);
  }

  create(supplier: SupplierCreateRequest) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint() + '/create', supplier);
  }

  update(supplier: SupplierUpdateRequest) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint() + '/update', supplier);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }

}
