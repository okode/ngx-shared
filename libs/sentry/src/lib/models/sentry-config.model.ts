export interface SentryConfig {
  dns: string;
  enabled: boolean;
  env: string;
  release: string;
  denyUrlsConfig?: DenyUrlsConfig;
  debug?: boolean;
  logErrors?: boolean;
  tracesSampleRate?: number;
  integrationsConfig?: {
    browserTracing?: {
      tracePropagationTargets?: string[];
    };
  };
}

export interface DenyUrlsConfig {
  useDefaultUrls: boolean;
  additionalUrls?: RegExp[];
}
