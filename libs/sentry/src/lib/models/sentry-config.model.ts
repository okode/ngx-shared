export interface SentryConfig {
  dns: string;
  enabled: boolean;
  env?: string;
  release?: string;
  denyUrls: DenyUrlsConfig;
  debug: boolean;
  logErrors: boolean;
  tracesSampleRate?: number;
  integrationsConfig: {
    browserTracing: {
      tracePropagationTargets: string[];
    }
  }
}

export interface DenyUrlsConfig {
  enabledDefault: boolean;
  additionalUrls?: RegExp[];
}
