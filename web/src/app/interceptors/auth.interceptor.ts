import {HttpEventType, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {catchError, switchMap, throwError} from 'rxjs';
import {DOCUMENT} from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const localStorage = inject(DOCUMENT).defaultView?.localStorage;
  const accessToken = authService.getAccessToken();
  if (accessToken) {
    const newReq = req.clone({
      setHeaders: {
        'Authentication': `Bearer ${accessToken}`
      }
    });

    return next(newReq).pipe(
      catchError((err, caught) => {
        if (err.type === HttpEventType.Response) {
          if (err.status == 401) {
            return authService.refreshToken().pipe(
              switchMap(response => {
                const {accessToken} = response;

                localStorage?.setItem('accessToken', accessToken);

                const refreshedTokenReq = req.clone({
                  setHeaders: {
                    'Authentication': `Bearer ${accessToken}`
                  }
                });

                return next(refreshedTokenReq);
              }),
              catchError((reAuthErr, caught1) => {
                authService.logout();
                return throwError(() => reAuthErr);
              })
            );
          }
        }
        return throwError(() => err);
      }));
  }

  return next(req);
};
