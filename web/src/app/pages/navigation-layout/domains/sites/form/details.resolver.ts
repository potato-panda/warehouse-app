import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {catchError, concatMap, EMPTY, of} from 'rxjs';
import {SitesDetailResourceResponse, SitesService} from '../../../../../services/sites.service';

export type ResolvedData = {
  site: SitesDetailResourceResponse,
}
export const detailsResolver: ResolveFn<ResolvedData> = (route, state) => {
  const sitesService = inject(SitesService);
  const id = route.params['id'];
  if (id) {
    return sitesService.getDetailOne(id).pipe(
      concatMap((response) => {
        if (response) {
          return of({
            site: response
          });
        }
        return EMPTY;
      }),
      catchError((err, caught) => EMPTY)
    );
  }
  return EMPTY;
};
