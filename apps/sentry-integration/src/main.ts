import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { SentryErrorReporterService, provideSentry } from '@okode/ngx-sentry';
import packageInfo from '@package';
import { SentryErrorReporterServiceExt } from './app/services/sentry-error-reporter-ext.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideSentry({
      dns: 'https://a3972e67a7774359b88c1813a69d64a4@o4504876739657728.ingest.sentry.io/4504876742606848',
      enabled: true,
      env: 'test',
      release: packageInfo.version,
    }),
    { provide: SentryErrorReporterService, useExisting: SentryErrorReporterServiceExt }
  ],
}).catch(err => console.error(err));
