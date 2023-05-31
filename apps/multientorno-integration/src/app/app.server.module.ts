import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ServerMultienvironmentConfigService, ENVIRONMENT_CONFIG  } from '@okode/multientorno';

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
