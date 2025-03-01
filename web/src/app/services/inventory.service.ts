import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Pageable} from '../interfaces/pageable';
import {RestService} from './rest.service';
import {CollectionResource, Resource} from '../interfaces/resource';
import {Inventory, InventoryDetail, InventoryRelations} from '../interfaces/entities/inventory';
import {SitesDetailResourceResponse} from './sites.service';
import IdToHrefList from '../utils/id-to-href-list';
import {resourceEndpoints} from './resource-endpoints';

type ResourceResponse = Resource<Inventory, 'inventory', InventoryRelations>;
type DetailResourceResponse = Resource<InventoryDetail, 'inventory', InventoryRelations>
type CollectionResourceResponse = CollectionResource<Inventory, 'inventory', 'inventories', InventoryRelations>;
type DetailCollectionResourceResponse = CollectionResource<InventoryDetail, 'inventory', 'inventories', InventoryRelations>

export type InventoryResourceResponse = ResourceResponse;
export type InventoryDetailResourceResponse = DetailResourceResponse;
export type InventoryCollectionResourceResponse = CollectionResourceResponse;
export type InventoryDetailCollectionResourceResponse = DetailCollectionResourceResponse;

type ResourceProjections = 'product' | null;

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends RestService {

  private resourceEndpoint = `${environment.baseApiUrl}/inventories`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPage(pageable: Pageable = {page: 0}) {
    return this.http.get<DetailCollectionResourceResponse>(`${this.resourceEndpoint}?projection=detail`, {
      params: {...pageable},
    });
  }

  getPageByProductName(name: string, pageable: Pageable = {page: 0}) {
    return this.http.get<DetailCollectionResourceResponse>(`${this.resourceEndpoint}/search/byName?projection=detail`, {
      params: {...pageable, name},
    });
  }

  getOne(id: string | number) {
    return this.http.get<ResourceResponse>(`${this.resourceEndpoint}/${id}`);
  }

  getDetailOne(id: string | number) {
    return this.http.get<DetailResourceResponse>(`${this.resourceEndpoint}/${id}?projection=detail`);
  }

  getSite(id: string | number) {
    return this.http.get<SitesDetailResourceResponse>(`${this.resourceEndpoint}/${id}/site?projection=detail`);
  }

  createOne(inventory: Omit<Inventory, 'id'>) {
    return this.http.post<ResourceResponse>(`${this.resourceEndpoint}`, inventory);
  }

  updateOne(inventory: Inventory) {
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${inventory.id}`, inventory);
  }

  addSite(id: string, siteId: string | number) {
    const hrefs = IdToHrefList.transform(siteId, resourceEndpoints.sites());
    return this.http.put<ResourceResponse>(`${this.resourceEndpoint}/${id}/site`, hrefs, {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  deleteOne(id: string | number) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}
