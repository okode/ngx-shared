import { ModuleWithProviders, NgModule } from '@angular/core';
import { SentryConfig } from './models/sentry-config.model';
import { provideSentry } from './provide-sentry';

@NgModule({})
export class SentryModule {
  public static forRoot(config: SentryConfig): ModuleWithProviders<SentryModule> {
    return {
      ngModule: SentryModule,
      providers: [...provideSentry(config)],
    };
  }
}