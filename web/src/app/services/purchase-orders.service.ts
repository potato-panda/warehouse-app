import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {
  CreatePurchaseOrder,
  PurchaseOrder,
  PurchaseOrderDetail,
  PurchaseOrderTable,
  UpdatePurchaseOrder
} from '../interfaces/entities/purchase-order';
import {QuoteItemWithProductCollectionResourceResponse} from './quote-item.service';
import IdToHrefList from '../utils/id-to-href-list';
import {resourceEndpoints} from './resource-endpoints';

type ResourceResponse = Resource<PurchaseOrder, 'purchaseOrder'>;
type TableResourceResponse = Resource<PurchaseOrderTable, 'purchaseOrder'>;
type DetailResourceResponse = Resource<PurchaseOrderDetail, 'purchaseOrder'>;
type CollectionResourceResponse = CollectionResource<PurchaseOrder, 'purchaseOrder', 'purchaseOrders'>;
type TableCollectionResourceResponse = CollectionResource<PurchaseOrderTable, 'purchaseOrder', 'purchaseOrders'>;

export type PurchaseOrdersResourceResponse = ResourceResponse;
export type PurchaseOrdersTableResourceResponse = TableResourceResponse;
export type PurchaseOrdersDetailResourceResponse = DetailResourceResponse;
export type PurchaseOrdersCollectionResourceResponse = CollectionResourceResponse;
export type PurchaseOrdersTableCollectionResourceResponse = TableCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService extends RestService {

  private resourceEndpoint = resourceEndpoints.purchaseOrders;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}`, {
      params: {...pageable},
    });
  }

  getPageTable(pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}?projection=detail`, {
      params: {...pageable},
    });
  }

  getPageTableBySupplier(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}/search/bySupplier?projection=detail`, {
      params: {...pageable, name},
    });
  }

  getPageTableByApprover(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}/search/byApprover?projection=detail`, {
      params: {...pageable, name},
    });
  }

  getQuoteItemsWithProduct(id: string | number) {
    return this.http.get<QuoteItemWithProductCollectionResourceResponse>(`${this.resourceEndpoint(id)}/quoteItems?projection=product`);
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint(id)}`);
  }

  getOneDetail(id: string | number) {
    return this.http.get<DetailResourceResponse>(`${this.resourceEndpoint(id)}?projection=detail`);
  }

  createOne(purchaseOrder: CreatePurchaseOrder) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint()}`, purchaseOrder);
  }

  updateOne(purchaseOrder: UpdatePurchaseOrder) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint(purchaseOrder.id)}`, purchaseOrder);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint(id)}`);
  }

  addSupplier(id: string, supplierId: string | number | string[] | number []) {
    return this.http.put<void>(`${this.resourceEndpoint(id)}/supplier`,
      IdToHrefList.transform(supplierId, resourceEndpoints.suppliers()), {
        headers: new HttpHeaders({
          'Content-Type': 'text/uri-list',
        })
      });
  }

  addQuoteItems(id: string, quoteItemId: string | number | string[] | number []) {
    return this.http.post<void>(`${this.resourceEndpoint}/${id}/quotedItems`,
      IdToHrefList.transform(quoteItemId, resourceEndpoints.quoteItems()), {
        headers: new HttpHeaders({
          'Content-Type': 'text/uri-list',
        })
      });
  }

  removeQuoteItems(id: string, quoteItemId: string | number | string[] | number []) {
    return this.http.delete<void>(`${this.resourceEndpoint}/${id}/quotedItems`, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      }),
      body: IdToHrefList.transform(quoteItemId, resourceEndpoints.quoteItems())
    });
  }
}
