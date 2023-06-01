import { APP_INITIALIZER, Injector, NgModule } from "@angular/core";
import { ServerMultienvironmentConfigService } from "./config/server-multienvironment-config.service";
import { ENVIRONMENT } from "./token/environment-name.token";

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () =>
        injector.get(ServerMultienvironmentConfigService ).init({ env: injector.get(ENVIRONMENT) }),
      deps: [Injector],
      multi: true,
    }
  ]
})
export class ServerMultiEnvironmentModule {}
