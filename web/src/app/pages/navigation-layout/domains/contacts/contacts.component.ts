import {Component, inject, model} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiDataListComponent,
  tuiDialog,
  TuiDropdown,
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
import {DeleteDialogComponent} from '../../../../components/delete-dialog/delete-dialog.component';
import {Resource} from '../../../../interfaces/resource';
import {Contact, ContactRelations} from '../../../../interfaces/entities/contact';
import {
  ContactsService,
  ResourceCollectionResponse as ContactResourceCollectionResponse
} from '../../../../services/contacts.service';
import {RouterLink} from '@angular/router';

type CompanyResourceList = Resource<Contact, 'contact', ContactRelations>[];

@Component({
  selector: 'app-contacts',
  imports: [
    AsyncPipe,
    FormsModule,
    NgForOf,
    NgIf,
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
    TuiTable,
    TuiDropdown
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);
  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'name' | 'address' | 'tin' | 'website' | null>(null);
  protected readonly refresh$ = new BehaviorSubject<void>(undefined);
  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);
  protected columns: (keyof Contact | 'actions')[] = ['name', 'email', 'phone', 'actions'];
  // any changes will trigger a data update, debounced of course
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
  protected readonly data$: Observable<CompanyResourceList> = this.request$.pipe(
    filter(tuiIsPresent),
    map((response) => response._embedded.contacts),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );

  private readonly alerts = inject(TuiAlertService);

  protected readonly dialog = tuiDialog(DeleteDialogComponent, {
    dismissible: true,
    closeable: false,
    label: 'Delete?',
  });

  constructor(private contactsService: ContactsService,
  ) {
  }

  refreshData() {
    this.refresh$.next();
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  protected showDeleteDialog({id, name}: Contact): void {
    this.dialog(name).subscribe((confirm) => {
      if (confirm) {
        this.contactsService.deleteOne(id).subscribe({
          error: err => {
            this.alerts.open(context => {
            }, {
              appearance: 'negative',
              label: `Error deleting contact '${name}'`
            });
          },
          next: response => {
            this.alerts.open(context => {
            }, {
              appearance: 'positive',
              label: `Successfully deleted contact '${name}'`
            }).subscribe();

            this.refreshData();
          },
          complete: () => {
          }
        });
      }
    });
  }

  private getData(search?: string): Observable<ContactResourceCollectionResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.contactsService.getPageByName(search, pageable).pipe(map(response => response));
    }
    return this.contactsService.getPage(pageable).pipe(map(response => response));
  }

}
