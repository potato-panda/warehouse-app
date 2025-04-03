import {inject, Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {
  CreateQuotation,
  Quotation,
  QuotationDetail,
  QuotationRelations,
  QuotationTable,
  UpdateQuotation
} from '../interfaces/entities/quotation';
import {QuoteItem} from '../interfaces/entities/quoteItem';
import {CustomersResourceResponse} from './customers.service';
import {QuoteItemWithProductCollectionResourceResponse} from './quote-item.service';
import IdToHrefList from '../utils/id-to-href-list';
import {resourceEndpoints} from './resource-endpoints';
import {DeliveryReceipt} from '../interfaces/entities/delivery-receipt';
import {DomSanitizer} from '@angular/platform-browser';

type ResourceResponse = Resource<Quotation, 'quotation', QuotationRelations>;
type TableResourceResponse = Resource<QuotationTable, 'quotation', QuotationRelations>;
type DetailResourceResponse = Resource<QuotationDetail, 'quotation', QuotationRelations>;
type CollectionResourceResponse = CollectionResource<Quotation, 'quotation', 'quotations', QuotationRelations>;
type TableCollectionResourceResponse = CollectionResource<QuotationTable, 'quotation', 'quotations', QuotationRelations>;

export type QuoteItemsResourceResponse = Resource<QuoteItem, 'quoteItem', QuotationRelations>
export type QuoteItemsCollectionResourceResponse = CollectionResource<QuoteItem, 'quoteItem', 'quoteItems', QuotationRelations>

export type QuotationsResourceResponse = ResourceResponse;
export type QuotationsDetailResourceResponse = DetailResourceResponse;
export type QuotationsTableResourceResponse = TableResourceResponse;
export type QuotationsTableCollectionResourceResponse = TableCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class QuotationService extends RestService {

  private resourceEndpoint = resourceEndpoints.quotation;

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
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}?projection=table`, {
      params: {...pageable},
    });
  }

  getTablePageByCustomer(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint()}/search/byCustomer`, {
      params: {...pageable, name, projection: 'table'},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(this.resourceEndpoint(id));
  }

  getDetailOne(id: string | number) {
    return this.http.get<DetailResourceResponse>(`${this.resourceEndpoint(id)}?projection=detail`);
  }

  getTableOne(id: string | number) {
    return this.http.get<TableResourceResponse>(`${this.resourceEndpoint(id)}?projection=table`);
  }

  getCustomer(id: string | number) {
    return this.http.get<CustomersResourceResponse>(`${this.resourceEndpoint(id)}/customer`);
  }

  getQuoteItems(id: string | number) {
    return this.http.get<QuoteItemsCollectionResourceResponse>(`${this.resourceEndpoint(id)}/quoteItems`);
  }

  getQuoteItemsWithProduct(id: string | number) {
    return this.http.get<QuoteItemWithProductCollectionResourceResponse>(`${this.resourceEndpoint(id)}/quoteItems?projection=product`);
  }

  createOne(quotation: CreateQuotation) {
    return this.http.post<ResourceResponse>(this.resourceEndpoint(), quotation);
  }

  updateOne(quotation: UpdateQuotation) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint(quotation.id), quotation);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }

  addCustomer(id: string, customerId: string | number) {
    const hrefs = IdToHrefList.transform(customerId, resourceEndpoints.customers());
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint(id)}/customer`, hrefs, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  addQuoteItems(id: string, quoteItemId: string | number | string[] | number []) {
    const hrefs = IdToHrefList.transform(quoteItemId, resourceEndpoints.quoteItems());
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint(id)}/quotedItems`, hrefs, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  getDeliveryReceipt(id: string | number) {
    return this.http.get<DeliveryReceipt>(this.resourceEndpoint(id) + '/deliveryReceipt');
  }

  getDeliveryReceiptPayment(id: string | number) {
    return this.http.get<DeliveryReceipt>(this.resourceEndpoint(id) + '/deliveryReceipt?projection=payment');
  }

  addDeliveryReceipt(id: string, deliveryReceiptId: string | number | string[] | number []) {
    const hrefs = IdToHrefList.transform(deliveryReceiptId, resourceEndpoints.deliveryReceipts());
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint(id)}/deliveryReceipt`, hrefs, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  removeQuoteItems(id: string, quoteItemId: string | number | string[] | number []) {
    const hrefs = IdToHrefList.transform(quoteItemId, resourceEndpoints.quoteItems());
    return this.http.delete<ResourceResponse>(`${this.resourceEndpoint(id)}/quotedItems`, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      }),
      body: hrefs
    });
  }

  generatePdfUrl(id: string | number) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${this.resourceEndpoint(id)}/generate`);
  }
}
