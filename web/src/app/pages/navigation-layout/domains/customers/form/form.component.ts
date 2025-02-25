import {Component, inject} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiScrollbar,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTitle
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {CustomersService, CustomersSummaryResourceResponse} from '../../../../../services/customers.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ContactsService} from '../../../../../services/contacts.service';
import {ResolvedData} from './details.resolver';
import {Contact} from '../../../../../interfaces/entities/contact';
import {WaIntersectionRoot} from '@ng-web-apis/intersection-observer';
import {
  TuiTable,
  TuiTableCell,
  TuiTableDirective,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThead,
  TuiTableThGroup,
  TuiTableTr
} from '@taiga-ui/addon-table';
import {TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {Address} from '../../../../../interfaces/entities/address';
import {CustomerCreateRequest, CustomerUpdateRequest} from '../../../../../interfaces/entities/customer';
import {concatMap, of} from 'rxjs';
import {AddressService} from '../../../../../services/address.service';

type ContactFormRow = {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  name: FormControl<string>,
  phone: FormControl<string>,
  email: FormControl<string | null>
};
type ContactFormArray = FormArray<FormGroup<ContactFormRow>>;
type ShippingAddressRow = {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  fullAddress: FormControl<string>,
};
type ShippingAddressesFormArray = FormArray<FormGroup<ShippingAddressRow>>;

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
    TuiTableCell,
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableThead,
    TuiTableTr,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTitle,
    RouterLink,
    TuiScrollbar,
    WaIntersectionRoot,
    TuiTable,
    NgIf,
    NgForOf,
    TuiTextfieldControllerModule,
    NgClass
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected inProgress = false;
  protected readonly customerForm = new FormGroup({
    id: new FormControl<string | number | null>(null),
    name: new FormControl<string>('', Validators.required),
    billingAddress: new FormControl<string>('', Validators.required),
    tin: new FormControl<string | null>(''),
    website: new FormControl<string | null>(''),
  });
  protected readonly form = new FormGroup({
    customer: this.customerForm,
    contacts: new FormArray<FormGroup>([]),
    shippingAddresses: new FormArray<FormGroup>([])
  });
  protected customer?: CustomersSummaryResourceResponse;
  protected contactColumns = ['name', 'phone', 'email', 'actions'];
  protected shippingAddressColumns = ['fullAddress', 'actions'];

  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private customerService: CustomersService,
              private contactsService: ContactsService,
              private addressService: AddressService,
  ) {
  }

  get contactsFormArray() {
    return this.form.get('contacts') as ContactFormArray;
  }

  get shippingAddressesFormArray() {
    return this.form.get('shippingAddresses') as ShippingAddressesFormArray;
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      const {customer, contacts, shippingAddresses} = data['resolved'] as ResolvedData;
      this.customer = customer;

      this.customerForm.patchValue(customer ?? {});
      for (const contact of contacts) {
        this.addContactRow(contact);
      }

      for (const address of shippingAddresses) {
        this.addShippingAddressRow(address);
      }

      this.form.updateValueAndValidity();
    });
  }

  save() {
    this.inProgress = true;
    const customerForm = this.form.get('customer');
    const contactsForm = this.contactsFormArray;
    const shippingAddressesForm = this.shippingAddressesFormArray;

    let request;

    if (this.form.dirty) {
      const customer = {
        ...customerForm!.value,
        contacts: contactsForm.controls.filter(control => control.dirty && control.valid).map(control => control.value),
        shippingAddresses: shippingAddressesForm.controls.filter(control => control.dirty && control.valid).map(control => control.value),
      };
      if (this.customer?.id && this.customerForm.dirty && this.customerForm.valid) {
        request = this.customerService.update(customer as CustomerUpdateRequest);
      } else {
        request = this.customerService.create(customer as CustomerCreateRequest);
      }
    }

    request && request.pipe(concatMap(res => {
      if (!res) throw Error('Error Response');
      return of(res);
    })).subscribe({
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe({complete: () => this.inProgress = false});
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe({complete: () => this.inProgress = false});

        this.router.navigate(['..'], {relativeTo: this.route}).then();
      },
      complete: () => this.inProgress = false
    });

  }

  protected addContactRow(contact?: Contact) {
    const _d = 'id' + Math.random().toString(16).slice(2);
    const row = new FormGroup({
      _d: new FormControl(_d, {nonNullable: true}),
      id: new FormControl(contact?.id ?? null,),
      name: new FormControl(contact?.name ?? '', {validators: [Validators.required], nonNullable: true}),
      phone: new FormControl(contact?.phone ?? '', {validators: [Validators.required], nonNullable: true}),
      email: new FormControl(contact?.email ?? '', {validators: [Validators.email]}),
    });
    this.contactsFormArray.push(row);
  }

  protected removeContactRow(_d?: string) {
    const index = this.contactsFormArray.controls.findIndex(fc => fc.value._d === _d);
    if (index != -1) {
      const id = this.contactsFormArray.controls[index]?.value?.id;
      if (id) {
        this.contactsService.deleteOne(id.toString()).subscribe();
      }

      this.contactsFormArray.removeAt(index);
    }
  }

  protected addShippingAddressRow(address?: Address) {
    const _d = 'id' + Math.random().toString(16).slice(2);
    const row = new FormGroup({
      _d: new FormControl(_d, {nonNullable: true}),
      id: new FormControl(address?.id ?? null,),
      fullAddress: new FormControl(address?.fullAddress ?? '', {
        validators: [Validators.required],
        nonNullable: true
      }),
    });
    this.shippingAddressesFormArray.push(row);
  }

  protected removeShippingAddressRow(_d?: string) {
    const index = this.shippingAddressesFormArray.controls.findIndex(fc => fc.value._d === _d);
    if (index != -1) {
      const id = this.shippingAddressesFormArray.controls[index]?.value?.id;
      if (id) {
        this.addressService.deleteOne(id.toString()).subscribe();
      }

      this.shippingAddressesFormArray.removeAt(index);
    }
  }
}
