import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Company, CompanyRelations, CompanySummary, CompanyWithContacts} from '../interfaces/entities/company';
import {Resource, ResourceCollection} from '../interfaces/resource';
import {Pageable} from '../interfaces/pageable';
import {RestService} from './rest.service';

export type ResourceFullResponse = Resource<Company, 'company', CompanyRelations>;
export type ResourceSummaryResponse = Resource<CompanySummary, 'company', CompanyRelations>;
export type ResourceWithContactsResponse = Resource<CompanyWithContacts, 'company', CompanyRelations>;
export type ResourceCollectionResponse = ResourceCollection<CompanySummary, 'company', 'companies', CompanyRelations>;

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
    return this.http.get<ResourceCollectionResponse>(`${this.resourceEndpoint}`, {
      params: {...pageable},
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
