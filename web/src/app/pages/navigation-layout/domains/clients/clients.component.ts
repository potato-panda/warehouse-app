import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TuiAlertService, TuiButton, TuiDialogService, TuiLink, TuiLoader} from '@taiga-ui/core';
import {TuiFade, TuiStatus} from '@taiga-ui/kit';
import {TuiMainComponent, TuiSubheaderCompactComponent} from '@taiga-ui/layout';
import {CompanyService, ResourceCollectionResponse} from '../../../../services/company.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {Resource} from '../../../../interfaces/resource';
import {TuiTable, TuiTablePagination, TuiTablePaginationEvent} from '@taiga-ui/addon-table';
import {DeleteDialogComponent} from '../../../../components/delete-dialog/delete-dialog.component';
import {CompanyRelations, CompanySummary} from '../../../../interfaces/entities/company';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';
import {BehaviorSubject, combineLatest, debounceTime, filter, map, Observable, share, startWith, switchMap} from 'rxjs';
import {tuiIsFalsy, tuiIsPresent, TuiLet} from '@taiga-ui/cdk';

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
    NgIf
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  protected readonly size$ = new BehaviorSubject(20);
  protected readonly page$ = new BehaviorSubject(0);

  protected readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  protected readonly sorter$ = new BehaviorSubject<'name' | 'address' | 'tin' | 'website' | null>(null);

  protected columns = ['name', 'address', 'tin', 'website', 'actions'];

  // any changes will trigger a data update, debounced of course
  protected readonly request$ = combineLatest([
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$,
  ]).pipe(
    debounceTime(0),
    switchMap((query) => this.getData(...query).pipe(startWith(null))),
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

  // protected search = '';
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private companyService: CompanyService,
  ) {
  }

  ngOnInit() {
    // this.route.data.subscribe((data) => {
    //   this.pageResponse = data['clients'];
    //   this.companies = this.pageResponse._embedded.companies;
    //   this.pageDetails = this.pageResponse.page;
    //   this.page = (this.pageDetails.number ?? 0);
    //   this.totalPages = this.pageDetails.totalPages ?? 1;
    // });
  }

  refreshData() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentRoute]).then();
    });
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
            appearance: 'positive',
            label: `Successfully deleted '${name}'`
          }).subscribe();
        },
        next: response => {
          this.alerts.open(context => {
          }, {
            appearance: 'negative',
            label: `Error deleting '${name}'`
          });
        },
        complete: () => {
        }
      });
    });
  }

  private getData(
    key: 'name' | 'address' | 'tin' | 'website' | null,
    direction: -1 | 1,
    page: number,
    size: number,
  ): Observable<ResourceCollectionResponse> {
    console.info('Making a request');

    return this.companyService.getPage({
      page,
      size,
      sort: key ? key + (direction == 1 ? ',asc' : ',desc') : undefined
    }).pipe(
      map(response => response)
    );
  }

  // sortBy(key: 'name', direction: -1 | 1): TuiComparator<CompanySummary> {
  //   return (a, b) => direction * tuiDefaultSort(a[key], b[key]);
  //   // return (a, b) =>
  //   //   key === 'age'
  //   //     ? direction * tuiDefaultSort(getAge(a), getAge(b))
  //   //     : direction * tuiDefaultSort(a[key], b[key]);
  // }

}
