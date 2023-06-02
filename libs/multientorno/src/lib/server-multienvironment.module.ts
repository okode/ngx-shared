import { APP_INITIALIZER, Injector, NgModule } from "@angular/core";
import { ServerMultiEnvironmentConfigService } from "./config/server-multienvironment-config.service";
import { ENVIRONMENT } from "./tokens/environment-name.token";

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () =>
        injector.get(ServerMultiEnvironmentConfigService ).init({ env: injector.get(ENVIRONMENT) }),
      deps: [Injector],
      multi: true,
    }
  ]
})
export class ServerMultiEnvironmentModule {}
