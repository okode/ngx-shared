import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ServerMultiEnvironmentModule } from '@okode/multientorno';

@NgModule({
  imports: [AppModule, ServerModule, ServerMultiEnvironmentModule],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
