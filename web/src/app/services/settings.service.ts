import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {HttpClient} from '@angular/common/http';
import {resourceEndpoints} from './resource-endpoints';
import {Setting} from '../interfaces/entities/setting';
import {startWith, Subject, switchMap, tap} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SettingsService extends RestService {

  resourceEndpoint = resourceEndpoints.settings;

  update$ = new Subject<void>();

  constructor(http: HttpClient) {
    super(http);
  }

  getSettings() {
    return this.http.get<{ settings: Setting[] }>(this.resourceEndpoint());
  }

  getSettingSubject() {
    return this.update$.pipe(
      startWith(undefined),
      switchMap(() => this.getSettings())
    );
  }

  updateSetting(setting: Setting) {
    return this.http.put<Setting>(this.resourceEndpoint(setting.id), setting).pipe(
      tap(() => this.update$.next())
    );
  }

}
