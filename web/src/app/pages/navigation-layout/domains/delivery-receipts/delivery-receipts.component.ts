import {Component, model} from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  TuiButton,
  TuiFormatNumberPipe,
  TuiLabel,
  TuiLoader,
  TuiTextfieldComponent,
  TuiTextfieldDirective
} from '@taiga-ui/core';
import {TuiFade, TuiStatus} from '@taiga-ui/kit';
import {tuiIsFalsy, tuiIsPresent, TuiLet} from '@taiga-ui/cdk';
import {TuiMainComponent, TuiSubheaderCompactComponent} from '@taiga-ui/layout';
import {
  TuiTable,
  TuiTableCell,
  TuiTableDirective,
  TuiTablePagination,
  TuiTablePaginationEvent,
  TuiTableSortable,
  TuiTableSortBy,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThead,
  TuiTableThGroup,
  TuiTableTr
} from '@taiga-ui/addon-table';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  share,
  startWith,
  switchMap
} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {
  DeliveryReceiptsService,
  DeliveryReceiptsTableCollectionResourceResponse
} from '../../../../services/delivery-receipts.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-delivery-receipts',
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgForOf,
    NgIf,
    TuiButton,
    TuiFade,
    TuiLabel,
    TuiLet,
    TuiLoader,
    TuiMainComponent,
    TuiStatus,
    TuiSubheaderCompactComponent,
    TuiTableCell,
    TuiTableDirective,
    TuiTablePagination,
    TuiTableSortBy,
    TuiTableSortable,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableThead,
    TuiTableTr,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTable,
    RouterLink,
    TuiFormatNumberPipe
  ],
  templateUrl: './delivery-receipts.component.html',
  styleUrl: './delivery-receipts.component.scss'
})
export class DeliveryReceiptsComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'customer' | 'po' | 'receivedBy' | 'receivedDate' | 'totalAmount' | null>(null);

  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);
  protected columns = ['customer', 'po', 'receivedBy', 'receivedDate', 'totalAmount', 'actions'];

  protected readonly request$ = combineLatest([
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$
  ]).pipe(
    debounceTime(0),
    switchMap(([search]) => this.getData(search).pipe(startWith(null))),
    share(),
  );
  protected readonly loading$ = this.request$.pipe(map(tuiIsFalsy));
  protected readonly total$ = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response.page.totalElements),
    startWith(0),
  );
  protected readonly data$: Observable<DeliveryReceiptsTableCollectionResourceResponse['_embedded']['deliveryReceipts']> = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response._embedded.deliveryReceipts),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );

  constructor(private receiptsService: DeliveryReceiptsService,
  ) {
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  private getData(search?: string): Observable<DeliveryReceiptsTableCollectionResourceResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.receiptsService.getTablePageByCustomer(search, pageable).pipe(map(response => response));
    }
    return this.receiptsService.getTablePage(pageable).pipe(map(response => response));
  }
}
