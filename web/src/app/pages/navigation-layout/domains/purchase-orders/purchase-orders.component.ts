import {Component, inject, model} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiDataListComponent,
  TuiDialogService,
  TuiDropdown,
  TuiDropdownOpen, TuiFormatNumberPipe,
  TuiLabel,
  TuiLink,
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
  mergeMap,
  Observable,
  of,
  share,
  startWith,
  switchMap
} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';
import {DeleteDialogComponent} from '../../../../components/delete-dialog/delete-dialog.component';
import {RouterLink} from '@angular/router';
import {PurchaseOrderTable} from '../../../../interfaces/entities/purchase-order';
import {
  PurchaseOrdersService,
  PurchaseOrdersTableCollectionResourceResponse
} from '../../../../services/purchase-orders.service';

@Component({
  selector: 'app-purchase-orders',
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TuiButton,
    TuiDataListComponent,
    TuiDropdownOpen,
    TuiFade,
    TuiLabel,
    TuiLet,
    TuiLink,
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
    RouterLink,
    FormsModule,
    TuiDropdown,
    TuiTable,
    TuiFormatNumberPipe
  ],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'supplier' | 'preparedBy' | 'checkedBy' | 'approvedBy' | 'receivedBy' | 'totalAmount' | null>(null);

  protected readonly refresh$ = new BehaviorSubject<void>(undefined);
  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);
  protected columns = ['supplier', 'preparedBy', 'checkedBy', 'approvedBy', 'receivedBy', 'totalAmount', 'actions'];

  protected readonly request$ = combineLatest([
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$,
    this.refresh$
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
  protected readonly data$: Observable<PurchaseOrdersTableCollectionResourceResponse['_embedded']['purchaseOrders']> = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response._embedded.purchaseOrders),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(private purchaseOrdersService: PurchaseOrdersService,
  ) {
  }

  refreshData() {
    this.refresh$.next();
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  protected showDeleteDialog({id, supplier}: PurchaseOrderTable): void {
    const subject = `Purchase Order${supplier?.name ? ' for ' + supplier.name : ''}`;
    this.dialogs.open<Observable<any>>(new PolymorpheusComponent(DeleteDialogComponent), {
      dismissible: true,
      closeable: true,
      label: 'Delete?',
      size: 'm',
      data: {subject}
    }).pipe(mergeMap(value => value ? this.purchaseOrdersService.deleteOne(id as string) : of()))
      .subscribe({
        error: err => {
          this.alerts.open(context => {
          }, {
            appearance: 'negative',
            label: `Error deleting ${subject}`
          });
        },
        next: response => {
          if (response) {
            this.alerts.open(context => {
            }, {
              appearance: 'positive',
              label: `Successfully deleted ${subject}`
            }).subscribe();
            this.refreshData();
          }
        },
        complete: () => {
        }
      });
  }

  private getData(search?: string): Observable<PurchaseOrdersTableCollectionResourceResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.purchaseOrdersService.getPageTableBySupplier(search, pageable).pipe(map(response => response));
    }
    return this.purchaseOrdersService.getPageTable(pageable).pipe(map(response => response));
  }
}
