import {Component, inject, model} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiDataList,
  TuiDialogService,
  TuiDropdown,
  TuiLink,
  TuiLoader,
  TuiTextfield
} from '@taiga-ui/core';
import {TuiFade, TuiStatus} from '@taiga-ui/kit';
import {TuiMainComponent, TuiSubheaderCompactComponent} from '@taiga-ui/layout';
import {CompanyService, ResourceCollectionResponse} from '../../../../services/company.service';
import {RouterLink} from '@angular/router';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {Resource} from '../../../../interfaces/resource';
import {TuiTable, TuiTablePagination, TuiTablePaginationEvent} from '@taiga-ui/addon-table';
import {DeleteDialogComponent} from '../../../../components/delete-dialog/delete-dialog.component';
import {CompanyRelations, CompanySummary} from '../../../../interfaces/entities/company';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';
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
import {tuiIsFalsy, tuiIsPresent, TuiLet} from '@taiga-ui/cdk';
import {toObservable} from '@angular/core/rxjs-interop';

type CompanyResourceList = Resource<CompanySummary, 'company', CompanyRelations>[];

@Component({
  selector: 'app-clients',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiFade,
    TuiMainComponent,
    TuiSubheaderCompactComponent,
    RouterLink,
    NgForOf,
    TuiTable,
    TuiLink,
    TuiTablePagination,
    TuiLet,
    TuiStatus,
    TuiLoader,
    AsyncPipe,
    NgIf,
    TuiDropdown,
    TuiDataList,
    TuiTextfield
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'name' | 'address' | 'tin' | 'website' | null>(null);

  protected readonly refresh$ = new BehaviorSubject<void>(undefined);
  protected nameSearch = model('');
  protected readonly search$ = toObservable(this.nameSearch);

  constructor(private companyService: CompanyService,
  ) {
  }

  protected columns = ['name', 'address', 'tin', 'website', 'actions'];

  // any changes will trigger a data update, debounced of course
  protected readonly request$ = combineLatest([
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
      // switchMap((searchValue) => searchValue),
      // share()
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
    map((response) => response._embedded.companies),
    map((items) => items.filter(tuiIsPresent)),
    startWith([]),
  );

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  refreshData() {
    this.refresh$.next();
  }

  protected onPagination({page, size}: TuiTablePaginationEvent): void {
    this.page$.next(page);
    this.size$.next(size);
  };

  protected showDeleteDialog({id, name}: CompanySummary): void {
    this.dialogs.open<Observable<any>>(new PolymorpheusComponent(DeleteDialogComponent), {
      dismissible: true,
      closeable: true,
      label: 'Delete?',
      size: 'm',
      data: {
        subject: name,
        submit: () => this.companyService.deleteOne(id)
      }
    }).subscribe(obs => {
      obs.subscribe({
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
            label: `Successfully deleted '${name}'`
          }).subscribe();
        },
        complete: () => {
          this.refreshData();
        }
      });
    });
  }

  private getData(search?: string): Observable<ResourceCollectionResponse> {
    const pageable = {
      page: this.page$.value,
      size: this.size$.value,
      sort: this.sorter$.value ? this.sorter$.value + (this.direction$.value == 1 ? ',asc' : ',desc') : undefined
    };
    if (search && search.length && search.length > 0) {
      return this.companyService.getPageByName(search, pageable).pipe(map(response => response));
    }
    return this.companyService.getPage(pageable).pipe(map(response => response));
  }

}
