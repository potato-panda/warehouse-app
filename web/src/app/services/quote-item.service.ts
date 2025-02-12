import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {CollectionResource, Resource} from '../interfaces/resource';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {QuoteItem, QuoteItemProduct, QuoteItemRelations} from '../interfaces/entities/quoteItem';

type ResourceResponse = Resource<QuoteItem, 'quoteItem', QuoteItemRelations>;
type WithProductResourceResponse = Resource<QuoteItemProduct, 'quoteItem', QuoteItemRelations>;
type CollectionResourceResponse = CollectionResource<QuoteItem, 'quoteItem', 'quoteItems', QuoteItemRelations>;
type WithProductCollectionResourceResponse = CollectionResource<QuoteItemProduct, 'quoteItem', 'quoteItems', QuoteItemRelations>;

export type QuoteItemWithProductResourceResponse = WithProductResourceResponse;
export type QuoteItemWithProductCollectionResourceResponse = WithProductCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class QuoteItemService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/quoteItems`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}`, {
      params: {...pageable},
    });
  }

  getWithProductPage(pageable: Pageable = {page: 0}) {
    return this.http.get<WithProductCollectionResourceResponse>(`${this.resourceEndpoint}?projection=product`, {
      params: {...pageable},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  getWithProductOne(id: string | number) {
    return this.http.get<WithProductResourceResponse>(`${this.resourceEndpoint}/${id}?projection=product`);
  }

  createOne(quoteItem: Omit<QuoteItem, 'id'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, quoteItem);
  }

  updateOne(quoteItem: QuoteItem) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${quoteItem.id}`, quoteItem);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
