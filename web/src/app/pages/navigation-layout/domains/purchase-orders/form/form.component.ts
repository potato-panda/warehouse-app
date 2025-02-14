import {Component, inject} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {ComboBoxComponent} from '../../../../../components/combo-box/combo-box.component';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiLabel,
  TuiLoader,
  TuiNumberFormat,
  TuiScrollbar,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
  TuiTitle
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe, TuiInputNumber} from '@taiga-ui/kit';
import {
  TuiTable,
  TuiTableCell,
  TuiTableDirective,
  TuiTableSortable,
  TuiTableSortBy,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThead,
  TuiTableThGroup,
  TuiTableTr
} from '@taiga-ui/addon-table';
import {TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {WaIntersectionRoot} from '@ng-web-apis/intersection-observer';
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  startWith,
  Subject,
  take,
  throwError,
  withLatestFrom
} from 'rxjs';
import {Product} from '../../../../../interfaces/entities/product';
import {CompanyService} from '../../../../../services/company.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  QuoteItemResourceResponse,
  QuoteItemService,
  QuoteItemWithProductResourceResponse
} from '../../../../../services/quote-item.service';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';
import UniqueId from '../../../../../utils/unique-id';
import {ResolvedData} from './details.resolver';
import {Company} from '../../../../../interfaces/entities/company';
import {PurchaseOrderDetail} from '../../../../../interfaces/entities/purchase-order';
import {PurchaseOrdersService} from '../../../../../services/purchase-orders.service';
import {resourceEndpoints} from '../../../../../services/resource-endpoints';

interface QuoteItemRow {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  quantity: FormControl<number | null>;
  discountAmount: FormControl<number | null>;
  price: FormControl<number | null>;
  totalAmount: FormControl<number | null>;
  productId: FormControl<string | number | null>;
}

@Component({
  selector: 'app-form',
  imports: [
    AsyncPipe,
    ComboBoxComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiHeader,
    TuiIcon,
    TuiInputNumber,
    TuiLabel,
    TuiLoader,
    TuiScrollbar,
    TuiTableCell,
    TuiTableDirective,
    TuiTableSortBy,
    TuiTableSortable,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableThead,
    TuiTableTr,
    TuiTextareaModule,
    TuiTextfieldComponent,
    TuiTextfieldControllerModule,
    TuiTextfieldDirective,
    TuiTextfieldOptionsDirective,
    TuiTitle,
    WaIntersectionRoot,
    TuiTable,
    TuiNumberFormat,
    RouterLink
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  readonly columns = ['product', 'price', 'quantity', 'unit', 'total', 'actions'];
  protected resolvedPurchaseOrder$ = new BehaviorSubject<PurchaseOrderDetail | null>(null);
  protected inProgress = false;
  protected readonly form = new FormGroup({
    purchaseOrder: new FormGroup({
      id: new FormControl<string | number | null>(null),
      preparedBy: new FormControl<string | null>(null),
      checkedBy: new FormControl<string | null>(null),
      approvedBy: new FormControl<string | null>(null),
      receivedBy: new FormControl<string | null>(null),
      supplierId: new FormControl<string | number | null>(null),
    }),
    quoteItems: new FormArray<FormGroup<QuoteItemRow>>([])
  });
  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'product' | 'price' | 'quantity' | 'unit' | 'total' | null>(null);
  protected selectedProducts: Record<string | number, Product | null> = {};
  protected readonly Number = Number;
  private readonly alerts = inject(TuiAlertService);
  private mappedProducts$ = new BehaviorSubject<Record<string | number, Product[]>>({});
  private readonly searchProductRequest$ = new Subject<{ index: number, search: string }>();
  private readonly searchCompanyRequest$ = new BehaviorSubject('');
  private mappedCompanies$ = new BehaviorSubject<Company[]>([]);
  private resolvedCompany$ = new BehaviorSubject<Company | null>(null);
  private resolvedProducts$ = new BehaviorSubject<Record<string, Product | null>>({});

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companiesService: CompanyService,
              private purchaseOrdersService: PurchaseOrdersService,
              private quoteItemsService: QuoteItemService,
              private productsService: ProductsService,
  ) {
  }

  protected get quoteItemsFormArray() {
    return this.form.get('quoteItems') as FormArray<FormGroup<QuoteItemRow>>;
  }

  protected get isQuoteItemsFormArraySortable() {
    return this.quoteItemsFormArray.length > 1;
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['resolved']) {
        const {purchaseOrder} = this.route.snapshot.data['resolved'] as ResolvedData;
        const supplier = purchaseOrder?.supplier;

        this.resolvedCompany$.next(supplier);
        supplier && this.mappedCompanies$.next([supplier]);

        this.form.patchValue({
          purchaseOrder: {
            ...purchaseOrder,
            supplierId: supplier?.id ?? null
          },
        });

        this.resolvedPurchaseOrder$.next(purchaseOrder);

        this.purchaseOrdersService.getQuoteItemsWithProduct(purchaseOrder.id!).pipe(
          mergeMap((quoteItemsResponse) => {
            // get quote items
            const quoteItems = quoteItemsResponse._embedded.quoteItems;

            const mapped = quoteItems.reduce((map, quoteItem) => {
              // fetched quoteItems have string ids
              const id = quoteItem.id as string;
              this.resolvedProducts$.next({
                ...this.resolvedProducts$.value,
                [id]: quoteItem.quotedProduct
              });
              return {...map, [id]: [quoteItem]};
            }, {});

            this.mappedProducts$.next(mapped);


            return of(quoteItems);
          })
        ).subscribe(quoteItems => {
          for (const quoteItem of quoteItems) {
            this.addRow(quoteItem);
          }
        });

        this.form.updateValueAndValidity();
      }
    });
  }

  protected toCompanyId: (item: Company) => string = item => {
    // console.log('extractCompanyValue',item)
    return item?.id.toString() ?? '';
  };

  protected toProductId: (item: Product) => string = item => {
    return item?.id.toString() ?? '';
  };

  protected addRow(quoteItem?: QuoteItemWithProductResourceResponse) {
    const _d = 'id' + Math.random().toString(16).slice(2);
    const row = new FormGroup<QuoteItemRow>({
      _d: new FormControl(_d, {nonNullable: true}),
      id: new FormControl(quoteItem?.id ?? null),
      quantity: new FormControl(quoteItem?.quantity ?? 0),
      discountAmount: new FormControl(quoteItem?.discountAmount ?? 0),
      price: new FormControl(quoteItem?.price ?? 0),
      totalAmount: new FormControl(quoteItem?.totalAmount ?? 0),
      productId: new FormControl(quoteItem?.quotedProduct.id ?? '', [Validators.min(1)])
    });
    this.selectedProducts[_d] = quoteItem?.quotedProduct ?? null;
    row.get('productId')?.valueChanges.subscribe(value => {
      if (!value) {
        this.selectedProducts[_d] = null;
      }
    });
    this.quoteItemsFormArray.push(row);
  }

  protected removeRow(_d: string) {
    const index = this.quoteItemsFormArray.controls.findIndex(fc => fc.value._d === _d);
    if (index != -1) {
      const quoteItemControl = this.quoteItemsFormArray.controls[index];
      if (quoteItemControl) {
        const id = quoteItemControl.value.id;
        if (id) {
          this.quoteItemsService.deleteOne(id.toString()).subscribe();
        }
      }
      this.mappedProducts$.next({...this.mappedProducts$.value, [_d]: []});
      this.selectedProducts[_d] = null;

      this.quoteItemsFormArray.removeAt(index);
    }
  }

  protected save(back?: boolean) {
    this.inProgress = true;
    const purchaseOrderForm = this.form.get('purchaseOrder');
    const purchaseOrderValue = purchaseOrderForm?.value;
    const quoteItems = this.quoteItemsFormArray;

    if (!purchaseOrderValue) {
      this.inProgress = false;
      return;
    }

    let purchaseOrderRequest;
    let quoteItemRequests = [];

    if (purchaseOrderForm?.dirty && purchaseOrderForm.valid) {
      const supplierControl = this.form.get('purchaseOrder.supplierId');
      if (purchaseOrderValue?.id) {
        purchaseOrderRequest = this.purchaseOrdersService.updateOne({
          id: purchaseOrderValue.id,
          approvedBy: purchaseOrderValue.approvedBy,
          checkedBy: purchaseOrderValue.checkedBy,
          preparedBy: purchaseOrderValue.preparedBy,
          receivedBy: purchaseOrderValue.receivedBy
        }).pipe(mergeMap(response => {
          return supplierControl?.value && supplierControl.dirty && supplierControl.valid ? this.purchaseOrdersService.addSupplier(response.id as string, supplierControl?.value) : of(response);
        }));
      } else {
        purchaseOrderRequest = this.purchaseOrdersService.createOne(purchaseOrderValue)
          .pipe(mergeMap(response => supplierControl?.value ? this.purchaseOrdersService.addSupplier(response.id as string, supplierControl?.value) : of(response)));
      }
    } else {
      purchaseOrderRequest = this.resolvedPurchaseOrder$.pipe(take(1));
    }

    for (const control of quoteItems.controls) {
      const {id, quantity, discountAmount, totalAmount, price, productId} = control.value;
      const hasId = !!control.value.id;
      const productChange = hasId ? control.get('quotedProduct')?.dirty : true;

      const updateProduct = (response: QuoteItemResourceResponse) => {
        if (productChange && response.id && productId) {
          return this.quoteItemsService.updateProduct(response.id.toString(), resourceEndpoints.products(productId as string))
            .pipe(mergeMap(() => of(response)));
        }
        return of(response);
      };

      if (control.dirty && control.valid) {
        const quoteItemRequest = hasId
          ? this.quoteItemsService.updateOne(control.value)
            .pipe(mergeMap(updateProduct))
          : this.quoteItemsService.createOne({quantity, discountAmount, totalAmount, price})
            .pipe(mergeMap(updateProduct));

        quoteItemRequests.push(quoteItemRequest);
      }
    }

    forkJoin([purchaseOrderRequest, ...quoteItemRequests]).pipe(
      mergeMap(responses => {
        const [purchaseOrder, ...quoteItems] = responses;
        if (!purchaseOrder) return throwError(() => new Error('Are you sure purchase order exists?'));

        const updatePurchaseOrderRequests = quoteItems.map(quoteItem => this.quoteItemsService.updatePurchaseOrder(quoteItem.id as string, purchaseOrder.id));

        return (updatePurchaseOrderRequests.length > 0)
          ? forkJoin(updatePurchaseOrderRequests).pipe(
            map(() => purchaseOrder),
            catchError((err, caught) => throwError(() => err)))
          : of(purchaseOrder);
      }),
      catchError((err, caught) => throwError(() => err))
    ).subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe(() => {
        });
        this.inProgress = false;
      },
      next: value => {
        this.alerts.open(() => 'Save successful!', {
          appearance: 'positive',
          label: 'Success',
        }).subscribe();

        this.inProgress = false;

        if (back) this.router.navigate(['..'], {relativeTo: this.route}).then();
        else if (value?.id) this.router.navigate(['..', `${value.id}`], {relativeTo: this.route}).then();
      },
      complete: () => {
        this.inProgress = false;
      }
    });
  }

  protected stringifyCompany = (companyId?: string | number) => {
    return companyId ? (this.mappedCompanies$.value.filter(c => c.id === Number(companyId))?.[0])?.name ?? '' : '';
  };

  protected stringifyProduct = (_d: string, id?: string | number | null) => (productId?: string | number) => {
    return productId ? (this.mappedProducts$.value[id || _d].filter(p => p.id === Number(productId))?.[0])?.name ?? '' : '';
  };

  protected searchProducts: (_d: string, id?: string | number | null) => (search: string) => Observable<Product[]>
    = (_d: string, id?: string | number | null) => (search: string) => {
    let results: Observable<ProductsResourceResponse[]>;
    if (search?.length > 0) {
      results = this.productsService.getPageByName(search).pipe(map(response => response._embedded.products));
    } else {
      results = this.productsService.getPage().pipe(map(response => response._embedded.products));
    }
    return results.pipe(
      mergeMap((products) => {
        const resolvedProducts = this.resolvedProducts$.value[id || _d];
        const uniqueProducts = UniqueId.filter(resolvedProducts ? [resolvedProducts, ...products] : products);
        this.mappedProducts$.next({
          ...this.mappedProducts$.value,
          [id || _d]: uniqueProducts
        });
        return of(uniqueProducts);
      }),
      startWith([]),
    );
  };

  protected searchCompanies: (search: string) => Observable<Company[]>
    = (search: string) => {
    let results: Observable<Company[]>;
    if (search?.length > 0) {
      results = this.companiesService.getPageByName(search).pipe(map(response => response._embedded.companies));
    } else {
      results = this.companiesService.getPage().pipe(map(response => response._embedded.companies));
    }
    return results.pipe(
      withLatestFrom(this.resolvedCompany$),
      mergeMap(([response, resolved]) => {
        const uniqueCompanies = UniqueId.filter(resolved ? [resolved, ...response] : response);
        this.mappedCompanies$.next(uniqueCompanies);
        return of(uniqueCompanies);
      }),
      startWith([]),
    );
  };
}
