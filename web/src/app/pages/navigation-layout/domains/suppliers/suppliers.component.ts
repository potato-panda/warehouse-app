import {Component, inject, model} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiDataListComponent,
  TuiDialogService, TuiDropdown,
  TuiDropdownOpen,
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
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  share,
  startWith,
  switchMap
} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';
import {DeleteDialogComponent} from '../../../../components/delete-dialog/delete-dialog.component';
import {
  SuppliersCollectionResourceResponse,
  SuppliersResourceResponse,
  SuppliersService
} from '../../../../services/suppliers.service';
import {Supplier} from '../../../../interfaces/entities/supplier';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-suppliers',
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
    TuiTable
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'name' | null>(null);

  protected readonly refresh$ = new BehaviorSubject<void>(undefined);
  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);
  protected columns = ['name', 'actions'];
  // any changes will trigger a data update, debounced of course
  protected readonly request$ = combineLatest([
    this.search$.pipe(debounceTime(300), distinctUntilChanged()),
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
  protected readonly data$: Observable<SuppliersResourceResponse[]> = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response._embedded.suppliers),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(private suppliersService: SuppliersService,
  ) {
  }

  refreshData() {
    this.refresh$.next();
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  protected showDeleteDialog({id, name}: Supplier): void {
    this.dialogs.open<Observable<any>>(new PolymorpheusComponent(DeleteDialogComponent), {
      dismissible: true,
      closeable: true,
      label: 'Delete?',
      size: 'm',
      data: {
        subject: name
      }
    }).pipe(
      concatMap(value => value
        ? this.suppliersService.deleteOne(id)
        : of())
    ).subscribe({
      error: err => {
        this.alerts.open(context => {
        }, {
          appearance: 'negative',
          label: `Error deleting '${name}'`
        });
      },
      next: response => {
        this.alerts.open(context => {
        }, {
          appearance: 'positive',
          label: `Successfully deleted Customer '${name}'`
        }).subscribe();
        this.refreshData();
      }
    });
  }

  private getData(search?: string): Observable<SuppliersCollectionResourceResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.suppliersService.getPageByName(search, pageable).pipe(map(response => response));
    }
    return this.suppliersService.getPage(pageable).pipe(map(response => response));
  }
}
