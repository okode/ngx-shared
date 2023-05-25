import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { MultientornoModule } from '@okode/multientorno';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
