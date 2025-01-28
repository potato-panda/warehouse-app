import {CanActivateFn, createUrlTreeFromSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated.value) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ["/", "/login"]);
};
