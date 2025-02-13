import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import CleanUrl from '../utils/clean-url';

@Injectable({
  providedIn: 'root',
})
export abstract class RestService {

  protected constructor(protected http: HttpClient) {
  }

  follow<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  /**
   * USE WITH COLLECTION PROPERTIES
   *
   * Creates a relationship between two entities
   * @param propertyUrl This is the url of the property that represents an entity or collection of entities
   * @param referenceUrl This is the url of the entity to associate with
   * @returns {Observable<Object>}
   */
  createRelation(propertyUrl: string, referenceUrl: string | string []): Observable<object> {
    return this.http.post(this.cleanURL(propertyUrl), this.cleanURL(referenceUrl), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  /**
   * Updates a relationship between two entities
   * @param propertyUrl This is the url of the property that represents an entity or collection of entities
   * @param referenceUrl This is the url of the entity to associate with
   * @returns {Observable<Object>}
   */
  updateRelation(propertyUrl: string, referenceUrl: string | string []): Observable<object> {
    return this.http.put(this.cleanURL(propertyUrl), this.cleanURL(referenceUrl), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  /**
   * Deletes a relationship between two entities
   * @param propertyUrl This is the url of the property that represents an entity or collection of entities
   * @param referenceUrl This is the url of the entity to dissociate
   * @returns {Observable<Object>}
   */
  deleteRelation(propertyUrl: string, referenceUrl: string | string []): Observable<object> {
    return this.http.delete(this.cleanURL(propertyUrl), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      }),
      body: this.cleanURL(referenceUrl),
    });
  }

  protected cleanURL = (url: string | string []) => CleanUrl.transform(url);

}
