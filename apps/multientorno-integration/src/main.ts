import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { ENVIRONMENT_CONFIG, ENVIRONMENT_NAME, initMultiEnvironmentApp } from '@okode/multientorno';


const getEnvironmentConfigByEnv = ( env: string) => {
  return import(`../src/environments/environment.${env}`).then(d => d.environment);
}

initMultiEnvironmentApp('/selected-environments.json', (env: string) => {
  init(env)
});

function init(env: string) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp(env);
  } else {
    document.addEventListener('DOMContentLoaded', () => bootstrapApp(env));
  }
}

async function bootstrapApp(env: string) {
  const envConfig = await getEnvironmentConfigByEnv(env);

  platformBrowserDynamic([
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig },
    { provide: ENVIRONMENT_NAME, useValue: env },
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}