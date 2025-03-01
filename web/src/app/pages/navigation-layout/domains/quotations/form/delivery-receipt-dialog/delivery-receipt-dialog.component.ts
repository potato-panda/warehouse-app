import {Component, OnInit} from '@angular/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import {
  TuiButton,
  TuiDateFormat,
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
import {DeliveryReceipt, DeliveryReceiptCreateRequest} from '../../../../../../interfaces/entities/delivery-receipt';
import {TuiInputDateModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {TuiDay} from '@taiga-ui/cdk';

@Component({
  selector: 'app-delivery-receipt-dialog',
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
    TuiTextfieldControllerModule,
    TuiDateFormat
  ],
  templateUrl: './delivery-receipt-dialog.component.html',
  styleUrl: './delivery-receipt-dialog.component.scss'
})
export class DeliveryReceiptDialogComponent implements OnInit {
  public readonly context = injectContext<TuiDialogContext<DeliveryReceiptCreateRequest | void, {
    deliveryReceipt: DeliveryReceipt | null
  }>>();
  protected form = new FormGroup({
    id: new FormControl<string | number>(''),
    receivedDate: new FormControl<TuiDay | null>(null, Validators.required),
    receivedBy: new FormControl('', Validators.required),
    paymentDueDate: new FormControl<TuiDay | null>(null),
    chequeNumber: new FormControl('')
  });
  protected readonly TuiDateFormat = TuiDateFormat;

  protected get data() {
    return this.context.data;
  }

  ngOnInit(): void {
    const deliveryReceipt = this.data?.deliveryReceipt;
    if (deliveryReceipt) {
      const {id, paymentDueDate, receivedDate, chequeNumber, receivedBy} = deliveryReceipt;
      this.form.patchValue({
        id,
        receivedBy,
        receivedDate: receivedDate ? TuiDay.fromLocalNativeDate(new Date(receivedDate)) : null,
        paymentDueDate: paymentDueDate ? TuiDay.fromLocalNativeDate(new Date(paymentDueDate)) : null,
        chequeNumber,
      });
    }
  }

  protected submit(): void {
    const {id, receivedBy, receivedDate, chequeNumber, paymentDueDate} = this.form.value;
    this.context.completeWith({
      id,
      receivedBy,
      receivedDate: receivedDate?.toLocalNativeDate().toISOString(),
      chequeNumber,
      paymentDueDate: paymentDueDate?.toLocalNativeDate().toISOString()
    } as DeliveryReceiptCreateRequest);
  }
}
