import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Data, RouterLink} from '@angular/router';
import {TuiPortals} from '@taiga-ui/cdk';
import {TuiFade,} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';
import {TuiButton} from '@taiga-ui/core';
import {BehaviorSubject, map, mergeMap, Observable, of} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {DomainsComponent} from './domains/domains.component';
import {SettingsService} from '../../services/settings.service';

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
export class NavigationLayoutComponent extends TuiPortals implements OnInit {
  protected expanded = signal(false);
  protected open = false;
  protected readonly routes: any = {
    customers: '/customers',
    suppliers: '/suppliers',
    contacts: '/contacts',
    products: '/products',
    inventories: '/inventories',
    quotations: '/quotations',
    purchaseOrders: '/purchaseOrders',
    deliveryReceipts: '/deliveryReceipts',
    sites: '/sites',
    settings: '/settings',
  };
  protected username: Observable<Data>;
  protected appName$: Observable<string | null> = new BehaviorSubject(null);

  constructor(private route: ActivatedRoute,
              private settingsService: SettingsService) {
    super();
    this.username = this.route.data.pipe(map(data => data['username']));


    // TODO lift breadcrumb data from router state
    // I forgot for what though
  }

  ngOnInit(): void {
    this.appName$ = this.settingsService.getSettingSubject()
      .pipe(mergeMap(response => {
        const value = response.settings.filter(s => s.name === 'App Name')?.[0]?.value;
        return of(value);
      }));
  }


  protected handleToggle(): void {
    this.expanded.update((e) => !e);
  }
}
