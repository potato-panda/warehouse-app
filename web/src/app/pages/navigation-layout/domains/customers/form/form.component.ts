import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTitle
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {CompaniesSummaryResourceResponse, CompanyService} from '../../../../../services/company.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ContactsResourceResponse, ContactsService} from '../../../../../services/contacts.service';
import {ResolvedData} from './details.resolver';
import {concatMap, forkJoin, map, mergeMap, Observable, of} from 'rxjs';

@Component({
  selector: 'app-form',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiHeader,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTitle,
    RouterLink
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected company?: CompaniesSummaryResourceResponse;
  protected inProgress = false;
  protected readonly companyForm = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl(''),
    billingAddress: new FormControl(''),
    tin: new FormControl(''),
    website: new FormControl(''),
  });
  protected readonly contactForm = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl(''),
    email: new FormControl(''),
  });
  protected readonly mainForm = new FormGroup({
    company: this.companyForm,
    contact: this.contactForm
  });
  private contact?: ContactsResourceResponse;
  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companyService: CompanyService,
              private contactsService: ContactsService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data?.['resolved']) {
        const {company, contact} = data['resolved'] as ResolvedData;
        if (company) {
          this.company = company;
        }
        if (contact) {
          this.contact = contact;
        }
      }

      this.companyForm.patchValue(this.company ?? {});
      this.contactForm.patchValue(this.contact ?? {});
    });
  }

  save(back?: boolean) {
    this.inProgress = true;
    const companyForm = this.mainForm.get('company');
    const contactForm = this.mainForm.get('contact');

    const updatedCompany = {
      id: this.company?.id,
      ...companyForm?.value,
    };
    const updatedContact = {
      id: this.contact?.id,
      ...contactForm?.value,
    };

    new Observable<{ company: CompaniesSummaryResourceResponse, contact: ContactsResourceResponse }>(subscriber => {
      const requests: Record<'company' | 'contact', Observable<any>> = {} as any;

      if (companyForm?.dirty) {
        requests['company'] = !updatedCompany.id
          ? this.companyService.createOne(updatedCompany)
          : this.companyService.updateOne(updatedCompany);
      }

      if (contactForm?.dirty) {
        requests['contact'] = !updatedContact.id
          ? this.contactsService.createOne(updatedContact)
          : this.contactsService.updateOne(updatedContact);
      }

      if (Object.keys(requests).length === 0) {
        subscriber.complete();
        return;
      }

      let saveProcess$: Observable<any>;

      if (!updatedCompany.id) {
        // Create company first, then contact
        saveProcess$ = requests['company'].pipe(
          concatMap(companySaveResponse => {
            if (requests['contact']) {
              return requests['contact'].pipe(
                mergeMap(contactSaveResponse => {
                  if ((contactSaveResponse || this.company) && !updatedContact.id) {
                    return this.contactsService.updateRelation(
                      contactSaveResponse?._links.resolvedInventory.href,
                      companySaveResponse?._links.self.href || this.company?._links.self.href
                    ).pipe(
                      map(() => ({company: companySaveResponse, contact: contactSaveResponse}))
                    );
                  }
                  return of({company: companySaveResponse, contact: contactSaveResponse});
                })
              );
            }
            return of({company: companySaveResponse, contact: undefined});
          })
        );
      } else {
        // Company already exists, update both at the same time
        saveProcess$ = forkJoin(requests).pipe(
          mergeMap(responseMap => {
            const companySaveResponse = responseMap['company'];
            const contactSaveResponse = responseMap['contact'];

            if ((contactSaveResponse || this.company) && !updatedContact.id) {
              return this.contactsService.updateRelation(
                contactSaveResponse?._links.resolvedInventory.href,
                companySaveResponse?._links.self.href || this.company?._links.self.href
              ).pipe(
                map(() => ({company: companySaveResponse, contact: contactSaveResponse}))
              );
            }
            return of({company: companySaveResponse, contact: contactSaveResponse});
          })
        );
      }
      saveProcess$.subscribe({
        next: value => {
          subscriber.next(value);
          subscriber.complete();
        }
      });
    }).subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe(() => {
          this.inProgress = false;
        });
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe(() => {
          this.inProgress = false;
        });

        if (back) {
          this.router.navigate(['..'], {relativeTo: this.route}).then();
        }
        if (value?.company) {
          this.router.navigate(['..', `${value.company.id}`], {relativeTo: this.route}).then();
        }
      },
      complete: () => this.inProgress = false
    });
  }
}
