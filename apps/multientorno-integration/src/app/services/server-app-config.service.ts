import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ServerAppConfigService {
  private static readonly ENV_VARS_STATE_KEY = 'gy-server-env-vars';
  private static readonly SSR_RUNNING_ATTR = 'data-app-run-ssr';

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  static isServerRunningDetectedInBrowser() {
    return document.body.getAttribute(ServerAppConfigService.SSR_RUNNING_ATTR) != null;
  }

  static getServerEnvVars() {
    const envVarsAsText = document.getElementById(
      ServerAppConfigService.ENV_VARS_STATE_KEY
    )?.textContent;
    return envVarsAsText ? JSON.parse(envVarsAsText) : null;
  }

  init(config: { envVars: unknown }) {
    this.registerServerEnvVars(config.envVars);
    this.setServerRunningFlag();
  }

  private registerServerEnvVars(envVars: unknown) {
    const envConfigScript = this.document.createElement('script');
    envConfigScript.id = ServerAppConfigService.ENV_VARS_STATE_KEY;
    envConfigScript.type = 'application/json';
    envConfigScript.text = JSON.stringify(envVars);
    this.document.body.appendChild(envConfigScript);
  }

  private setServerRunningFlag() {
    this.document.body.setAttribute(ServerAppConfigService.SSR_RUNNING_ATTR, 'true');
  }
}
