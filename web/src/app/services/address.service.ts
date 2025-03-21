import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {Address, AddressCreateRequest, AddressUpdateRequest} from '../interfaces/entities/address';
import {CollectionResource, Resource} from '../interfaces/resource';
import {resourceEndpoints} from './resource-endpoints';

type ResourceResponse = Resource<Address, 'address', {}>;
type CollectionResourceResponse = CollectionResource<Address, 'address', 'addresses', {}>

export type AddressesResourceResponse = ResourceResponse;
export type AddressesCollectionResourceResponse = CollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class AddressService extends RestService {

  private resourceEndpoint = resourceEndpoints.addresses;

  constructor(http: HttpClient) {
    super(http);
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint(id)}?projection=detail`);
  }

  createOne(address: AddressCreateRequest) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint(), address);
  }

  updateOne(address: AddressUpdateRequest) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint(address.id), address);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }

  getAddressesByCustomer(customerId: string | number) {
    return this.http.get<CollectionResourceResponse>(this.resourceEndpoint() + '/search/byCustomerId', {
      params: {
        customerId
      }
    });
  }

  findAddressesByCustomerAndName(customerId: string | number, fullAddress: string) {
    return this.http.get<CollectionResourceResponse>(this.resourceEndpoint() + '/search/byCustomerIdAndAddressName', {
      params: {
        customerId,
        fullAddress
      }
    });
  }
}
