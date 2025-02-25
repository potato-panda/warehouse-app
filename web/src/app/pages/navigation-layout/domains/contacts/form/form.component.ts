import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiLoader,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {ContactsResourceResponse, ContactsService,} from '../../../../../services/contacts.service';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe} from '@angular/common';
import {TuiComboBoxModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {ActivatedRoute, RouterLink} from '@angular/router';
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
    TuiTextfieldControllerModule,
    TuiTextfield,

  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected inProgress = false;

  protected readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl(''),
    email: new FormControl(''),
  });

  private readonly alerts = inject(TuiAlertService);
  private resolvedContact?: ContactsResourceResponse;

  constructor(private route: ActivatedRoute, private contactsService: ContactsService) {
  }

  save() {
    this.inProgress = true;
    const formValue = this.form.value;

    let request;

    if (this.resolvedContact?.id) {
      request = this.contactsService.updateOne({
        ...formValue,
        id: this.resolvedContact?.id,
      });
    } else {
      request = this.contactsService.createOne(formValue);
    }

    request.subscribe({
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
  }

  private ngOnInit() {
    const {contact} = this.route.snapshot.data['resolved'] as ResolvedData;
    if (contact) {
      this.resolvedContact = contact;
      const {name, phone, email} = this.resolvedContact;

      this.form.patchValue({name, phone, email});
    }
  }

}
