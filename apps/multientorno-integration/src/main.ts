import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initMultiEnvironmentApp, provideMultienvironmentConfig, getEnvironmentConfigByEnv} from '@okode/multientorno';


initMultiEnvironmentApp({jsonPath: '/selected-environments.json'}, (env: string) => {
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

  platformBrowserDynamic(provideMultienvironmentConfig(env, envConfig))
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}