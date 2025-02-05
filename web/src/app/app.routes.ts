import {Routes} from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {authGuard} from './guards/auth.guard';
import {NavigationLayoutComponent} from './pages/navigation-layout/navigation-layout.component';
import {ClientsComponent} from './pages/navigation-layout/domains/clients/clients.component';
import {SettingsComponent} from './pages/navigation-layout/domains/settings/settings.component';
import {inject} from '@angular/core';
import {AuthService} from './services/auth.service';
import {DomainsComponent} from './pages/navigation-layout/domains/domains.component';
import {NewComponent as ClientNewComponent} from './pages/navigation-layout/domains/clients/new/new.component';
import {
  DetailsComponent as ClientDetailsComponent
} from './pages/navigation-layout/domains/clients/details/details.component';
import {
  detailsResolver as companyDetailsResolver
} from './pages/navigation-layout/domains/clients/details/details.resolver';
import {
  detailsResolver as contactDetailsResolver
} from './pages/navigation-layout/domains/contacts/form/details.resolver';
import {ContactsComponent} from './pages/navigation-layout/domains/contacts/contacts.component';
import {FormComponent as ContactsFormComponent} from './pages/navigation-layout/domains/contacts/form/form.component';

export const routes: Routes = [
  {
    path: '',
    component: NavigationLayoutComponent,
    canActivate: [authGuard],
    resolve: {
      username: () => {
        return inject(AuthService).getUsername();
      },
    },
    children: [
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      },
      {
        path: 'clients',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Clients'
            },
            component: ClientsComponent
          },
          {
            path: 'new',
            data: {
              breadcrumb: 'Create'
            },
            component: ClientNewComponent
          },
          {
            resolve: {
              client: companyDetailsResolver
            },
            path: ':id',
            component: ClientDetailsComponent
          }
        ]
      }, {
        path: 'contacts',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Contacts'
            },
            component: ContactsComponent
          },
          {
            path: 'create',
            component: ContactsFormComponent
          },
          {
            resolve: {
              resolved: contactDetailsResolver
            },
            path: ':id',
            component: ContactsFormComponent
          }
        ]
      },
      {
        path: 'settings',
        component: SettingsComponent
      }]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: '**', redirectTo: '/login'
  },
];
