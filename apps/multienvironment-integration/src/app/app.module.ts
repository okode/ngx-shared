import { InjectionToken, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { ENVIRONMENT, ENVIRONMENT_CONFIG } from '@okode/multienvironment';

export const configFactory = () => {
  const envName = inject(ENVIRONMENT)
  const envConfig = inject(ENVIRONMENT_CONFIG);
  const appConfig = { ...envConfig as Record<string, unknown>,  env: envName,  }
  return appConfig;
};

export const CONFIG = new InjectionToken<Record<string, unknown>>('APP_CONFIG');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [{ provide: CONFIG, useFactory: configFactory }],
  bootstrap: [AppComponent],
})
export class AppModule {}
