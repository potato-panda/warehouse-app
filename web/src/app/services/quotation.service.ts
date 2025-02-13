import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Quotation, QuotationRelations, QuotationTable} from '../interfaces/entities/quotation';
import {environment} from '../../environments/environment';
import {QuoteItem} from '../interfaces/entities/quoteItem';
import {CompaniesResourceResponse} from './company.service';
import {QuoteItemWithProductCollectionResourceResponse} from './quote-item.service';

type ResourceResponse = Resource<Quotation, 'quotation', QuotationRelations>;
type TableResourceResponse = Resource<QuotationTable, 'quotation', QuotationRelations>;
type CollectionResourceResponse = CollectionResource<Quotation, 'quotation', 'quotations', QuotationRelations>;
type TableCollectionResourceResponse = CollectionResource<QuotationTable, 'quotation', 'quotations', QuotationRelations>;

export type QuoteItemsResourceResponse = Resource<QuoteItem, 'quoteItem', QuotationRelations>
export type QuoteItemsCollectionResourceResponse = CollectionResource<QuoteItem, 'quoteItem', 'quoteItems', QuotationRelations>

export type QuotationsResourceResponse = ResourceResponse;
export type QuotationsTableResourceResponse = TableResourceResponse;
export type QuotationsTableCollectionResourceResponse = TableCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class QuotationService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/quotations`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}`, {
      params: {...pageable},
    });
  }

  getPageByCompany(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}/search/byCompany`, {
      params: {...pageable, name},
    });
  }

  getTablePage(pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint}?projection=table`, {
      params: {...pageable},
    });
  }

  getTablePageByCompany(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<TableCollectionResourceResponse>(`${this.resourceEndpoint}/search/byCompany`, {
      params: {...pageable, name, projection: 'table'},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  getTableOne(id: string | number) {
    return this.http.get<TableResourceResponse>(`${this.resourceEndpoint}/${id}?projection=table`);
  }

  getCompany(id: string | number) {
    return this.http.get<CompaniesResourceResponse>(`${this.resourceEndpoint}/${id}/company`);
  }

  getQuoteItems(id: string | number) {
    return this.http.get<QuoteItemsCollectionResourceResponse>(`${this.resourceEndpoint}/${id}/quoteItems`);
  }

  getQuoteItemsWithProduct(id: string | number) {
    return this.http.get<QuoteItemWithProductCollectionResourceResponse>(`${this.resourceEndpoint}/${id}/quoteItems?projection=product`);
  }

  createOne(quotation: Omit<Partial<Quotation>, 'id' | 'quotationDate' | 'totalAmount'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, quotation);
  }

  updateOne(quotation: any) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${quotation.id}`, quotation);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }

  addCompany(id: string, companyHref: string | string[]) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${id}/company`, this.cleanURL(companyHref), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  addQuoteItems(id: string, quoteItemSelfHref: string | string[]) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}/${id}/quotedItems`, this.cleanURL(quoteItemSelfHref), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  removeQuoteItems(id: string, quoteItemSelfHref: string | string[]) {
    return this.http.delete<ResourceResponse>(`${this.resourceEndpoint}/${id}/quotedItems`, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      }),
      body: this.cleanURL(quoteItemSelfHref)
    });
  }
}
