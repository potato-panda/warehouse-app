import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import {
  TuiButton,
  TuiDateFormat,
  TuiDialogContext,
  TuiError,
  TuiLabel,
  TuiLoader,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective
} from '@taiga-ui/core';
import {TuiForm} from '@taiga-ui/layout';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TuiFieldErrorPipe} from '@taiga-ui/kit';
import {DeliveryReceipt, DeliveryReceiptCreateRequest} from '../../../../../../interfaces/entities/delivery-receipt';
import {TuiInputDateModule, TuiTextfieldControllerModule} from '@taiga-ui/legacy';
import {TuiDay} from '@taiga-ui/cdk';
import {ComboBoxComponent} from '../../../../../../components/combo-box/combo-box.component';
import {BehaviorSubject, map, mergeMap, Observable, of, startWith, Subject, takeUntil, tap, withLatestFrom} from 'rxjs';
import {SitesResourceResponse, SitesService} from '../../../../../../services/sites.service';
import UniqueId from '../../../../../../utils/unique-id';

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
    TuiDateFormat,
    ComboBoxComponent,
    TuiLoader,
    TuiTextfieldOptionsDirective
  ],
  templateUrl: './delivery-receipt-dialog.component.html',
  styleUrl: './delivery-receipt-dialog.component.scss'
})
export class DeliveryReceiptDialogComponent implements OnInit {
  public readonly context = injectContext<TuiDialogContext<DeliveryReceiptCreateRequest & {
    siteId?: string | number;
  } | void, {
    deliveryReceipt: DeliveryReceipt | null
  }>>();

  public readonly sitesService = inject(SitesService);
  public readonly cdr = inject(ChangeDetectorRef);

  protected form = new FormGroup({
    id: new FormControl<string | number>(''),
    po: new FormControl<string>(''),
    siteId: new FormControl<string | number | null>(null),
    receivedDate: new FormControl<TuiDay | null>(null),
    receivedBy: new FormControl(''),
    paymentDueDate: new FormControl<TuiDay | null>(null),
    chequeNumber: new FormControl('')
  });
  private resolvedSite$ = new BehaviorSubject<SitesResourceResponse | null>(null);
  private mappedSites$ = new BehaviorSubject<SitesResourceResponse[]>([]);
  private destroy$ = new Subject<void>();

  protected get data() {
    return this.context.data;
  }

  ngOnInit(): void {
    const deliveryReceipt = this.data?.deliveryReceipt;
    if (deliveryReceipt) {
      const {id, po, site, paymentDueDate, receivedDate, chequeNumber, receivedBy} = deliveryReceipt;

      new Promise<void>(resolve => {
        if (site) {
          this.sitesService.getOne(site.id).pipe(
            takeUntil(this.destroy$),
            tap(response => {
              this.resolvedSite$.next(response);
              this.mappedSites$.next([response]);
              resolve();
            })
          ).subscribe();
        }
      }).then(r => {
        this.form.patchValue({
          id,
          po,
          siteId: site?.id,
          receivedBy,
          receivedDate: receivedDate ? TuiDay.fromLocalNativeDate(new Date(receivedDate)) : null,
          paymentDueDate: paymentDueDate ? TuiDay.fromLocalNativeDate(new Date(paymentDueDate)) : null,
          chequeNumber,
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected searchSite: (search: string) => Observable<SitesResourceResponse[]>
    = search => {
    let results: Observable<SitesResourceResponse[]>;
    if (search && search.length && search.length > 0) {
      results = this.sitesService.getPageByName(search).pipe(map(response => response._embedded.sites));
    } else {
      results = this.sitesService.getPage().pipe(map(response => response._embedded.sites));
    }
    return results.pipe(
      withLatestFrom(this.resolvedSite$),
      mergeMap(([response, resolved]) => {
        const uniqueSites = UniqueId.filter(resolved ? [resolved, ...response] : [...response]);
        this.mappedSites$.next(uniqueSites);
        return of(uniqueSites);
      }),
      startWith([]),
    );
  };

  protected stringifySite = (siteId?: string | number) => {
    return siteId ? (this.mappedSites$.value.filter(s => Number(s.id) === Number(siteId))?.[0])?.name ?? '' : '';
  };

  protected toSiteId: (item: SitesResourceResponse) => string = item => {
    return item.id.toString() ?? '';
  };

  protected submit(): void {
    const {id, po, siteId, receivedBy, receivedDate, chequeNumber, paymentDueDate} = this.form.value;
    this.context.completeWith({
      id,
      po,
      siteId,
      receivedBy,
      receivedDate: receivedDate?.toLocalNativeDate().toISOString(),
      chequeNumber,
      paymentDueDate: paymentDueDate?.toLocalNativeDate().toISOString()
    } as DeliveryReceiptCreateRequest);
  }
}
