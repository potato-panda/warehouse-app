import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  Customer,
  CustomerCreateOneRequest,
  CustomerCreateRequest,
  CustomerFull,
  CustomerRelations,
  CustomerUpdateOneRequest,
  CustomerUpdateRequest,
  CustomerWithContacts
} from '../interfaces/entities/customer';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Pageable} from '../interfaces/pageable';
import {RestService} from './rest.service';
import {resourceEndpoints} from './resource-endpoints';
import {ContactsCollectionResourceResponse} from './contacts.service';
import {AddressesCollectionResourceResponse} from './address.service';

type ResourceFullResponse = Resource<CustomerFull, 'customer', CustomerRelations>;
type ResourceSummaryResponse = Resource<Customer, 'customer', CustomerRelations>;
type ResourceWithContactsResponse = Resource<CustomerWithContacts, 'customer', CustomerRelations>;
type CollectionResourceResponse = CollectionResource<Customer, 'customer', 'customers', CustomerRelations>;

export type CustomersResourceResponse = ResourceFullResponse;
export type CustomersSummaryResourceResponse = ResourceSummaryResponse;
export type CustomersWithContactsResourceResponse = ResourceWithContactsResponse;
export type CustomersCollectionResourceResponse = CollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class CustomersService extends RestService {

  private resourceEndpoint = resourceEndpoints.customers;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(this.resourceEndpoint(), {params: {...pageable},});
  }

  getPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(this.resourceEndpoint() + '/search/byName', {
      params: {...pageable, name},
    });
  }

  getSummaryOne(id: string | number) {
    return this.http.get<ResourceSummaryResponse>(this.resourceEndpoint(id), {params: {projection: 'summary'}});
  }

  getContactsOne(id: string | number) {
    return this.http.get<ResourceWithContactsResponse>(this.resourceEndpoint(id), {params: {projection: 'contacts'}});
  }

  getOne(id: string | number) {
    return this.http.get<ResourceFullResponse>(this.resourceEndpoint(id));
  }

  getContacts(id: string | number, pageable: Pageable = {page: 0}) {
    return this.http.get<ContactsCollectionResourceResponse>(this.resourceEndpoint(id) + '/contacts', {
      params: {
        ...pageable,
        size: 100
      }
    });
  }

  getShippingAddresses(id: string | number, pageable: Pageable = {page: 0}) {
    return this.http.get<AddressesCollectionResourceResponse>(this.resourceEndpoint(id) + '/shippingAddresses', {
      params: {
        ...pageable,
        size: 100
      }
    });
  }

  createOne(customer: CustomerCreateOneRequest) {
    return this.http.post<ResourceFullResponse>(this.resourceEndpoint(), customer);
  }

  updateOne(customer: CustomerUpdateOneRequest) {
    return this.http.put<ResourceFullResponse>(this.resourceEndpoint(customer.id), customer);
  }

  create(customer: CustomerCreateRequest) {
    return this.http.post<ResourceFullResponse>(this.resourceEndpoint() + '/create', customer);
  }

  update(customer: CustomerUpdateRequest) {
    return this.http.put<ResourceFullResponse>(this.resourceEndpoint() + '/update', customer);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }

}
