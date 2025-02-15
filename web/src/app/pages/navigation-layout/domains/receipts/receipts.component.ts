import {Component, model} from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TuiButton, TuiLabel, TuiLoader, TuiTextfieldComponent, TuiTextfieldDirective} from '@taiga-ui/core';
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
import {ReceiptsService, ReceiptsTableCollectionResourceResponse} from '../../../../services/receipts.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-receipts',
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
    RouterLink
  ],
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.scss'
})
export class ReceiptsComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'company' | 'companyTin' | 'receivedBy' | 'receivedDate' | 'totalAmount' | null>(null);

  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);
  protected columns = ['company', 'companyTin', 'receivedBy', 'receivedDate', 'totalAmount', 'actions'];

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
  protected readonly data$: Observable<ReceiptsTableCollectionResourceResponse['_embedded']['receipts']> = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response._embedded.receipts),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );

  constructor(private receiptsService: ReceiptsService,
  ) {
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  private getData(search?: string): Observable<ReceiptsTableCollectionResourceResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.receiptsService.getTablePageByCompany(search, pageable).pipe(map(response => response));
    }
    return this.receiptsService.getTablePage(pageable).pipe(map(response => response));
  }
}
