import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, of, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {LoginResponse} from '../interfaces/login-response';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';

interface User {
  username: string,
  authorities: string[]
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokenKey = "accessToken";
  currentUserKey = "currentUser";

  localStorage?: Storage;

  user: User | null = null;
  isAuthenticated = new BehaviorSubject(this.hasToken());

  constructor(private http: HttpClient,
              private router: Router,
              @Inject(DOCUMENT) _document: Document) {
    this.localStorage = _document.defaultView?.localStorage;
  }

  hasToken() {
    return Boolean(this.localStorage?.getItem(this.tokenKey));
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(environment.baseApiUrl + "/auth/login", {
      username,
      password
    }).pipe(
      switchMap(response => {
        const {accessToken, username, authorities} = response;

        this.localStorage?.setItem(this.tokenKey, accessToken);

        this.user = {username, authorities};

        this.localStorage?.setItem(this.currentUserKey, JSON.stringify({
          username, authorities
        }));

        this.isAuthenticated.next(true);

        return of(true);
      })
    );
  }

  getAccessToken() {
    return this.localStorage?.getItem(this.tokenKey);
  }

  getAuthorities() {
    return this.user?.authorities;
  }

  refreshToken() {
    return this.http.post<LoginResponse>(environment.baseApiUrl + "/auth/refresh-token", {}, {
      withCredentials: true
    });
  }

  isAdmin() {
    return this.getAuthorities()?.find(a => a == Authority.ADMIN);
  }

  logout() {
    this.http.post(environment.baseApiUrl + "/auth/logout", {}).subscribe();

    this.localStorage?.removeItem(this.tokenKey);
    this.localStorage?.removeItem(this.currentUserKey);


    this.isAuthenticated.next(false);

    this.router.navigate(["login"]).then();
  }
}

export enum Authority {
  ADMIN = "ROLE_ADMIN",
  USER = "ROLE_USER"
}
