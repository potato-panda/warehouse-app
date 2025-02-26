import {Component} from '@angular/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import {
  TuiButton,
  TuiDialogContext,
  TuiError,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective
} from '@taiga-ui/core';
import {TuiForm} from '@taiga-ui/layout';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {DeliveryReceiptCreateRequest} from '../../../../../../interfaces/entities/delivery-receipt';
import {TuiInputDateModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {TuiDay} from '@taiga-ui/cdk';

@Component({
  selector: 'app-create-delivery-receipt-dialog',
  imports: [
    TuiButton,
    TuiForm,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiInputDateModule,
    TuiTextfieldControllerModule
  ],
  templateUrl: './create-delivery-receipt-dialog.component.html',
  styleUrl: './create-delivery-receipt-dialog.component.scss'
})
export class CreateDeliveryReceiptDialogComponent {

  public readonly context = injectContext<TuiDialogContext<DeliveryReceiptCreateRequest | void, string>>();

  protected form = new FormGroup({
    receivedDate: new FormControl(TuiDay.currentUtc(), {validators: Validators.required, nonNullable: true}),
    receivedBy: new FormControl('', {validators: Validators.required, nonNullable: true})
  });

  protected submit(): void {
    const {receivedBy, receivedDate} = this.form.value;
    this.context.completeWith({
      receivedBy,
      receivedDate: receivedDate?.toUtcNativeDate().toISOString()
    } as DeliveryReceiptCreateRequest);
  }

}
