import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Quotation, QuotationRelations, QuotationTable} from '../interfaces/entities/quotation';
import {environment} from '../../environments/environment';
import {QuoteItem} from '../interfaces/entities/quoteItem';
import {CompaniesResourceResponse} from './company.service';

type ResourceResponse = Resource<Quotation, 'quotation', QuotationRelations>;
type TableResourceResponse = Resource<QuotationTable, 'quotation', QuotationRelations>;
type CollectionResourceResponse = CollectionResource<Quotation, 'quotation', 'quotations', QuotationRelations>;
type TableCollectionResourceResponse = CollectionResource<QuotationTable, 'quotation', 'quotations', QuotationRelations>;

export type QuoteItemsResourceResponse = Resource<QuoteItem, 'quoteItem', QuotationRelations>
export type QuoteItemsCollectionResourceResponse = CollectionResource<QuoteItem, 'quoteItem', 'quoteItems', QuotationRelations>

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
    return this.http.get<TableResourceResponse>(`${this.resourceEndpoint}/${id}/quoteItems`);
  }

  createOne(quotation: Omit<Quotation, 'id'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, quotation);
  }

  updateOne(quotation: Quotation) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${quotation.id}`, quotation);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
