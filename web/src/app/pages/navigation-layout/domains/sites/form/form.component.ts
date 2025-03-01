import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiAlertService, TuiAppearance, TuiButton, TuiError, TuiLoader, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {SitesResourceResponse, SitesService} from '../../../../../services/sites.service';
import {ResolvedData} from './details.resolver';
import {AddressService} from '../../../../../services/address.service';
import {mergeMap, of} from 'rxjs';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiCardLarge,
    TuiForm,
    TuiTitle,
    TuiHeader,
    TuiTextfield,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiLoader,
    RouterLink,
    TuiButton
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  protected inProgress = false;

  protected readonly form = new FormGroup({
    id: new FormControl<string | number | null>(null),
    name: new FormControl('', Validators.required),
    address: new FormGroup({
      id: new FormControl<string | number | null>(null),
      fullAddress: new FormControl('', Validators.required),
    }),
  });
  private readonly alerts = inject(TuiAlertService);

  private resolvedSite: SitesResourceResponse | null = null;

  constructor(private route: ActivatedRoute,
              private sitesService: SitesService,
              private addressService: AddressService
  ) {
  }

  save() {
    this.inProgress = true;
    const formValue = this.form.value;
    const addressForm = this.form.get('address');

    let request;

    if (this.form.dirty && this.form.valid) {
      if (this.resolvedSite?.id) {
        request = this.sitesService.updateOne({
          id: this.resolvedSite?.id,
          name: formValue.name,
        }).pipe(mergeMap(response => {
          if (addressForm?.dirty && addressForm.valid) {
            return this.addressService.updateOne({
              id: addressForm?.value.id as string, fullAddress: addressForm?.value.fullAddress as string
            }).pipe(mergeMap(() => of(response)));
          }
          return of(response);
        }));
      } else {
        request = this.sitesService.createOne({
          name: this.form.value.name
        }).pipe(mergeMap(siteResponse => {
          return this.addressService.createOne({
            fullAddress: addressForm?.value.fullAddress as string
          }).pipe(mergeMap(addressResponse => {
            return this.sitesService.addAddress(siteResponse.id, addressResponse.id).pipe(mergeMap(() => of(siteResponse)));
          }));
        }));
      }

      request.subscribe({
        error: err => {
          this.alerts.open(context => {
            },
            {
              appearance: 'negative',
              label: 'Failed to save site. Please try again later.'
            }).subscribe();
          this.inProgress = false;
        },
        next: value => {
          this.alerts.open(context => {
            },
            {
              appearance: 'positive',
              label: 'Successfully saved site',
            }).subscribe();
          this.inProgress = false;
        },
        complete: () => {
          this.inProgress = false;
        }
      });
    }
  }

  ngOnInit() {
    if (this.route.snapshot.data?.['resolved']) {
      const {site} = this.route.snapshot.data['resolved'] as ResolvedData;
      if (site) {
        this.resolvedSite = site;

        this.form.patchValue(site as any);
      }
    }
  }
}
