import {Injectable} from '@angular/core';
import {resourceEndpoints} from './resource-endpoints';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Site, SiteDetail} from '../interfaces/entities/site';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {RestService} from './rest.service';
import {Pageable} from '../interfaces/pageable';
import IdToHrefList from '../utils/id-to-href-list';

type ResourceResponse = Resource<Site, 'site', {}>;
type DetailResourceResponse = Resource<SiteDetail, 'site', {}>;
type CollectionResourceResponse = CollectionResource<Site, 'site', 'sites', {}>
type DetailCollectionResourceResponse = CollectionResource<SiteDetail, 'site', 'sites', {}>

export type SitesResourceResponse = ResourceResponse;
export type SitesDetailResourceResponse = DetailResourceResponse;
export type SitesCollectionResourceResponse = CollectionResourceResponse;
export type SitesDetailCollectionResourceResponse = DetailCollectionResourceResponse;

@Injectable({
  providedIn: 'root'
})
export class SitesService extends RestService {

  private resourceEndpoint = resourceEndpoints.sites;

  constructor(http: HttpClient) {
    super(http);
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint(id)}`);
  }

  getDetailOne(id: string | number) {
    return this.http.get<DetailResourceResponse>(`${this.resourceEndpoint(id)}?projection=detail`);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}`, {
      params: {...pageable},
    });
  }

  getDetailPage(pageable: Pageable = {page: 0}) {
    return this.http.get<DetailCollectionResourceResponse>(`${this.resourceEndpoint()}?projection=detail`, {
      params: {...pageable},
    });
  }

  getDetailPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<DetailCollectionResourceResponse>(`${this.resourceEndpoint()}/search/byName?projection=detail`, {
      params: {...pageable, name},
    });
  }

  getPageByName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<CollectionResourceResponse>(`${this.resourceEndpoint()}/search/byName`, {
      params: {...pageable, name},
    });
  }

  createOne(site: any) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint()}`, site);
  }

  updateOne(site: any) {
    return this.http.put<ResourceResponse>(this.resourceEndpoint(site.id), site);
  }

  deleteOne(id: string | number) {
    return this.http.delete(this.resourceEndpoint(id));
  }

  addAddress(id: string | number, addressId: string | number | string[] | number []) {
    return this.http.put<void>(`${this.resourceEndpoint(id)}/address`,
      IdToHrefList.transform(addressId, resourceEndpoints.addresses()), {
        headers: new HttpHeaders({
          'Content-Type': 'text/uri-list',
        })
      });
  }

}
