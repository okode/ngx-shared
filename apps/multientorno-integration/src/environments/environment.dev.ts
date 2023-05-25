import { EnvironmentConfig } from '../app/infra/config/models/environment.model';

export const environment: EnvironmentConfig = {
  recaptcha: {
    siteKey: '6LecU5oUAAAAAH0l-mdmW0-fkh6KGIhlCAdk100o',
  },
  sentry: {
    tracing: {
      origins: undefined,
    },
  },
  oneTrust: {
    id: '5caaa0b6-6c85-4b40-bf7f-6a90029e433e-test',
  },
  analytics: { gtmId: 'GTM-JRNHJKJ', envName: 'development' },
  apiPim: 'https://apipim.digital.dev.mapfredigitalhealth.com',
  apiImportWp: 'https://wordpress-gy.digital.dev.mapfredigitalhealth.com/wp-json/import-data-api',
  imageCdnUrl: 'https://img.gyoung.digital.dev.mapfredigitalhealth.com',
} as const;
