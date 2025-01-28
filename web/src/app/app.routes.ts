import {Routes} from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {SuccessComponent} from './pages/authenticated/success/success.component';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  {
    path: "success", component: SuccessComponent, canActivate: [authGuard]
  },
  {
    path: "login", component: LoginComponent
  },
  {
    path: "**", redirectTo: "/login"
  },
];
