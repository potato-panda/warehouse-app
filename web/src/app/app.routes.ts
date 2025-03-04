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
  detailsResolver as customerDetailsResolver
} from './pages/navigation-layout/domains/customers/form/details.resolver';
import {
  detailsResolver as contactDetailsResolver,
} from './pages/navigation-layout/domains/contacts/form/details.resolver';
import {
  detailsResolver as productDetailsResolver
} from './pages/navigation-layout/domains/products/form/details.resolver';
import {
  detailsResolver as inventoryDetailsResolver
} from './pages/navigation-layout/domains/inventory/form/details.resolver';
import {
  detailsResolver as quotationDetailsResolver
} from './pages/navigation-layout/domains/quotations/form/details.resolver';
import {
  detailsResolver as purchaseOrderDetailsResolver
} from './pages/navigation-layout/domains/purchase-orders/form/details.resolver';
import {
  detailsResolver as supplierDetailsResolver
} from './pages/navigation-layout/domains/suppliers/form/details.resolver';
import {settingsResolver} from './pages/navigation-layout/domains/settings/settings.resolver';
import {detailsResolver as siteDetailsResolver} from './pages/navigation-layout/domains/sites/form/details.resolver';
import {ContactsComponent} from './pages/navigation-layout/domains/contacts/contacts.component';
import {FormComponent as ContactsFormComponent} from './pages/navigation-layout/domains/contacts/form/form.component';
import {FormComponent as CustomerFormComponent} from './pages/navigation-layout/domains/customers/form/form.component';
import {FormComponent as ProductsFormComponent} from './pages/navigation-layout/domains/products/form/form.component';
import {FormComponent as InventoryFormComponent} from './pages/navigation-layout/domains/inventory/form/form.component';
import {FormComponent as SupplierFormComponent} from './pages/navigation-layout/domains/suppliers/form/form.component';
import {FormComponent as SiteFormComponent} from './pages/navigation-layout/domains/sites/form/form.component';
import {
  FormComponent as QuotationFormComponent
} from './pages/navigation-layout/domains/quotations/form/form.component';
import {
  FormComponent as PurchaseOrderFormComponent
} from './pages/navigation-layout/domains/purchase-orders/form/form.component';
import {ProductsComponent} from './pages/navigation-layout/domains/products/products.component';
import {InventoryComponent} from './pages/navigation-layout/domains/inventory/inventory.component';
import {QuotationComponent} from './pages/navigation-layout/domains/quotations/quotation.component';
import {PurchaseOrdersComponent} from './pages/navigation-layout/domains/purchase-orders/purchase-orders.component';
import {
  DeliveryReceiptsComponent
} from './pages/navigation-layout/domains/delivery-receipts/delivery-receipts.component';
import {SuppliersComponent} from './pages/navigation-layout/domains/suppliers/suppliers.component';
import {SitesComponent} from './pages/navigation-layout/domains/sites/sites.component';

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
              resolved: customerDetailsResolver
            },
            path: ':id',
            component: CustomerFormComponent
          }
        ]
      },
      {
        path: 'suppliers',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Suppliers'
            },
            component: SuppliersComponent
          },
          {
            path: 'create',
            data: {
              breadcrumb: 'Create'
            },
            component: SupplierFormComponent
          },
          {
            resolve: {
              resolved: supplierDetailsResolver
            },
            path: ':id',
            component: SupplierFormComponent
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
          // {
          //   path: 'create',
          //   component: ContactsFormComponent
          // },
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
        path: 'inventories',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Inventories'
            },
            component: InventoryComponent
          },
          {
            path: 'create',
            component: InventoryFormComponent
          },
          {
            resolve: {
              resolved: inventoryDetailsResolver
            },
            path: ':id',
            component: InventoryFormComponent
          }
        ]
      },
      {
        path: 'quotations',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Quotations'
            },
            component: QuotationComponent
          },
          {
            path: 'create',
            component: QuotationFormComponent
          },
          {
            resolve: {
              resolved: quotationDetailsResolver
            },
            path: ':id',
            component: QuotationFormComponent
          }
        ]
      },
      {

        path: 'purchaseOrders',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Purchase Orders'
            },
            component: PurchaseOrdersComponent
          },
          {
            path: 'create',
            component: PurchaseOrderFormComponent
          },
          {
            resolve: {
              resolved: purchaseOrderDetailsResolver
            },
            path: ':id',
            component: PurchaseOrderFormComponent
          }
        ]
      },
      {
        path: 'deliveryReceipts',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Delivery Receipts'
            },
            component: DeliveryReceiptsComponent
          },
        ]
      }, {

        path: 'sites',
        component: DomainsComponent,
        children: [
          {
            path: '',
            data: {
              breadcrumb: 'Sites'
            },
            component: SitesComponent
          },
          {
            path: 'create',
            component: SiteFormComponent
          },
          {
            resolve: {
              resolved: siteDetailsResolver
            },
            path: ':id',
            component: SiteFormComponent
          }
        ]
      },
      {
        path: 'settings',
        resolve: {
          resolved: settingsResolver
        },
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
