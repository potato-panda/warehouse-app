import {Component, ContentChild, forwardRef, Input, OnInit, output, TemplateRef} from '@angular/core';
import {BehaviorSubject, debounceTime, distinctUntilChanged, Observable, share, startWith, switchMap} from 'rxjs';
import {TuiDataList, TuiLoader, TuiSizeL, TuiSizeS} from '@taiga-ui/core';
import {AsyncPipe, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {TuiComboBoxModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {TuiLet} from '@taiga-ui/cdk';

@Component({
  selector: 'app-combo-box',
  imports: [
    TuiDataList,
    TuiLoader,
    AsyncPipe,
    TuiComboBoxModule,
    TuiLet,
    TuiTextfieldControllerModule,
    NgTemplateOutlet,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
  ],
  templateUrl: './combo-box.component.html',
  styleUrl: './combo-box.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboBoxComponent),
      multi: true,
    },
  ]
})
export class ComboBoxComponent<T extends any> implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = 'Placeholder';
  @Input() searchFn!: (search: string) => Observable<T[]>;
  @Input() debounceTime: number = 300;
  @Input() tuiTextfieldSize: TuiSizeL | TuiSizeS = 'l';
  @Input() tuiTextfieldCleaner: boolean = true;
  @Input('valueContent') valueContent?: TemplateRef<any>;
  @ContentChild('labelTemplate') labelTemplate?: TemplateRef<any>;
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ContentChild('loadingTemplate') loadingTemplate?: TemplateRef<any>;
  @Input() disabled: boolean = false;
  protected value = output<T | null>();
  protected searchResponse$!: Observable<T[]>;
  private _value: any = null;
  private searchRequest$ = new BehaviorSubject<string>('');
  private touched = false;

  @Input() identityMatcher: (item1: T, item2: any) => boolean = (item1, item2) => item1 === item2;

  @Input() stringify: (item: string) => string = (item) => String(item);

  @Input() valueFn: (item: T) => string = (item) => String(item);

  onChange: any = () => {
  };

  onTouched: any = () => {
  };

  ngOnInit(): void {
    this.searchResponse$ = this.searchRequest$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      switchMap((search) => this.searchFn(search).pipe(startWith([]))),
      share()
    );
  }

  writeValue(value: string | null): void {
    this._value = value;
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  onSearchChange(search: string | null): void {
    this.searchRequest$.next(search ?? '');
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  onItemSelected = (value: T) => {
    this.markAsTouched();
    this.value.emit(value);
    this.onChange(value);
  };
}
