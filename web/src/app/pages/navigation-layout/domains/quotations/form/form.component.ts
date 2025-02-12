import {Component, inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BehaviorSubject, map, mergeMap, Observable, of, startWith, Subject, withLatestFrom} from 'rxjs';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';
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
import {CompaniesSummaryResourceResponse, CompanyService} from '../../../../../services/company.service';
import {ComboBoxComponent} from '../../../../../components/combo-box/combo-box.component';
import {WaIntersectionObserver} from '@ng-web-apis/intersection-observer';
import {TuiTable} from '@taiga-ui/addon-table';
import {QuoteItemWithProductResourceResponse} from '../../../../../services/quote-item.service';
import CleanUrl from '../../../../../utils/clean-url';
import {Product} from '../../../../../interfaces/entities/product';
import {TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';

interface QuoteItemRow {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  quantity: FormControl<number | null>;
  discountAmount: FormControl<number | null>;
  price: FormControl<number | null>;
  totalAmount: FormControl<number | null>;
  quotedProductHref: FormControl<string | null>;
}

type ProductWithLink = Product & {
  link: string;
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
      paymentTerms: new FormControl(''),
      shippingAddress: new FormControl(''),
      companyHref: new FormControl<string | null>('', [Validators.required, Validators.min(1)]),
    }),
    quoteItems: new FormArray<FormGroup<QuoteItemRow>>([])
  });
  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'product' | 'price' | 'quantity' | 'unit' | 'total' | null>(null);
  protected selectedProducts: Record<string | number, Product | null> = {};
  protected readonly Number = Number;
  private readonly alerts = inject(TuiAlertService);
  private mappedProducts$ = new BehaviorSubject<Record<string | number, ProductWithLink[]>>({});
  private readonly searchProductRequest$ = new Subject<{ index: number, search: string }>();
  private readonly searchCompanyRequest$ = new BehaviorSubject('');
  private mappedCompanies$ = new BehaviorSubject<CompaniesSummaryResourceResponse[]>([]);
  private resolvedCompany$ = new BehaviorSubject<CompaniesSummaryResourceResponse | null>(null);
  private resolvedProducts$ = new BehaviorSubject<Record<string, ProductWithLink | null>>({});

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companiesService: CompanyService,
              private quotationsService: QuotationService,
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
        const {quotation, company} = this.route.snapshot.data['resolved'] as ResolvedData;

        this.resolvedCompany$.next(company);
        company && this.mappedCompanies$.next([company]);

        this.form.patchValue({
          quotation: {
            ...quotation,
            companyHref: CleanUrl.transform(company?._links?.self.href) ?? null
          },
        });

        this.resolvedQuotation$.next(quotation);

        this.quotationsService.getQuoteItemsWithProduct(quotation.id).pipe(
          mergeMap((quoteItemsResponse) => {
            // get quote items
            const quoteItems = quoteItemsResponse._embedded.quoteItems;

            const mapped = quoteItems.reduce((map, quoteItem) => {
              const id = quoteItem.id;
              this.resolvedProducts$.next({
                ...this.resolvedProducts$.value,
                [id]: this.mapToProductWithLink(quoteItem)
              });
              return {
                ...map,
                [id]: [this.mapToProductWithLink(quoteItem)]
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
      }
    });
  }

  protected toCompanyHref: (item: CompaniesSummaryResourceResponse) => string = item => {
    // console.log('extractCompanyValue',item)
    return CleanUrl.transform(item._links.self.href) ?? '';
  };

  protected toProductHref: (item: ProductWithLink) => string = item => {
    return item.link;
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
      quotedProductHref: new FormControl(quoteItem?._links.quotedProduct.href ?? null, [Validators.required, Validators.min(1)])
    });
    this.selectedProducts[_d] = quoteItem?.quotedProduct ?? null;
    row.get('quotedProductHref')?.valueChanges.subscribe(value => {
      if (!value) {
        this.selectedProducts[_d] = null;
      }
    });
    this.quoteItemsFormArray.push(row);
  }

  protected removeRow(_d?: string) {
    const index = this.quoteItemsFormArray.controls.findIndex(fc => fc.value._d === _d);
    if (index != -1) {
      if (_d) {
        this.mappedProducts$.next({...this.mappedProducts$.value, [_d]: []});
        this.selectedProducts[_d] = null;
      }
      this.quoteItemsFormArray.removeAt(index);
    }
  }

  protected save(back?: boolean) {
    this.inProgress = true;
    const inventoryFormValue = this.form.get('inventory')?.value;
    const productHref = this.form.get('product')?.value;
  }

  protected stringifyCompany = (companyHref: string) => {
    const company = this.mappedCompanies$.value.filter(c => CleanUrl.transform(c._links.self.href) === CleanUrl.transform(companyHref))?.[0];
    return company?.name ?? '';
  };

  protected stringifyProduct = (_d: string, id?: string | number | null) => (productHref: string) => {
    // console.log('stringifyProduct', product);
    // I hate that I did this
    const product = this.mappedProducts$.value[id || _d].filter(item => CleanUrl.transform(item.link) === CleanUrl.transform(productHref))?.[0];
    return product?.name ?? '';
  };

  protected searchProducts: (_d: string, id?: string | number | null) => (search: string) => Observable<ProductWithLink[]>
    = (_d: string, id?: string | number | null) => (search: string) => {
    let results: Observable<ProductsResourceResponse[]>;
    if (search && search.length && search.length > 0) {
      results = this.productsService.getPageByName(search).pipe(map(response => response._embedded.products));
    } else {
      results = this.productsService.getPage().pipe(map(response => response._embedded.products));
    }
    return results.pipe(
      mergeMap((products) => {
        const resolvedProducts = this.resolvedProducts$.value[id || _d];
        const responseProductsMapped = products.map(this.mapToProductWithLink);
        const uniqueProductsWithLink = UniqueId.filter(resolvedProducts ? [resolvedProducts, ...responseProductsMapped] : responseProductsMapped);
        this.mappedProducts$.next({
          ...this.mappedProducts$.value,
          [id || _d]: uniqueProductsWithLink
        });
        return of(uniqueProductsWithLink);
      }),
      startWith([]),
    );
  };

  protected searchCompanies: (search: string) => Observable<CompaniesSummaryResourceResponse[]>
    = (search: string) => {
    let results: Observable<CompaniesSummaryResourceResponse[]>;
    if (search && search.length && search.length > 0) {
      results = this.companiesService.getPageByName(search).pipe(map(response => response._embedded.companies));
    } else {
      results = this.companiesService.getPage().pipe(map(response => response._embedded.companies));
    }
    return results.pipe(
      withLatestFrom(this.resolvedCompany$),
      mergeMap(([response, resolved]) => {
        const uniqueCompanies = UniqueId.filter(resolved ? [resolved, ...response] : [...response]);
        this.mappedCompanies$.next(uniqueCompanies);
        return of(uniqueCompanies);
      }),
      startWith([]),
    );
  };

  private mapToProductWithLink(o: ProductsResourceResponse | QuoteItemWithProductResourceResponse): ProductWithLink {
    if ('quotedProduct' in o) {
      return {
        ...o.quotedProduct,
        link: CleanUrl.transform(o._links.quotedProduct.href),
      };
    }
    // if not quoteItem then it can only be a product
    return {
      ...o,
      link: o._links.self.href,
    };
  }
}
