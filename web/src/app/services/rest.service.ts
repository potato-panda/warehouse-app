import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class RestService {

  protected constructor(protected http: HttpClient) {
  }

  /**
   * Creates a relationship between two entities
   * @param propertyUrl This is the url of the property that represents an entity or collection of entities
   * @param relationUrl This is the url of the entity to associate with
   * @returns {Observable<Object>}
   */
  createRelation(propertyUrl: string, relationUrl: string): Observable<object> {
    return this.http.post(this.cleanURL(propertyUrl), this.cleanURL(relationUrl), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  /**
   * Updates a relationship between two entities
   * @param propertyUrl This is the url of the property that represents an entity or collection of entities
   * @param relationUrl This is the url of the entity to associate with
   * @returns {Observable<Object>}
   */
  updateRelation(propertyUrl: string, relationUrl: string | string []): Observable<object> {
    return this.http.put(this.cleanURL(propertyUrl), this.cleanURL(relationUrl), {
      headers: new HttpHeaders({
        'Content-Type': 'text/uri-list',
      })
    });
  }

  private cleanURL(url: string | string []): string {
    if (typeof url === 'string') {
      return url.replace(/{.*?}/g, '');
    } else if (Array.isArray(url)) {
      return url.map(s => s.replace(/{.*?}/g, '')).join('\n');
    }
    return url;
  }
}
