import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTitle
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ResolvedData} from './details.resolver';
import {Observable} from 'rxjs';
import {ProductsResourceResponse, ProductsService} from '../../../../../services/products.service';
import {TuiTextareaModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {Product} from '../../../../../interfaces/entities/product';

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
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTitle,
    RouterLink,
    TuiTextareaModule,
    TuiTextfieldControllerModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  protected resolvedProduct!: ProductsResourceResponse;
  protected inProgress = false;

  protected readonly productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    sku: new FormControl(''),
    itemCode: new FormControl(''),
    description: new FormControl(''),
    price: new FormControl(0),
    um: new FormControl(''),
    umAmount: new FormControl(0),
  });

  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productsService: ProductsService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['resolved']) {
        this.resolvedProduct = data['resolved'] as ResolvedData;
        this.productForm.patchValue(this.resolvedProduct);
      }
    });
  }

  save(back?: boolean) {
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
      error: err => {
        this.alerts.open(context => 'Please try again later.',
          {
            appearance: 'negative',
            label: 'Save failed'
          }).subscribe(() => {
          this.inProgress = false;
        });
      },
      next: (value) => {
        this.alerts.open(context => {
          },
          {
            appearance: 'positive',
            label: 'Save successful!',
          }).subscribe(() => {
          this.inProgress = false;
        });

        if (back) {
          this.router.navigate(['..'], {relativeTo: this.route}).then();
        }
        if (value.id) {
          this.router.navigate(['..', `${value.id}`], {relativeTo: this.route}).then();
        }
      },
      complete: () => this.inProgress = false
    });
  }
}
