import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initMultiEnvironmentApp, ENVIRONMENT, ENVIRONMENT_CONFIG} from '@okode/multienvironment';


function init() {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp();
  } else {
    document.addEventListener('DOMContentLoaded', () => { bootstrapApp(); });
  }
}

async function bootstrapApp() {
  const { env, envConfig } = await initMultiEnvironmentApp();
  platformBrowserDynamic([
    { provide: ENVIRONMENT, useValue: env },
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig },
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

init();