import {Component, inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiScrollbar,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ContactsService} from '../../../../../services/contacts.service';
import {concatMap, of} from 'rxjs';
import {Contact} from '../../../../../interfaces/entities/contact';
import {Address} from '../../../../../interfaces/entities/address';
import {ResolvedData} from './details.resolver';
import {SuppliersResourceResponse, SuppliersService} from '../../../../../services/suppliers.service';
import {SupplierCreateRequest, SupplierUpdateRequest} from '../../../../../interfaces/entities/supplier';
import {AddressService} from '../../../../../services/address.service';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {WaIntersectionRoot} from '@ng-web-apis/intersection-observer';
import {TuiTable} from '@taiga-ui/addon-table';

type ContactFormRow = {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  name: FormControl<string>,
  phone: FormControl<string>,
  email: FormControl<string | null>
};
type ContactFormArray = FormArray<FormGroup<ContactFormRow>>;
type AddressRow = {
  _d: FormControl<string>,
  id: FormControl<string | number | null>,
  fullAddress: FormControl<string>,
};
type AddressesFormArray = FormArray<FormGroup<AddressRow>>;

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    WaIntersectionRoot,
    TuiScrollbar,
    TuiTable,
    NgClass,
    NgForOf,
    NgIf,
    TuiButton,
    RouterLink
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected inProgress = false;
  protected readonly supplierForm = new FormGroup({
    id: new FormControl<string | number | null>(null),
    name: new FormControl<string>('', Validators.required),
  });
  protected readonly form = new FormGroup({
    supplier: this.supplierForm,
    contacts: new FormArray<FormGroup>([]),
    addresses: new FormArray<FormGroup>([])
  });
  protected supplier?: SuppliersResourceResponse;
  protected contactColumns = ['name', 'phone', 'email', 'actions'];
  protected addressColumns = ['fullAddress', 'actions'];

  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private supplierService: SuppliersService,
              private contactsService: ContactsService,
              private addressService: AddressService
  ) {
  }

  get contactsFormArray() {
    return this.form.get('contacts') as ContactFormArray;
  }

  get addressesFormArray() {
    return this.form.get('addresses') as AddressesFormArray;
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      const {supplier, contacts, addresses} = data['resolved'] as ResolvedData;
      this.supplier = supplier;

      this.supplierForm.patchValue(supplier ?? {});

      for (const contact of contacts) {
        this.addContactRow(contact);
      }

      for (const address of addresses) {
        this.addAddressRow(address);
      }

      this.form.updateValueAndValidity();
    });
  }

  save() {
    this.inProgress = true;
    const supplierForm = this.form.get('supplier');
    const contactsForm = this.contactsFormArray;
    const addressesForm = this.addressesFormArray;

    let request;

    if (this.form.dirty && this.form.valid) {
      const supplier = {
        ...supplierForm!.value,
        contacts: contactsForm.controls.filter(control => control.dirty && control.valid).map(control => control.value),
        addresses: addressesForm.controls.filter(control => control.dirty && control.valid).map(control => control.value),
      };

      if (this.supplier?.id) {
        request = this.supplierService.update(supplier as SupplierUpdateRequest);
      } else {
        request = this.supplierService.create(supplier as SupplierCreateRequest);
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

  protected addAddressRow(address?: Address) {
    const _d = 'id' + Math.random().toString(16).slice(2);
    const row = new FormGroup({
      _d: new FormControl(_d, {nonNullable: true}),
      id: new FormControl(address?.id ?? null,),
      fullAddress: new FormControl(address?.fullAddress ?? '', {
        validators: [Validators.required],
        nonNullable: true
      }),
    });
    this.addressesFormArray.push(row);
  }

  protected removeAddressRow(_d?: string) {
    const index = this.addressesFormArray.controls.findIndex(fc => fc.value._d === _d);
    if (index != -1) {
      const id = this.addressesFormArray.controls[index]?.value?.id;
      if (id) {
        this.addressService.deleteOne(id.toString()).subscribe();
      }

      this.addressesFormArray.removeAt(index);
    }
  }
}
