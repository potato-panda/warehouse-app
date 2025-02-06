import {Routes} from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {authGuard} from './guards/auth.guard';
import {NavigationLayoutComponent} from './pages/navigation-layout/navigation-layout.component';
import {CustomersComponent} from './pages/navigation-layout/domains/customers/customers.component';
import {SettingsComponent} from './pages/navigation-layout/domains/settings/settings.component';
import {inject} from '@angular/core';
import {AuthService} from './services/auth.service';
import {DomainsComponent} from './pages/navigation-layout/domains/domains.component';
import {
  detailsResolver as companyDetailsResolver
} from './pages/navigation-layout/domains/customers/form/details.resolver';
import {
  detailsResolver as contactDetailsResolver,
} from './pages/navigation-layout/domains/contacts/form/details.resolver';
import {
  detailsResolver as productDetailsResolver
} from './pages/navigation-layout/domains/products/form/details.resolver';
import {ContactsComponent} from './pages/navigation-layout/domains/contacts/contacts.component';
import {FormComponent as ContactsFormComponent} from './pages/navigation-layout/domains/contacts/form/form.component';
import {FormComponent as CustomerFormComponent} from './pages/navigation-layout/domains/customers/form/form.component';
import {FormComponent as ProductsFormComponent} from './pages/navigation-layout/domains/products/form/form.component';
import {ProductsComponent} from './pages/navigation-layout/domains/products/products.component';

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
        redirectTo: 'customers',
        pathMatch: 'full'
      },
      {
        path: 'customers',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Customers'
            },
            component: CustomersComponent
          },
          {
            path: 'create',
            data: {
              breadcrumb: 'Create'
            },
            component: CustomerFormComponent
          },
          {
            resolve: {
              resolved: companyDetailsResolver
            },
            path: ':id',
            component: CustomerFormComponent
          }
        ]
      },
      {
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
        path: 'products',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Products'
            },
            component: ProductsComponent
          },
          {
            path: 'create',
            component: ProductsFormComponent
          },
          {
            resolve: {
              resolved: productDetailsResolver
            },
            path: ':id',
            component: ProductsFormComponent
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
