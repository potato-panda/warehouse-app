import {Component} from '@angular/core';
import {TuiMainComponent} from '@taiga-ui/layout';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-domains',
  imports: [
    TuiMainComponent,
    RouterOutlet
  ],
  templateUrl: './domains.component.html',
  styleUrl: './domains.component.scss'
})
export class DomainsComponent {

}
