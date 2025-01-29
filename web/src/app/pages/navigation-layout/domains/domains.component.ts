import { Component } from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {TuiFade} from '@taiga-ui/kit';
import {TuiMainComponent, TuiSubheaderCompactComponent} from '@taiga-ui/layout';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-domains',
  imports: [
    TuiButton,
    TuiFade,
    TuiMainComponent,
    TuiSubheaderCompactComponent,
    RouterOutlet
  ],
  templateUrl: './domains.component.html',
  styleUrl: './domains.component.scss'
})
export class DomainsComponent {

}
