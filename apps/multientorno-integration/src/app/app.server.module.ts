import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ServerMultienvironmentConfigService   } from './services/server-multienvironment-config.service';
import { ENVIRONMENT_CONFIG } from '../tokens/environment-config.token';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () =>
        injector.get(ServerMultienvironmentConfigService ).init({ envVars: (injector.get(ENVIRONMENT_CONFIG) as any).env }),
      deps: [Injector],
      multi: true,
    }
  ]
})
export class ServerMultienvironmentModule {}

@NgModule({
  imports: [AppModule, ServerModule, ServerMultienvironmentModule],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
