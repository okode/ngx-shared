import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { getEnvironmentConfigByEnv } from './environments/environment-config';
import { ENVIRONMENT_VARS } from './tokens/environment-vars.token';
import { ENVIRONMENT_CONFIG } from './tokens/environment-config.token';
import { ServerAppConfigService } from './app/services/server-app-config.service';

let selectedEnvironment = '';

function openEnvironmentMenuOptions() {
  fetch('/selected-environments.json')
    .then(response => response.json())
    .then(vars => {
      const menu = document.getElementById('menu-env');
      vars['envOptions'].forEach((env: string) => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'c-btn-env';
        buttonElement.innerText = `${env}`;
        menu?.appendChild(buttonElement);
      });
    })
    .then(() => bindEnvironmentButtonEvent())
    .catch(() => console.log('ERROR'));
}


function bindEnvironmentButtonEvent() {
  const button = Array.from(document.getElementsByClassName('c-btn-env'));
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEnvironment = btn.innerHTML;
      localStorage.setItem('env', selectedEnvironment);
      closeEnvironmentMenuOptions();
      init(selectedEnvironment);
    });
  });
}

function closeEnvironmentMenuOptions() {
  const menu = document.getElementById('menu-env');
  if (menu) {
    menu.className = 'c-menu--closed';
  }
}

async function bootstrapApp(env: string) {
  /* REVIEW: Angular universal doesn't support standalone component bootstrap currently.
   * https://github.com/angular/universal/issues/2906
   */
  const envConfig = await getEnvironmentConfigByEnv(env);
  platformBrowserDynamic([
    { provide: ENVIRONMENT_VARS, useValue: env },
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig },
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

function init(vars: string) {
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
  const localStorageEnv = localStorage.getItem('env');
  if (localStorageEnv) {
    init(localStorageEnv);
  } else {
    //Si no encuentra local storage salta a buscar opcion
    openEnvironmentMenuOptions();
  }
}
