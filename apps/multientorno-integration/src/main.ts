import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { getEnvironmentConfigByEnv } from './config/environment-config';
import { ENVIRONMENT_CONFIG } from './tokens/environment-config.token';
import { initMultiEnvironmentApp } from '@okode/multientorno'


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
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig }
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}