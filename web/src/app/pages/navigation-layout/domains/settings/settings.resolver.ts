import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {SettingsService} from '../../../../services/settings.service';
import {catchError, EMPTY, mergeMap, of} from 'rxjs';
import {Setting} from '../../../../interfaces/entities/setting';

export type ResolvedData = {
  settings: Setting[];
}

export const settingsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const settingsService = inject(SettingsService);
  return settingsService.getSettings().pipe(mergeMap(response => {
    return of(response);
  }), catchError(() => EMPTY));
};
