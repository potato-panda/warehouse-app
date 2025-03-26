import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {TuiAlertService, TuiAppearance, TuiButton, TuiError, TuiLabel, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ResolvedData} from './details.resolver';
import {catchError, map, Observable, of, Subscription} from 'rxjs';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';
import {TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {Product} from '../../../../../interfaces/entities/product';
import {HttpErrorResponse} from '@angular/common/http';

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
    TuiTitle,
    RouterLink,
    TuiTextareaModule,
    TuiTextfieldControllerModule,
    TuiTextfield
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnDestroy {
  protected resolvedProduct!: ProductsResourceResponse;
  protected inProgress = false;

  protected productForm!: FormGroup;

  private readonly alerts = inject(TuiAlertService);
  private routeSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productsService: ProductsService
  ) {
  }

  ngOnInit() {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      sku: new FormControl(''),
      itemCode: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'blur'
      }),
      description: new FormControl(''),
      um: new FormControl(''),
    });

    this.routeSubscription = this.route.data.subscribe((data) => {
      if (data['resolved']) {
        this.resolvedProduct = data['resolved'] as ResolvedData;
        this.productForm.patchValue(this.resolvedProduct);
        this.productForm.controls['itemCode'].addAsyncValidators(control => this.uniqueItemCodeValidator(this.resolvedProduct.itemCode)(control));
      }
    });
  }

  save() {
    this.inProgress = true;
    const value = this.productForm.value;

    const updatedProduct = {
      id: this.resolvedProduct?.id,
      ...value,
    } as Product;

    let saveRequest$: Observable<ProductsResourceResponse>;

    if (updatedProduct.id) {
      saveRequest$ = this.productsService.updateOne(updatedProduct);
    } else {
      saveRequest$ = this.productsService.createOne(updatedProduct);
    }

    saveRequest$.subscribe({
      error: (err: HttpErrorResponse) => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe();
        this.inProgress = false;
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe();
        this.inProgress = false;

        this.router.navigate(['..'], {relativeTo: this.route}).then();
      },
      complete: () => this.inProgress = false
    });
  }

  uniqueItemCodeValidator(originalValue: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control) {
        return of(null);
      }

      const currentValue = (control.value || '').trim();

      if (!currentValue || currentValue === originalValue) {
        return of(null);
      }

      return this.productsService.doesItemCodeExists(currentValue).pipe(
        map((exists) => (exists ? {unique: true} : null)),
        catchError(() => of(null))
      );
    };
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();  // Clean up the subscription
    }
  }

}
