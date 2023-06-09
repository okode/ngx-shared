import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ServerMultiEnvironmentConfigService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  init(options: { env: string; envConfig: Record<string, unknown> }) {
    this.setDocumentApplicationEnvironment(options.env, options.envConfig);
  }

  private setDocumentApplicationEnvironment(env: string, config: Record<string, unknown>) {
    const envScript = this.document.createElement('script');
    envScript.type = 'application/javascript';
    const okcdApplicationEnvironment = { env, config };
    envScript.text = `window.okcdApplicationEnvironment = ${JSON.stringify(
      okcdApplicationEnvironment
    )}`;
    this.document.head.appendChild(envScript);
  }
}
