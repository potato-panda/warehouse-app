import {Component, inject, Injectable, OnInit} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {
  AbstractControl,
  AsyncValidator,
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
import {catchError, map, Observable, of} from 'rxjs';
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
export class FormComponent implements OnInit {
  protected resolvedProduct!: ProductsResourceResponse;
  protected inProgress = false;

  protected productForm!: FormGroup;

  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productsService: ProductsService,
              private uniqueItemCodeValidator: UniqueItemCodeValidator
  ) {
  }

  ngOnInit() {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      sku: new FormControl(''),
      itemCode: new FormControl('', {
        asyncValidators: [this.uniqueItemCodeValidator.validate.bind(this)],
        updateOn: 'blur'
      }),
      description: new FormControl(''),
      um: new FormControl(''),
    });

    this.route.data.subscribe((data) => {
      if (data['resolved']) {
        this.resolvedProduct = data['resolved'] as ResolvedData;
        this.productForm.patchValue(this.resolvedProduct);
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
}

@Injectable({providedIn: 'root'})
export class UniqueItemCodeValidator implements AsyncValidator {

  constructor(private productsService: ProductsService) {
  }

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.productsService.doesItemCodeExists(control.value).pipe(
      map((exists) => (exists ? {unique: 'Item code already exists'} : null)),
      catchError(() => of(null)),
    );
  }
}
