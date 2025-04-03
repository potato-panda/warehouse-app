import {inject, Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {
  DeliveryReceipt,
  DeliveryReceiptCreateRequest,
  DeliveryReceiptRelations,
  DeliveryReceiptTable
} from '../interfaces/entities/delivery-receipt';
import {resourceEndpoints} from './resource-endpoints';
import {DomSanitizer} from '@angular/platform-browser';
import IdToHrefList from '../utils/id-to-href-list';

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

  private readonly sanitizer = inject(DomSanitizer);

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

  getOneBrief(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint(id)}?projection=brief`);
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

  addSite(id: string, siteId: string | number) {
    const hrefs = IdToHrefList.transform(siteId, resourceEndpoints.sites());
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint(id)}/site`, hrefs, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  generatePdfUrl(id: string | number) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${this.resourceEndpoint(id)}/generate`);
  }
}
