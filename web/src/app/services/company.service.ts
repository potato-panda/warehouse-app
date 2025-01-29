import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Company} from '../interfaces/entities/company';
import {Resource, ResourceCollection} from '../interfaces/resource';
import {Pageable} from '../interfaces/pageable';

export type ResourceResponse = Resource<Company, 'company'>;
export type PageableResourceResponse = ResourceCollection<Company, 'company', 'companies'>;

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) {
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<PageableResourceResponse>(`${environment.baseApiUrl}/companies`, {
      params: {...pageable},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${environment.baseApiUrl}/companies/${id}`);
  }

  createOne(company: any) {
    return this.http.post(`${environment.baseApiUrl}/companies`, company);
  }

  updateOne(company: any) {
    return this.http.put(`${environment.baseApiUrl}/companies/${company.id}`, company);
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${environment.baseApiUrl}/companies/${id}`);
  }


}
