import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {environment} from '../../environments/environment';
import {Contact, ContactRelations} from '../interfaces/entities/contact';
import {CollectionResource, Resource} from '../interfaces/resource';
import {RestService} from './rest.service';

type ResourceResponse = Resource<Contact, 'contact', ContactRelations>;
type CollectionResourceResponse = CollectionResource<Contact, 'contact', 'contacts', ContactRelations>

export type ContactsResourceResponse = ResourceResponse;
export type ContactsCollectionResourceResponse = CollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class ContactsService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/contacts`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}`, {
      params: {...pageable},
    });
  }

  getPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint}/search/byName`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  createOne(contact: any) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, contact);
  }

  updateOne(contact: any) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${contact.id}`, contact);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
