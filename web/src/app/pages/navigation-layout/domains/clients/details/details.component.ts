import {Component} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CompanyService, ResourceResponse} from '../../../../../services/company.service';
import {Company} from '../../../../../interfaces/entities/company';
import {TuiAlertService, TuiAppearance, TuiButton, TuiError, TuiLoader, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe} from '@angular/common';

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
  protected pageResponse!: ResourceResponse;
  protected company!: Company;

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

  constructor(private route: ActivatedRoute, private service: CompanyService, private alert: TuiAlertService) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.pageResponse = data['client'];
      this.company = this.pageResponse;

      this.companyForm.patchValue(this.company ?? {});
      this.contactForm.patchValue(this.company.contact[0] ?? {});
    });
  }

  save() {
    this.inProgress = true;
    const company = this.mainForm.get('company')?.value;
    const contact = this.mainForm.get('contact')?.value;
    const toSave = {
      id: this.company.id,
      ...company,
      contact: [contact]
    };
    this.service.updateOne(toSave).subscribe({
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
