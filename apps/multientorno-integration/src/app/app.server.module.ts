import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ServerAppConfigService } from './services/server-app-config.service';
import { ENVIRONMENT_CONFIG } from '../tokens/environment-config.token';

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () =>
        injector.get(ServerAppConfigService).init({ envVars: injector.get(ENVIRONMENT_CONFIG).env }),
      deps: [Injector],
      multi: true,
    },
  ],
})
export class AppServerModule {}
