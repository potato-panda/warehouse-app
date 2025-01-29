import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TuiButton} from '@taiga-ui/core';
import {TuiFade, TuiPagination} from '@taiga-ui/kit';
import {TuiMainComponent, TuiSubheaderCompactComponent} from '@taiga-ui/layout';
import {PageableResourceResponse, ResourceResponse} from '../../../../services/company.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {Page} from '../../../../interfaces/resource';
import {TuiTable} from '@taiga-ui/addon-table';

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
    TuiPagination,
    TuiTable
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  protected pageResponse!: PageableResourceResponse;
  protected companies!: ResourceResponse[];

  protected index = 0;
  protected totalPages = 1;
  protected size = 20;
  protected pageDetails?: Page;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.pageResponse = data['clients'];
      this.companies = this.pageResponse._embedded.companies;
      this.pageDetails = this.pageResponse.page;
      this.index = (this.pageDetails.number ?? 0) + 1;
      this.totalPages = this.pageDetails.totalPages ?? 1;
    });
  }


  protected readonly JSON = JSON;
}
