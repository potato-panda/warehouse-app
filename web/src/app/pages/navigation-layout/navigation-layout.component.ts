import {Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Data, RouterLink} from '@angular/router';
import {TuiPortals} from '@taiga-ui/cdk';
import {TuiFade,} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';
import {TuiButton} from '@taiga-ui/core';
import {map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {DomainsComponent} from './domains/domains.component';

@Component({
  selector: 'app-navigation-layout',
  imports: [
    FormsModule,
    TuiFade,
    TuiNavigation,
    TuiButton,
    AsyncPipe,
    RouterLink,
    DomainsComponent,

  ],
  templateUrl: './navigation-layout.component.html',
  styleUrl: './navigation-layout.component.scss',
})
export class NavigationLayoutComponent extends TuiPortals {
  protected expanded = signal(false);
  protected open = false;
  protected readonly routes: any = {
    customers: '/customers',
    contacts: '/contacts',
    products: '/products',
    inventories: '/inventories',
    quotations: '/quotations',
    purchaseOrders: '/purchaseOrders',
    receipts: '/receipts'
  };
  protected username: Observable<Data>;

  constructor(private route: ActivatedRoute) {
    super();
    this.username = this.route.data.pipe(map(data => data['username']));

    // TODO lift breadcrumb data from router state
    // I forgot for what though
  }

  protected handleToggle(): void {
    this.expanded.update((e) => !e);
  }
}
