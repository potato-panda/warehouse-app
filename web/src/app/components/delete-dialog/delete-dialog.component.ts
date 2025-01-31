import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TuiButton, TuiDialogContext} from '@taiga-ui/core';
import {Observable, of} from 'rxjs';
import {injectContext} from '@taiga-ui/polymorpheus';

type Input = {
  subject: string,
  submit: () => Observable<any>
}

@Component({
  selector: 'app-delete-dialog',
  imports: [
    ReactiveFormsModule,
    TuiButton
  ],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent {

  protected readonly context = injectContext<TuiDialogContext<Observable<any>, Input>>();

  get data(): Input {
    return this.context.data;
  }

  cancel() {
    this.context.completeWith(of());
  }

  submit() {
    this.context.completeWith(this.data.submit());
  }
}
