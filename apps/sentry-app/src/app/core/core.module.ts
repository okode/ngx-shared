import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SentryModule } from '@okode/ngx-sentry';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import packageInfo from '@package';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    SentryModule.forRoot({
      dns: 'https://a3972e67a7774359b88c1813a69d64a4@o4504876739657728.ingest.sentry.io/4504876742606848',
      enabled: true,
      env: environment.envName,
      release: packageInfo.version,
      denyUrlsConfig: {
        useDefaultUrls: true,
        additionalUrls: [
          /^example1:\/\//i,
          /^example2:\/\//i,
          /^example3:\/\//i,
        ],
      },
      debug: true,
      logErrors: true,
      tracesSampleRate: environment.sentry.sampleRate,
      integrationsConfig: {
        browserTracing: {
          tracePropagationTargets: ['localhost'],
        },
      },
    }),
  ],
})
export class CoreModule {}
