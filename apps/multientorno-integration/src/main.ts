import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { getEnvironmentConfigByEnv } from './config/environment-config';
import { ENVIRONMENT_CONFIG } from './tokens/environment-config.token';

let selectedEnvironment = '';

function openEnvironmentMenuOptions() {
  fetch('/selected-environments.json')
    .then(response => response.json())
    .then(jsonOptions => {
      const menu = document.getElementById('menu-env');
      jsonOptions['envOptions'].forEach((env: string) => {
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
      (window as any).okcdApplicationEnvironment = selectedEnvironment;
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
  //TODO aqui los tres providers
  platformBrowserDynamic([
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig }
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

// TODO que sea lo que se importe de LA LIBRERIA y que este toda la logica dentro (las demas funciones)
// initMultiEnvironmentApp({ environmentsLocation: }, env => {
//   init(env)
// });

const environment = (window as any).okcdApplicationEnvironment || localStorage.getItem('env');

if (environment) {
  localStorage.setItem('env', environment);
  (window as any).okcdApplicationEnvironment = environment;
  init(environment);
} else {
  // if does not find local storage env, the menu to select env appears
  openEnvironmentMenuOptions();
}


// getBrowserEnvironment() {
// TODO hacer un check de si variable window existe para que no pete en server
//   return (window as any).okcdApplicationEnvironment;
// }