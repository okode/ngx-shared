import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ServerAppConfigService } from './services/server-app-config.service';
import { ENVIRONMENT_CONFIG } from '../tokens/environment-config.token';


@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () =>
        //TODO name Servermultienvironment
        injector.get(ServerAppConfigService).init({ envVars: (injector.get(ENVIRONMENT_CONFIG) as any).env }),
      deps: [Injector],
      multi: true,
    }
  ]
})
export class ServerMultiEnvironmentModule {}

@NgModule({
  imports: [AppModule, ServerModule, ServerMultiEnvironmentModule],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
