import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDataListComponent,
  TuiError,
  TuiLabel,
  TuiLoader,
  TuiOption,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
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
  switchMap
} from 'rxjs';
import {
  CompanyService,
  ResourceCollectionResponse as CompanyResourceCollectionResponse,
  ResourceResponse as CompanyResourceResponse,
  ResourceSummaryResponse,
  ResourceSummaryResponse as CompanyResourceSummaryResponse
} from '../../../../../services/company.service';
import {ContactsService, ResourceResponse as ContactResourceResponse} from '../../../../../services/contacts.service';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {TuiComboBoxModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TuiLet} from '@taiga-ui/cdk';
import CleanUrl from '../../../../../utils/clean-url';
import {CleanUrlPipe} from '../../../../../pipes/clean-url.pipe';
import UniqueId from '../../../../../utils/unique-id';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    TuiForm,
    TuiAppearance,
    TuiCardLarge,
    TuiHeader,
    TuiTitle,
    TuiLabel,
    TuiTextfield,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiLoader,
    TuiButton,
    RouterLink,
    TuiComboBoxModule,
    TuiDataListComponent,
    TuiLet,
    NgIf,
    NgForOf,
    TuiOption,
    TuiDataList,
    TuiTextfieldControllerModule,
    TuiTextfield,
    CleanUrlPipe,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected inProgress = false;

  protected readonly contactForm = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl(''),
    email: new FormControl(''),
  });

  protected readonly form = new FormGroup({
    contact: this.contactForm,
    company: new FormControl(''),
  });

  private readonly alerts = inject(TuiAlertService);
  private mappedCompanies$ = new BehaviorSubject<CompanyResourceSummaryResponse[]>([]);
  private readonly searchCompanyRequest$ = new BehaviorSubject<string>('');
  private resolvedContact?: ContactResourceResponse;
  private resolvedCompany?: CompanyResourceSummaryResponse;

  constructor(private route: ActivatedRoute, private contactsService: ContactsService, private companyService: CompanyService) {
  }

  save() {
    this.inProgress = true;
    const companyFormValue = this.form.get('company')?.value;
    const contactFormValue = this.form.get('contact')?.value;

    if (this.resolvedContact?.id) {
      const updatedContact = {
        ...contactFormValue,
        id: this.resolvedContact?.id,
      };
      const o = this.contactsService.updateOne(updatedContact)
        .pipe(
          concatMap((contactResponse) => {
            const selectedCompany = companyFormValue;
            const isRelated = CleanUrl.transform(this.resolvedContact?._embedded?.company._links.self.href);
            const companyPropertyUrl = contactResponse._links.company.href;
            if (selectedCompany) {
              if (selectedCompany !== isRelated) {
                if (isRelated) {
                  return this.contactsService.createRelation(companyPropertyUrl, selectedCompany);
                }
                return this.contactsService.updateRelation(companyPropertyUrl, selectedCompany);
              }
            }
            if (!selectedCompany && isRelated) {
              return this.contactsService.deleteRelation(companyPropertyUrl, isRelated);
            }
            return of(contactResponse);
          })
        );
      this.subscribe(o);
      return;
    }

    const o = this.contactsService.createOne(contactFormValue)
      .pipe(
        concatMap((contactResponse) => {
          const selectedCompany = companyFormValue;
          const companyPropertyUrl = contactResponse._links.company.href;
          if (selectedCompany) {
            return this.contactsService.createRelation(CleanUrl.transform(companyPropertyUrl), selectedCompany);
          }
          return of(contactResponse);
        })
      )
    ;
    this.subscribe(o);
  }

  searchRequest(search?: string | null) {
    this.searchCompanyRequest$.next(search ?? '');

    return this.searchCompanyResponse$;
  }

  getCompanyData: (search?: string) => Observable<CompanyResourceCollectionResponse> = (search?: string) => {
    if (search && search.length && search.length > 0) {
      return this.companyService.getPageByName(search).pipe(map(response => response));
    }
    return this.companyService.getPage().pipe(map(response => response));
  };

  protected searchCompanyResponse$: Observable<ResourceSummaryResponse[]> = this.searchCompanyRequest$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((search) => {
      return this.getCompanyData(search ?? '').pipe(
        mergeMap((response) => {
          const companies = response._embedded.companies;
          const uniqueCompanies = UniqueId.filter(this.resolvedCompany ? [this.resolvedCompany, ...companies] : companies);
          this.mappedCompanies$.next(uniqueCompanies);
          return of(uniqueCompanies);
        }),
        startWith([] as CompanyResourceResponse[]),
      );
    }),
    share()
  );

  stringify = (href: string) => {
    return this.mappedCompanies$.value.filter(c => CleanUrl.transform(c?._links.self.href) === href)?.[0]?.name || '';
  };

  private subscribe = (o: Observable<any>) => o.subscribe({
    error: err => {
      this.alerts.open(context => {
        },
        {
          appearance: 'negative',
          label: 'Failed to save contact. Please try again later.'
        }).subscribe();
      this.inProgress = false;
    },
    next: value => {
      this.alerts.open(context => {
        },
        {
          appearance: 'positive',
          label: 'Successfully saved contact',
        }).subscribe();
      this.inProgress = false;
    },
    complete: () => {
      this.inProgress = false;
    }
  });

  private ngOnInit() {
    const resolvedContact = this.route.snapshot.data['resolved']?.['contact'];
    const resolvedCompany = this.route.snapshot.data['resolved']?.['company'];
    if (resolvedCompany) {
      this.resolvedCompany = resolvedCompany as CompanyResourceSummaryResponse;
      this.mappedCompanies$.next([this.resolvedCompany]);
    }
    if (resolvedContact) {
      this.resolvedContact = resolvedContact as ContactResourceResponse;
      const {_embedded, name, phone, email} = this.resolvedContact;
      const companyHref = _embedded?.company._links.self.href;

      this.form.patchValue({
        contact: {name, phone, email},
        company: CleanUrl.transform(companyHref),
      });
    }

  }

}
