import { APP_INITIALIZER, InjectionToken, Injector, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { ENVIRONMENT_VARS } from '../tokens/environment-vars.token';
import { ENVIRONMENT_CONFIG } from '../tokens/environment-config.token';

export const configFactory = () => {
  const envVars = inject(ENVIRONMENT_VARS);
  const envConfig = inject(ENVIRONMENT_CONFIG);
  const config = {
    ...envVars,
    ...envConfig,
  };
  return config;
};

export const CONFIG = new InjectionToken<any>('APP_CONFIG');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [
    { provide: CONFIG, useFactory: configFactory },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
