import {Component, inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BehaviorSubject, map, mergeMap, Observable, of, startWith, Subject} from 'rxjs';
import {
  ProductsCollectionResourceResponse,
  ProductsResourceResponse,
  ProductsService
} from '../../../../../services/products.service';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLoader,
  TuiNumberFormat,
  TuiScrollbar,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import CleanUrl from '../../../../../utils/clean-url';
import UniqueId from '../../../../../utils/unique-id';
import {ResolvedData} from './details.resolver';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiChevron, TuiDataListWrapper, TuiFieldErrorPipe, TuiInputNumber} from '@taiga-ui/kit';
import {QuotationService, QuotationsTableResourceResponse} from '../../../../../services/quotation.service';
import {
  CompaniesCollectionResourceResponse,
  CompaniesResourceResponse,
  CompaniesSummaryResourceResponse,
  CompanyService
} from '../../../../../services/company.service';
import {ComboBoxComponent} from '../../../../../components/combo-box/combo-box.component';
import {WaIntersectionObserver} from '@ng-web-apis/intersection-observer';
import {TuiTable} from '@taiga-ui/addon-table';

interface QuoteItemRow {
  quantity: FormControl<number | null>;
  discountAmount: FormControl<number | null>;
  price: FormControl<number | null>;
  totalAmount: FormControl<number | null>;
  product: FormControl<string | null>;
}

@Component({
  selector: 'app-form',
  imports: [
    AsyncPipe,
    FormsModule,
    NgForOf,
    TuiChevron,
    TuiDataListWrapper,
    TuiInputNumber,
    TuiNumberFormat,
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
    NgIf,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  extractCompanyHref = ((company: CompaniesSummaryResourceResponse) => company._links.self.href);
  readonly columns = ['product', 'price', 'quantity', 'unit', 'total', 'actions'];
  protected resolvedQuotation!: QuotationsTableResourceResponse;
  protected inProgress = false;
  protected readonly form = new FormGroup({
    quotation: new FormGroup({
      paymentTerms: new FormControl(''),
      shippingAddress: new FormControl(''),
      companyHref: new FormControl('', [Validators.required, Validators.min(1)]),
    }),
    quoteItems: new FormArray<FormGroup<QuoteItemRow>>([])
  });
  protected productInfo$ = new BehaviorSubject<Record<number, ProductsResourceResponse | null> | null>(null);
  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'product' | 'price' | 'quantity' | 'unit' | 'total' | null>(null);
  private readonly alerts = inject(TuiAlertService);
  private mappedProducts$ = new BehaviorSubject<Record<number, ProductsCollectionResourceResponse['_embedded']['products']>>({});
  private readonly searchProductRequest$ = new Subject<{ index: number, search: string }>();
  private searchCompanyRequest$ = new BehaviorSubject('');
  // private searchCompanyResponse$ = new BehaviorSubject<CompaniesCollectionResourceResponse['_embedded']['companies']>([]);
  private resolvedCompany!: CompaniesResourceResponse;
  private mappedCompanies$ = new BehaviorSubject<CompaniesCollectionResourceResponse['_embedded']['companies']>([]);
  private companyInfo$ = new Subject<CompaniesSummaryResourceResponse>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companiesService: CompanyService,
              private quotationsService: QuotationService,
              private productsService: ProductsService,
  ) {
  }

  get quoteItemsFormArray() {
    return this.form.get('quoteItems') as FormArray<FormGroup<QuoteItemRow>>;
  }

  get isQuoteItemsFormArraySortable() {
    return this.quoteItemsFormArray.length > 1;
  }

  addRow() {
    this.quoteItemsFormArray.push(new FormGroup<QuoteItemRow>({
      quantity: new FormControl(0),
      discountAmount: new FormControl(0),
      price: new FormControl(0),
      totalAmount: new FormControl(0),
      product: new FormControl<string | null>(null)
    }));
  }

  removeRow(index: number) {
    this.mappedProducts$.next({...this.mappedProducts$.value, [index]: []});
    this.productInfo$.next({...this.productInfo$.value, [index]: null});
    this.quoteItemsFormArray.removeAt(index);
  }

  save(back?: boolean) {
    this.inProgress = true;
    const inventoryFormValue = this.form.get('inventory')?.value;
    const productHref = this.form.get('product')?.value;

    // const updatedInventory = {
    //   id: this.resolvedQuotation?.id,
    //   ...inventoryFormValue,
    // } as Inventory;
    //
    // let saveRequest$: Observable<any>;
    //
    // if (updatedInventory.id) {
    //   saveRequest$ = this.inventoryService.updateOne(updatedInventory).pipe(concatMap(inventoryResponse => {
    //     const inventoryProductPropertyUrl = inventoryResponse._links.product.href;
    //
    //     if (productHref && productHref !== this.resolvedProduct?._links.self.href) {
    //       return this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref);
    //     }
    //
    //     return of(inventoryResponse);
    //   }));
    // } else {
    //   saveRequest$ = this.inventoryService.createOne(updatedInventory).pipe(concatMap(inventoryResponse => {
    //     const inventoryProductPropertyUrl = inventoryResponse._links.product.href;
    //
    //     if (productHref) {
    //       return this.inventoryService.updateRelation(inventoryProductPropertyUrl, productHref);
    //     }
    //
    //     return of(inventoryResponse);
    //   }));
    // }
    //
    // saveRequest$.subscribe({
    //   error: err => {
    //     this.alerts.open(context => 'Please try again later.',
    //       {
    //         appearance: 'negative',
    //         label: 'Save failed'
    //       }).subscribe(() => {
    //     });
    //     this.inProgress = false;
    //   },
    //   next: (value) => {
    //     this.alerts.open(context => {
    //       },
    //       {
    //         appearance: 'positive',
    //         label: 'Save successful!',
    //       }).subscribe(() => {
    //     });
    //     this.inProgress = false;
    //
    //     if (back) {
    //       this.router.navigate(['..'], {relativeTo: this.route}).then();
    //     }
    //     if (value.id) {
    //       this.router.navigate(['..', `${value.id}`], {relativeTo: this.route}).then();
    //     }
    //   },
    //   complete: () => this.inProgress = false
    // });
  }

  stringifyCompany = (company: CompaniesSummaryResourceResponse) => {
    return company?.name ?? '';
  };

  stringifyProduct = (index: number) => (href: string) => {
    return this.mappedProducts$.value?.[index]?.filter(p => CleanUrl.transform(p?._links.self.href) === href)?.[0]?.name || '';
  };

  searchProducts: (search?: string) => Observable<ProductsCollectionResourceResponse['_embedded']['products']> = (search?: string) => {
    let results;
    if (search && search.length && search.length > 0) {
      results = this.productsService.getPageByName(search).pipe(map(response => response));
    } else {
      results = this.productsService.getPage().pipe(map(response => response));
    }
    return results.pipe(
      mergeMap((response) => {
        const products = response._embedded.products;
        return of(products);
      }),
      startWith([]),
    );
  };

  searchCompanies: (search?: string) => Observable<CompaniesCollectionResourceResponse['_embedded']['companies']> = (search?: string) => {
    let results;
    if (search && search.length && search.length > 0) {
      results = this.companiesService.getPageByName(search).pipe(map(response => response));
    } else {
      results = this.companiesService.getPage().pipe(map(response => response));
    }
    return results.pipe(
      mergeMap((response) => {
        const companies = response._embedded.companies;
        const uniqueCompanies = UniqueId.filter(this.resolvedCompany ? [this.resolvedCompany, ...companies] : companies);
        this.mappedCompanies$.next(uniqueCompanies);
        return of(uniqueCompanies);
      }),
      startWith([]),
    );
  };

  companyMatcher: (company: CompaniesSummaryResourceResponse, value: any) => boolean = (c, v) => {
    console.log('companyMatcher', c, v);
    return false;
  };

  private ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['resolved']) {
        const {quotation, company} = this.route.snapshot.data['resolved'] as ResolvedData;
        // this.form.get('quotation.companyHref')?.valueChanges.pipe(
        //   takeUntil(this.destroy$)
        // ).subscribe(productHref => {
        //   this.companyInfo$.next(company);
        // });

        this.form.patchValue({
          quotation: {
            ...quotation,
            companyHref: company?._links.self.href
          }
        });
      }
    });
  }
}
