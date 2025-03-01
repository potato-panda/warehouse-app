import {Component, inject, OnInit} from '@angular/core';
import {
  ProductsCollectionResourceResponse,
  ProductsResourceResponse,
  ProductsService
} from '../../../../../services/products.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDataListComponent,
  TuiDataListDirective,
  TuiError,
  TuiLoader,
  TuiOption,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ResolvedData} from './details.resolver';
import {
  BehaviorSubject,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  share,
  startWith,
  switchMap
} from 'rxjs';
import {InventoryDetailResourceResponse, InventoryService} from '../../../../../services/inventory.service';
import {TuiCardLarge, TuiCell, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiElasticContainer, TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {TuiComboBoxModule, TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {CleanUrlPipe} from '../../../../../pipes/clean-url.pipe';
import {TuiLet} from '@taiga-ui/cdk';
import CleanUrl from '../../../../../utils/clean-url';
import UniqueId from '../../../../../utils/unique-id';
import {
  SitesDetailCollectionResourceResponse,
  SitesDetailResourceResponse,
  SitesService
} from '../../../../../services/sites.service';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiTextareaModule,
    TuiButton,
    RouterLink,
    CleanUrlPipe,
    NgForOf,
    NgIf,
    TuiComboBoxModule,
    TuiDataListComponent,
    TuiDataListDirective,
    TuiLet,
    TuiLoader,
    TuiOption,
    TuiTextfieldControllerModule,
    TuiElasticContainer,
    TuiCell
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  protected resolvedInventory!: InventoryDetailResourceResponse;
  protected inProgress = false;

  protected readonly form = new FormGroup({
    inventory: new FormGroup({
      siteId: new FormControl<string | null>(null),
      quantity: new FormControl(0),
    }),
    product: new FormControl<string | null>(null, Validators.required)
  });
  protected productInfo$ = new BehaviorSubject<ProductsResourceResponse | null>(null);
  private readonly alerts = inject(TuiAlertService);
  private mappedProducts$ = new BehaviorSubject<ProductsCollectionResourceResponse['_embedded']['products']>([]);
  private readonly searchProductRequest$ = new BehaviorSubject<string>('');
  private readonly searchSiteRequest$ = new BehaviorSubject<string>('');
  private resolvedProduct?: ProductsResourceResponse;
  private resolvedSite?: SitesDetailResourceResponse;
  private mappedSites$ = new BehaviorSubject<SitesDetailResourceResponse[]>([]);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private inventoryService: InventoryService,
              private productsService: ProductsService,
              private sitesService: SitesService,
  ) {
  }

  save() {
    this.inProgress = true;
    const inventoryFormValue = this.form.get('inventory')?.value;
    const productHref = this.form.get('product')?.value;
    const siteId = this.form.get('inventory.siteId')?.value;

    let saveRequest$: Observable<any>;
    if (this.resolvedInventory?.id) {
      const {id, quantity} = this.resolvedInventory;
      saveRequest$ = this.inventoryService.updateOne({id, quantity}).pipe(concatMap(inventoryResponse => {
        const inventoryProductPropertyUrl = inventoryResponse._links.product.href;

        let followRequest = [];

        // update product
        if (productHref && productHref !== this.resolvedProduct?._links?.self?.href) {
          followRequest.push(this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref));
        }
        // update site
        if (siteId && siteId !== this.resolvedSite?.id) {
          followRequest.push(this.inventoryService.addSite(id.toString(), siteId));
        }

        return forkJoin([...followRequest]).pipe(map(() => of(inventoryResponse)));

      }));
    } else {
      saveRequest$ = this.inventoryService.createOne({quantity: inventoryFormValue?.quantity ?? 0}).pipe(concatMap(inventoryResponse => {
        const inventoryProductPropertyUrl = inventoryResponse._links.product.href;
        let followRequest = [];

        if (productHref) {
          followRequest.push(this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref));
        }
        if (siteId) {
          followRequest.push(this.inventoryService.addSite(inventoryResponse.id.toString(), siteId));
        }

        return forkJoin([...followRequest]).pipe(map(() => of(inventoryResponse)));
      }));
    }

    saveRequest$.subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe();
        this.inProgress = false;
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe();
        this.inProgress = false;

        this.router.navigate(['..'], {relativeTo: this.route}).then();
      },
      complete: () => this.inProgress = false
    });
  }

  searchProductRequest(search?: string | null) {
    this.searchProductRequest$.next(search ?? '');

    return this.searchProductResponse$;
  }

  searchSiteRequest(search?: string | null) {
    this.searchSiteRequest$.next(search ?? '');

    return this.searchSiteResponse$;
  }

  stringifyProduct = (href: string) => {
    return this.mappedProducts$.value.filter(c => CleanUrl.transform(c?._links.self.href) === href)?.[0]?.name || '';
  };

  getProductData: (search?: string) => Observable<ProductsCollectionResourceResponse> = (search?: string) => {
    if (search && search.length && search.length > 0) {
      return this.productsService.getPageByName(search).pipe(map(response => response));
    }
    return this.productsService.getPage().pipe(map(response => response));
  };

  protected searchProductResponse$: Observable<ProductsCollectionResourceResponse['_embedded']['products']> = this.searchProductRequest$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((search) => {
      return this.getProductData(search ?? '').pipe(
        mergeMap((response) => {
          const products = response._embedded.products;
          const uniqueProducts = UniqueId.filter(this.resolvedProduct ? [this.resolvedProduct, ...products] : products);
          this.mappedProducts$.next(uniqueProducts);
          return of(uniqueProducts);
        }),
        startWith([] as ProductsCollectionResourceResponse['_embedded']['products']),
      );
    }),
    share()
  );

  getSiteData: (search?: string) => Observable<SitesDetailCollectionResourceResponse> = (search?: string) => {
    if (search && search.length && search.length > 0) {
      return this.sitesService.getDetailPageByName(search);
    }
    return this.sitesService.getDetailPage();
  };

  protected searchSiteResponse$: Observable<SitesDetailCollectionResourceResponse['_embedded']['sites']> = this.searchSiteRequest$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((search) => this.getSiteData(search ?? '').pipe(
      mergeMap((response) => {
        const sites = response._embedded.sites;
        this.mappedSites$.next(sites);
        return of(sites);
      }),
      startWith([]))
    ),
    share()
  );

  stringifySite: (siteId: string) => string = (siteId) => {
    const site = this.mappedSites$.value.filter(site => site.id.toString() === siteId.toString())?.[0];
    return site ? site.name + ', ' + site.address.fullAddress : '';
  };

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['resolved']) {
        const {inventory, product, site} = this.route.snapshot.data['resolved'] as ResolvedData;
        if (product) {
          this.resolvedProduct = product;
          this.mappedProducts$.next([this.resolvedProduct]);
        }
        if (site) {
          this.resolvedSite = site;
          this.mappedSites$.next([this.resolvedSite]);
        }

        this.form.get('product')?.valueChanges.subscribe(productHref => {
          this.productInfo$.next(this.mappedProducts$.value.filter(p => p._links.self.href === productHref)?.[0]);
        });

        this.resolvedInventory = inventory;
        const {quantity} = this.resolvedInventory;

        this.form.patchValue({
          inventory: {
            siteId: this.resolvedInventory?.site?.id.toString() ?? null,
            quantity,
          },
          product: product?._links.self.href
        });
        this.form.updateValueAndValidity();
      }
    });
  }
}
