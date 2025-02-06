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
  CompaniesCollectionResourceResponse,
  CompaniesSummaryResourceResponse,
  CompanyService,
} from '../../../../../services/company.service';
import {ContactsResourceResponse, ContactsService,} from '../../../../../services/contacts.service';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {TuiComboBoxModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TuiLet} from '@taiga-ui/cdk';
import CleanUrl from '../../../../../utils/clean-url';
import {CleanUrlPipe} from '../../../../../pipes/clean-url.pipe';
import UniqueId from '../../../../../utils/unique-id';
import {ResolvedData} from './details.resolver';

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
  private mappedCompanies$ = new BehaviorSubject<CompaniesSummaryResourceResponse[]>([]);
  private readonly searchCompanyRequest$ = new BehaviorSubject<string>('');
  private resolvedContact?: ContactsResourceResponse;
  private resolvedCompany?: CompaniesSummaryResourceResponse;

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

  getCompanyData: (search?: string) => Observable<CompaniesCollectionResourceResponse> = (search?: string) => {
    if (search && search.length && search.length > 0) {
      return this.companyService.getPageByName(search).pipe(map(response => response));
    }
    return this.companyService.getPage().pipe(map(response => response));
  };

  protected searchCompanyResponse$: Observable<CompaniesSummaryResourceResponse[]> = this.searchCompanyRequest$.pipe(
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
        startWith([] as CompaniesSummaryResourceResponse[]),
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
    const {contact, company} = this.route.snapshot.data['resolved'] as ResolvedData;
    if (company) {
      this.resolvedCompany = company;
      this.mappedCompanies$.next([this.resolvedCompany]);
    }
    if (contact) {
      this.resolvedContact = contact;
      const {_embedded, name, phone, email} = this.resolvedContact;
      const companyHref = _embedded?.company._links.self.href;

      this.form.patchValue({
        contact: {name, phone, email},
        company: CleanUrl.transform(companyHref),
      });
    }

  }

}
