import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TuiButton, TuiDialogContext} from '@taiga-ui/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import {TuiForm} from '@taiga-ui/layout';

@Component({
  selector: 'app-delete-dialog',
  imports: [
    ReactiveFormsModule,
    TuiButton,
    TuiForm
  ],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent {

  public readonly context = injectContext<TuiDialogContext<boolean, string>>();
  protected value: string | null = null;

  protected cancel(): void {
    this.context.completeWith(false);
  }

  protected submit(): void {
    this.context.completeWith(true);
  }

}
