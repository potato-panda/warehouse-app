import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiAppearance, TuiButton, TuiLoader, TuiNotification, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {AuthService} from '../../../services/auth.service';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiNotification,
    TuiTextfield,
    TuiTitle,
    TuiLoader,
    NgIf,

  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoading = new BehaviorSubject(false);
  error = false;
  protected readonly loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  login() {
    this.error = false;
    const {username, password} = this.loginForm.value;
    if (username && password) {
      this.isLoading.next(true);
      this.authService.login(username, password).subscribe({
        next: value => {
          if (value) {
            this.router.navigate(['/']).then();
          } else {
            this.error = true;
          }
        },
        error: err => {
          this.isLoading.next(false);
          this.error = true;
        },
        complete: () => {
          this.isLoading.next(false);
        }
      });
    }
  }
}
