import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ServerMultienvironmentConfigService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  init(config: { env: string; }) {
    this.setDocumentApplicationEnvironment(config.env);
  }

  private setDocumentApplicationEnvironment(env: string) {
    const envScript = this.document.createElement('script');
    envScript.type = 'application/javascript';
    envScript.text = `window.okcdApplicationEnvironment = '${env}'`;
    this.document.head.appendChild(envScript);
  }
}
