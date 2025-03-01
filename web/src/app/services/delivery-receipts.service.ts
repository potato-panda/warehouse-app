import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {
  DeliveryReceipt,
  DeliveryReceiptCreateRequest,
  DeliveryReceiptRelations,
  DeliveryReceiptTable
} from '../interfaces/entities/delivery-receipt';
import {resourceEndpoints} from './resource-endpoints';

type ResourceResponse = Resource<DeliveryReceipt, 'deliveryReceipt', DeliveryReceiptRelations>;
type TableResourceResponse = Resource<DeliveryReceiptTable, 'deliveryReceipt', DeliveryReceiptRelations>;
type CollectionResourceResponse = CollectionResource<DeliveryReceipt, 'deliveryReceipt', 'deliveryReceipts', DeliveryReceiptRelations>;
type TableCollectionResourceResponse = CollectionResource<DeliveryReceiptTable, 'deliveryReceipt', 'deliveryReceipts', DeliveryReceiptRelations>;

export type DeliveryReceiptsResourceResponse = ResourceResponse;
export type DeliveryReceiptsTableResourceResponse = TableResourceResponse;
export type DeliveryReceiptsTableCollectionResourceResponse = TableCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class DeliveryReceiptsService extends RestService {

  private resourceEndpoint = resourceEndpoints.deliveryReceipts;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(this.resourceEndpoint(), {
      params: {...pageable},
    });
  }

  getPageByCustomer(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}/search/byCustomer`, {
      params: {...pageable, name},
    });
  }

  getTablePage(pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}?projection=withQuotation`, {
      params: {...pageable},
    });
  }

  getTablePageByCustomer(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}/search/byCustomer?projection=withQuotation`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(this.resourceEndpoint(id));
  }

  getTableOne(id: string | number) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint(id)}?projection=withQuotation`);
  }

  createOne(receipt: DeliveryReceiptCreateRequest) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint(), receipt);
  }

  updateOne(receipt: DeliveryReceipt) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint(receipt.id), receipt);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }
}
