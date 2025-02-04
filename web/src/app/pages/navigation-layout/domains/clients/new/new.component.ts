import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiLoader,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTitle
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {CompanyService} from '../../../../../services/company.service';
import {concatMap, of} from 'rxjs';
import {ContactsService} from '../../../../../services/contacts.service';
import IsEmptyObject from '../../../../../utils/is-empty-object';

@Component({
  selector: 'app-new',
  imports: [
    RouterLink,
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
    TuiLoader,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTitle
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent {
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

  private readonly alerts = inject(TuiAlertService);

  constructor(private companyService: CompanyService, private contactService: ContactsService) {
  }

  ngOnInit() {
  }

  save() {
    this.inProgress = true;
    const companyFormValue = this.mainForm.get('company')?.value;
    const contactFormValue = this.mainForm.get('contact')?.value;
    const isContactFormValueEmpty = IsEmptyObject.evaluate(contactFormValue);

    this.companyService.createOne(companyFormValue)
      .pipe(
        concatMap((companyResponse) => {
          if (!isContactFormValueEmpty) {
            return this.contactService.createOne(contactFormValue).pipe(
              concatMap(contactResponse => {
                return this.contactService.updateRelation(contactResponse._links.contact.href, companyResponse._links.self.href);
              })
            );
          }

          return of(companyResponse);
        })
      )
      .subscribe({
        error: err => {
          this.alerts.open(context => {
            },
            {
              appearance: 'negative',
              label: 'Save failed. Please try again later.'
            }).subscribe();
          this.inProgress = false;
        },
        next: value => {
          this.alerts.open(context => {
            },
            {
              appearance: 'positive',
              label: 'Save successful!',
            }).subscribe();
          this.inProgress = false;
        },
        complete: () => {
          this.inProgress = false;
        }
      });
  }

}
