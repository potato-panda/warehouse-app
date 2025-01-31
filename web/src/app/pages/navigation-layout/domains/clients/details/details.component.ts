import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CompanyService, ResourceWithContactsResponse} from '../../../../../services/company.service';
import {CompanyWithContacts} from '../../../../../interfaces/entities/company';
import {TuiAlertService, TuiAppearance, TuiButton, TuiError, TuiLoader, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe} from '@angular/common';
import {ContactsService} from '../../../../../services/contacts.service';

@Component({
  selector: 'app-details',
  imports: [
    RouterLink,
    TuiButton,
    TuiForm,
    ReactiveFormsModule,
    TuiHeader,
    TuiTitle,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiLoader,
    TuiTextfield,
    TuiAppearance,
    TuiCardLarge
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  protected pageResponse!: ResourceWithContactsResponse;
  protected company!: CompanyWithContacts;

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

  constructor(private route: ActivatedRoute,
              private companyService: CompanyService,
              private contactsService: ContactsService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.pageResponse = data['client'];
      this.company = this.pageResponse;

      this.companyForm.patchValue(this.company ?? {});
      this.contactForm.patchValue(this.company.contacts[0] ?? {});
    });
  }

  save() {
    // this.inProgress = true;
    const companyFormValue = this.mainForm.get('company')?.value;
    const contactFormValue = this.mainForm.get('contact')?.value;
    const updatedCompany = {
      id: this.company.id,
      ...companyFormValue,
    };
    const updatedContact = {
      // id: this.company.contacts[0]?.id ?? undefined,
      // company: updatedCompany,
      ...contactFormValue,
    };

    const toSave = {
      ...updatedCompany,
      contacts: [
        // updatedContact
        {
          name: 'name'
        }
      ]
    };

    this.companyService.updateOne(toSave).subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe(() => {
          this.inProgress = false;
        });
      },
      next: value => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe(() => {
          this.inProgress = false;
        });
      },
      complete: () => {
        this.inProgress = false;
      }
    });

    // concat(this.companyService.updateOne(updatedCompany), this.contactsService.updateOne(updatedContact)).subscribe({
    //   error: err => {
    //     this.alerts.open(context => {
    //       },
    //       {
    //         appearance: 'negative',
    //         label: 'Save failed. Please try again later.'
    //       }).subscribe(() => {
    //       this.inProgress = false;
    //     });
    //   },
    //   next: value => {
    //     this.alerts.open(context => {
    //       },
    //       {
    //         appearance: 'positive',
    //         label: 'Save successful!',
    //       }).subscribe(() => {
    //       this.inProgress = false;
    //     });
    //   },
    //   complete: () => {
    //     this.inProgress = false;
    //   }
    // });
  }

}
