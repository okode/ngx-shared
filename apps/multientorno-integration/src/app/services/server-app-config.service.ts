import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ServerAppConfigService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  init(config: { envVars: string }) {
    this.registerServerEnvVars(config.envVars);
  }

  private registerServerEnvVars(envVars: string) {
    const envConfigScript = this.document.createElement('script');
    envConfigScript.type = 'application/javascript';
    envConfigScript.text = `window.okcdApplicationEnvironment = '${envVars}'`;
    this.document.head.appendChild(envConfigScript);
  }
}
