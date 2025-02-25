import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {CreateReceipt, Receipt, ReceiptRelations, ReceiptTable} from '../interfaces/entities/receipt';
import {resourceEndpoints} from './resource-endpoints';

type ResourceResponse = Resource<Receipt, 'receipt', ReceiptRelations>;
type TableResourceResponse = Resource<ReceiptTable, 'receipt', ReceiptRelations>;
type CollectionResourceResponse = CollectionResource<Receipt, 'receipt', 'receipts', ReceiptRelations>;
type TableCollectionResourceResponse = CollectionResource<ReceiptTable, 'receipt', 'receipts', ReceiptRelations>;

export type ReceiptsResourceResponse = ResourceResponse;
export type ReceiptsTableResourceResponse = TableResourceResponse;
export type ReceiptsTableCollectionResourceResponse = TableCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService extends RestService {

  private resourceEndpoint = resourceEndpoints.receipts;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}`, {
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
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}/search/byCustomer`, {
      params: {...pageable, name, projection: 'withQuotation'},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(this.resourceEndpoint(id));
  }

  getTableOne(id: string | number) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint(id)}?projection=withQuotation`);
  }

  createOne(receipt: CreateReceipt) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint(), receipt);
  }

  updateOne(receipt: Receipt) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint()}/${receipt.id}`, receipt);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }
}
