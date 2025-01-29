import {Component} from '@angular/core';
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

  constructor(private service: CompanyService, private alert: TuiAlertService) {
  }

  ngOnInit() {
  }

  save() {
    this.inProgress = true;
    const company = this.mainForm.get('company')?.value;
    const contact = this.mainForm.get('contact')?.value;
    const toSave = {
      ...company,
      contact: [contact]
    };
    this.service.createOne(toSave).subscribe({
      error: err => {
        this.alert.open(context => {
          },
          {
            appearance: 'negative',
            label: 'Save failed. Please try again later.'
          }).subscribe();
      },
      next: value => {
        this.alert.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe();
      },
      complete: () => {
        this.inProgress = false;
      }
    });
  }

}
