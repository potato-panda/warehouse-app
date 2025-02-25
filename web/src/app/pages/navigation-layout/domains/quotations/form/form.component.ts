import {Component, inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {ProductsCollectionResourceResponse, ProductsService} from '../../../../../services/products.service';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiLoader,
  TuiNumberFormat,
  TuiScrollbar,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import UniqueId from '../../../../../utils/unique-id';
import {ResolvedData} from './details.resolver';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe, TuiInputNumber} from '@taiga-ui/kit';
import {QuotationService, QuotationsTableResourceResponse} from '../../../../../services/quotation.service';
import {CustomersSummaryResourceResponse, CustomersService} from '../../../../../services/customers.service';
import {ComboBoxComponent} from '../../../../../components/combo-box/combo-box.component';
import {WaIntersectionObserver} from '@ng-web-apis/intersection-observer';
import {TuiTable} from '@taiga-ui/addon-table';
import {
  QuoteItemResourceResponse,
  QuoteItemService,
  QuoteItemWithProductResourceResponse
} from '../../../../../services/quote-item.service';
import {Product} from '../../../../../interfaces/entities/product';
import {TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';

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
    FormsModule,
    TuiScrollbar,
    TuiTable,
    TuiTextfield,
    WaIntersectionObserver,
    TuiError,
    ReactiveFormsModule,
    TuiAppearance,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiTitle,
    TuiFieldErrorPipe,
    ComboBoxComponent,
    TuiLoader,
    TuiButton,
    RouterLink,
    TuiInputNumber,
    TuiNumberFormat,
    TuiIcon,
    NgForOf,
    NgIf,
    DatePipe,
    TuiTextareaModule,
    TuiTextfieldControllerModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  readonly columns = ['product', 'price', 'quantity', 'unit', 'total', 'actions'];
  protected resolvedQuotation$ = new BehaviorSubject<QuotationsTableResourceResponse | null>(null);
  protected inProgress = false;
  protected readonly form = new FormGroup({
    quotation: new FormGroup({
      id: new FormControl<string | number | null | undefined>(''),
      paymentTerms: new FormControl<string | null | undefined>(''),
      shippingAddress: new FormControl<string | null | undefined>(''),
      customerId: new FormControl<string | number | null>(null),
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
  private readonly searchCustomerRequest$ = new BehaviorSubject('');
  private mappedCustomers$ = new BehaviorSubject<CustomersSummaryResourceResponse[]>([]);
  private resolvedCustomer$ = new BehaviorSubject<CustomersSummaryResourceResponse | null>(null);
  private resolvedProducts$ = new BehaviorSubject<Record<string, Product | null>>({});

  constructor(private route: ActivatedRoute,
              private router: Router,
              private customersService: CustomersService,
              private quotationsService: QuotationService,
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
        const {quotation, customer} = this.route.snapshot.data['resolved'] as ResolvedData;

        this.resolvedCustomer$.next(customer);
        customer && this.mappedCustomers$.next([customer]);

        this.form.patchValue({
          quotation: {
            ...quotation,
            customerId: customer?.id ?? null
          },
        });

        this.resolvedQuotation$.next(quotation);

        this.quotationsService.getQuoteItemsWithProduct(quotation.id!).pipe(
          mergeMap((quoteItemsResponse) => {
            const quoteItems = quoteItemsResponse._embedded.quoteItems;

            const mapped = quoteItems.reduce((map, quoteItem) => {
              // fetched quoteItems have string ids
              const id = quoteItem.id as string;
              this.resolvedProducts$.next({
                ...this.resolvedProducts$.value,
                [id]: quoteItem.quotedProduct
              });
              return {
                ...map,
                [id]: [quoteItem.quotedProduct]
              };
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

        quotation?.receipt?.id && this.form.disable();
      }
    });
  }

  protected toCustomerId: (item: CustomersSummaryResourceResponse) => string = item => {
    return item.id.toString() ?? '';
  };

  protected toProductId: (item: Product) => string = item => {
    return item.id.toString();
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
      productId: new FormControl(quoteItem?.quotedProduct.id ?? '', Validators.min(1))
    });
    this.selectedProducts[_d] = quoteItem?.quotedProduct ?? null;
    row.get('productId')?.valueChanges.subscribe(value => {
      if (!value) {
        this.selectedProducts[_d] = null;
      }
    });
    this.resolvedQuotation$.value?.receipt?.id && row.disable();
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
    const quotationForm = this.form.get('quotation');
    const quotationData = quotationForm?.value;
    const quoteItems = this.quoteItemsFormArray;

    if (!quotationData) {
      this.inProgress = false;
      return;
    }

    let quotationRequest;
    let quoteItemRequests = [];

    if (quotationForm?.dirty && quotationForm.valid) {
      const customerControl = this.form.get('quotation.customerId');
      const {paymentTerms, shippingAddress, id} = quotationData;
      if (id) {
        quotationRequest = this.quotationsService.updateOne({
          paymentTerms, shippingAddress, id
        })
          .pipe(mergeMap(quotationResponse =>
            customerControl?.value && customerControl.dirty && customerControl.valid
              ? this.quotationsService.addCustomer(quotationResponse.id as string, customerControl?.value).pipe(mergeMap(() => of(quotationResponse)))
              : of(quotationResponse)));
      } else {
        quotationRequest = this.quotationsService.createOne({
          paymentTerms, shippingAddress
        })
          .pipe(mergeMap(quotationResponse =>
            customerControl?.value
              ? this.quotationsService.addCustomer(quotationResponse.id as string, customerControl?.value).pipe(mergeMap(() => of(quotationResponse)))
              : of(quotationResponse)));
      }
    } else {
      quotationRequest = this.resolvedQuotation$.pipe(take(1));
    }

    for (const control of quoteItems.controls) {
      const {id, quantity, discountAmount, totalAmount, price, productId} = control.value;
      const productChange = id ? control.get('productId')?.dirty : true;

      const updateProduct = (quoteItemResponse: QuoteItemResourceResponse) => {
        if (quoteItemResponse.id && productChange && productId) {
          return this.quoteItemsService.updateProduct(quoteItemResponse.id.toString(), productId)
            .pipe(mergeMap(() => of(quoteItemResponse)));
        }
        return of(quoteItemResponse);
      };

      if (control.dirty && control.valid) {
        const quoteItemRequest = id
          ? this.quoteItemsService.updateOne(control.value)
            .pipe(mergeMap(updateProduct))
          : this.quoteItemsService.createOne({quantity, discountAmount, totalAmount, price})
            .pipe(mergeMap(updateProduct));

        quoteItemRequests.push(quoteItemRequest);
      }
    }

    forkJoin([quotationRequest, ...quoteItemRequests]).pipe(
      mergeMap(responses => {
        const [quotation, ...quoteItems] = responses;
        if (!quotation) return throwError(() => new Error('Are you sure Quotation exists?'));

        const updateQuotationRequests = quoteItems.map(quoteItem => this.quoteItemsService.updateQuotation(quoteItem.id as string, quotation?.id.toString()));

        return (updateQuotationRequests.length > 0)
          ? forkJoin(updateQuotationRequests).pipe(
            map(() => quotation),
            catchError((err, caught) => throwError(() => err)))
          : of(quotation);
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

  protected stringifyCustomer = (customerId?: string | number) => {
    return customerId ? (this.mappedCustomers$.value.filter(c => c.id === Number(customerId))?.[0])?.name ?? '' : '';
  };

  protected stringifyProduct = (_d: string, id?: string | number | null) => (productId?: string | number) => {
    return productId ? (this.mappedProducts$.value[id || _d].filter(p => p.id === Number(productId))?.[0])?.name ?? '' : '';
  };

  protected searchProducts: (_d: string, id?: string | number | null) => (search: string) => Observable<Product[]>
    = (_d: string, id?: string | number | null) => (search: string) => {
    let results: Observable<ProductsCollectionResourceResponse>;
    if (search && search.length && search.length > 0) {
      results = this.productsService.getPageByName(search).pipe();
    } else {
      results = this.productsService.getPage();
    }
    return results.pipe(
      map(response => response._embedded.products),
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

  protected searchCustomers: (search: string) => Observable<CustomersSummaryResourceResponse[]>
    = (search: string) => {
    let results: Observable<CustomersSummaryResourceResponse[]>;
    if (search && search.length && search.length > 0) {
      results = this.customersService.getPageByName(search).pipe(map(response => response._embedded.customers));
    } else {
      results = this.customersService.getPage().pipe(map(response => response._embedded.customers));
    }
    return results.pipe(
      withLatestFrom(this.resolvedCustomer$),
      mergeMap(([response, resolved]) => {
        const uniqueCustomers = UniqueId.filter(resolved ? [resolved, ...response] : [...response]);
        this.mappedCustomers$.next(uniqueCustomers);
        return of(uniqueCustomers);
      }),
      startWith([]),
    );
  };

}
