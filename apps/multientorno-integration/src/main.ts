import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { Environment, EnvironmentVars, buildEnvVars } from './environments/environment-vars.model';
import { getEnvironmentConfigByEnv } from './environments/environment-config';
import { ENVIRONMENT_VARS } from './tokens/environment-vars.token';
import { ENVIRONMENT_CONFIG } from './tokens/environment-config.token';
import { ServerAppConfigService } from './app/services/server-app-config.service';

let selectedEnvironment = '';

function openEnvironmentOptions() {
  fetch('/selected-environments.json')
    .then(response => response.json())
    .then(vars => {
      const menu = document.getElementById('menu-env');
      vars['envOptions'].forEach((env: Environment) => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'c-btn-env';
        buttonElement.innerText = `${env}`;
        menu?.appendChild(buttonElement);
      });
    })
    .then(() => buttonsClickAction())
    .catch(() => console.log('ERROR'));
}

function buttonsClickAction() {
  const button = Array.from(document.getElementsByClassName('c-btn-env'));
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEnvironment = btn.innerHTML;
      localStorage.setItem('env', selectedEnvironment);
      closeEnvironmentOptions();
      init({ env: selectedEnvironment });
    });
  });
}

function closeEnvironmentOptions() {
  const menu = document.getElementById('menu-env');
  if (menu) {
    menu.className = 'c-menu--closed';
  }
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

  //Si encuentra en local storage env
  if (localStorage.getItem('env')) {
    init({ env: localStorage.getItem('env') as Environment });
  } else {
    //Si no encuentra local storage salta a buscar opcion
    openEnvironmentOptions();
  }
}
