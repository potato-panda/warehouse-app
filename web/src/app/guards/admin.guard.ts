import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService)
  if (auth.isAuthenticated.value && auth.isAdmin()) {
    return true;
  }
  inject(Router).navigate(["/login"]).then();
  return false;
};
