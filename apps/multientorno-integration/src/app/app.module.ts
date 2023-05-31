import { InjectionToken, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { ENVIRONMENT_CONFIG } from '@okode/multientorno';

export const configFactory = () => {
  const envConfig = inject(ENVIRONMENT_CONFIG);
  return envConfig;
};

export const CONFIG = new InjectionToken<any>('APP_CONFIG');

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
