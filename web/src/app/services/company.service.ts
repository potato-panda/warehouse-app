import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {CompanyFull, CompanyRelations, Company, CompanyWithContacts} from '../interfaces/entities/company';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Pageable} from '../interfaces/pageable';
import {RestService} from './rest.service';

type ResourceFullResponse = Resource<CompanyFull, 'company', CompanyRelations>;
type ResourceSummaryResponse = Resource<Company, 'company', CompanyRelations>;
type ResourceWithContactsResponse = Resource<CompanyWithContacts, 'company', CompanyRelations>;
type CollectionResourceResponse = CollectionResource<Company, 'company', 'companies', CompanyRelations>;

export type CompaniesResourceResponse = ResourceFullResponse;
export type CompaniesSummaryResourceResponse = ResourceSummaryResponse;
export type CompaniesWithContactsResourceResponse = ResourceWithContactsResponse;
export type CompaniesCollectionResourceResponse = CollectionResourceResponse;

type ResourceProjections = 'summary' | 'contacts' | null;

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/companies`;

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

  getOne<T extends ResourceProjections>(id: string | number, projection?: T) {
    return this.http.get<T extends 'summary' ? ResourceSummaryResponse
      : T extends 'contacts' ? ResourceWithContactsResponse
        : ResourceFullResponse
    >(`${this.resourceEndpoint}/${id}`, {
      ...(projection && {params: {projection}})
    });
  }

  createOne(company: any) {
    return this.http.post<ResourceFullResponse>(`${this.resourceEndpoint}`, company);
  }

  updateOne(company: any) {
    return this.http.put<ResourceFullResponse>(`${this.resourceEndpoint}/${company.id}`, company);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }


}
