import {Component, inject} from '@angular/core';
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
  map,
  mergeMap,
  Observable,
  of,
  share,
  startWith,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';
import {InventoryService, InventoryWithProductResourceResponse} from '../../../../../services/inventory.service';
import {Inventory} from '../../../../../interfaces/entities/inventory';
import {TuiCardLarge, TuiCell, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiElasticContainer, TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {TuiComboBoxModule, TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {CleanUrlPipe} from '../../../../../pipes/clean-url.pipe';
import {TuiLet} from '@taiga-ui/cdk';
import CleanUrl from '../../../../../utils/clean-url';
import UniqueId from '../../../../../utils/unique-id';

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
export class FormComponent {
  protected resolvedInventory!: InventoryWithProductResourceResponse;
  protected inProgress = false;

  protected readonly form = new FormGroup({
    inventory: new FormGroup({
      address: new FormControl('',),
      quantity: new FormControl(0),
    }),
    product: new FormControl<string | null>(null, Validators.required)
  });
  protected productInfo$ = new BehaviorSubject<ProductsResourceResponse | null>(null);
  private readonly alerts = inject(TuiAlertService);
  private mappedProducts$ = new BehaviorSubject<ProductsCollectionResourceResponse['_embedded']['products']>([]);
  private readonly searchCustomerRequest$ = new BehaviorSubject<string>('');
  private resolvedProduct?: ProductsResourceResponse;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private inventoryService: InventoryService,
              private productsService: ProductsService,
  ) {
  }

  save(back?: boolean) {
    this.inProgress = true;
    const inventoryFormValue = this.form.get('inventory')?.value;
    const productHref = this.form.get('product')?.value;

    const updatedInventory = {
      id: this.resolvedInventory?.id,
      ...inventoryFormValue,
    } as Inventory;

    let saveRequest$: Observable<any>;

    if (updatedInventory.id) {
      saveRequest$ = this.inventoryService.updateOne(updatedInventory).pipe(concatMap(inventoryResponse => {
        const inventoryProductPropertyUrl = inventoryResponse._links.product.href;

        if (productHref && productHref !== this.resolvedProduct?._links.self.href) {
          return this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref);
        }

        return of(inventoryResponse);
      }));
    } else {
      saveRequest$ = this.inventoryService.createOne(updatedInventory).pipe(concatMap(inventoryResponse => {
        const inventoryProductPropertyUrl = inventoryResponse._links.product.href;

        if (productHref) {
          return this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref);
        }

        return of(inventoryResponse);
      }));
    }

    saveRequest$.subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe(() => {
        });
        this.inProgress = false;
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe(() => {
        });
        this.inProgress = false;

        if (back) {
          this.router.navigate(['..'], {relativeTo: this.route}).then();
        }
        if (value.id) {
          this.router.navigate(['..', `${value.id}`], {relativeTo: this.route}).then();
        }
      },
      complete: () => this.inProgress = false
    });
  }

  searchRequest(search?: string | null) {
    this.searchCustomerRequest$.next(search ?? '');

    return this.searchProductResponse$;
  }

  stringify = (href: string) => {
    return this.mappedProducts$.value.filter(c => CleanUrl.transform(c?._links.self.href) === href)?.[0]?.name || '';
  };

  getProductData: (search?: string) => Observable<ProductsCollectionResourceResponse> = (search?: string) => {
    if (search && search.length && search.length > 0) {
      return this.productsService.getPageByName(search).pipe(map(response => response));
    }
    return this.productsService.getPage().pipe(map(response => response));
  };

  protected searchProductResponse$: Observable<ProductsCollectionResourceResponse['_embedded']['products']> = this.searchCustomerRequest$.pipe(
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

  private ngOnInit() {
    this.route.data.subscribe((data) => {

      if (data['resolved']) {
        const {inventory, product} = this.route.snapshot.data['resolved'] as ResolvedData;
        if (product) {
          this.resolvedProduct = product;
          this.mappedProducts$.next([this.resolvedProduct]);
        }
        this.form.get('product')?.valueChanges.pipe(
          takeUntil(this.destroy$)
        ).subscribe(productHref => {
          this.productInfo$.next(this.mappedProducts$.value.filter(p => p._links.self.href === productHref)?.[0]);
        });

        this.resolvedInventory = inventory;
        const {quantity, address} = this.resolvedInventory;

        this.form.patchValue({
          inventory: {
            address: address,
            quantity: quantity,
          },
          product: product?._links.self.href
        });
        this.form.updateValueAndValidity();
      }
    });

  }

  private ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
