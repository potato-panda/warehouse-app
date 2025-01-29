import {NG_EVENT_PLUGINS} from '@taiga-ui/event-plugins';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ApplicationConfig, isDevMode, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideServiceWorker} from '@angular/service-worker';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
      provideAnimations(),
      provideZoneChangeDetection({eventCoalescing: true}),
      provideRouter(routes),
      provideClientHydration(withEventReplay()),
      provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
      }),
      provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
      NG_EVENT_PLUGINS
    ]
  }
;
