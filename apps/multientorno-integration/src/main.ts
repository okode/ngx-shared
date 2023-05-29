import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { Environment, EnvironmentVars, buildEnvVars } from './environments/environment-vars.model';
import { getEnvironmentConfigByEnv } from './environments/environment-config';
import { ENVIRONMENT_VARS } from './tokens/environment-vars.token';
import { ENVIRONMENT_CONFIG } from './tokens/environment-config.token';
import { ServerAppConfigService } from './app/services/server-app-config.service';


function selectOption() {
  fetch('/spa-env-vars.json')
    .then(response => response.json())
    // 1. SALTA UN WINDOW PARA ELEGIR CON ESTAS VARIABLES
    // .then(vars => {
    //   vars['envOptions'].forEach((env: Environment) => {
    //   });
    // })
    .then(() => {
        // 2. METE LA OPCIÓN EN EL LOCAL STORAGE
        const env = prompt("Please enter an environment", "");
        if(env){
          localStorage.setItem('env', env);
          // 3. HACE INIT CON ESA OPCIÓN
          const environmentVars = {
            env: env,
          };
          init(environmentVars);
         }
    })
  }


async function bootstrapApp(vars: EnvironmentVars) {
  /* REVIEW: Angular universal doesn't support standalone component bootstrap currently.
   * https://github.com/angular/universal/issues/2906
   */
  const envConfig = await getEnvironmentConfigByEnv(vars.env);
  platformBrowserDynamic([
    { provide: ENVIRONMENT_VARS, useValue: vars },
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig },
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

function init(vars: EnvironmentVars) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp(vars);
  } else {
    document.addEventListener('DOMContentLoaded', () => bootstrapApp(vars));
  }
}

if (ServerAppConfigService.isServerRunningDetectedInBrowser()) {
  /**
   * Environment variables are set by server side environment variables. So, this check avoids an
   * unnecessary XHR request to load a file whose content is completely irrelevant.
   */
  init(ServerAppConfigService.getServerEnvVars());
} else {
  /**
   * Environment variables must be loaded from a local JSON file when the application is started
   * as SPA without having server side.
   */

  // Si encuentra en local storage env
  if (localStorage.getItem('env')) {
    const environmentVars = {
      env: localStorage.getItem('env') as Environment,
    };
    init(environmentVars);
  } else {
    //Si no encuentra local storage salta a buscar opcion
    selectOption();
  }
}
