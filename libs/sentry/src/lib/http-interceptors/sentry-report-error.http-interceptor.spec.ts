import { createServiceFactory } from '@ngneat/spectator/jest';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';
import { SentryErrorReporterService } from '../services/sentry-error-reporter.service';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { interceptHttpReqWithErrorResponse } from '@okode/ngx-testing-kit';
import { SentryReportErrorHttpInterceptor } from './sentry-report-error.http-interceptor';
import { SentryConfig } from '../models/sentry-config.model';

const sentryConfigMock: SentryConfig = {
  dns: 'https://a3972e67a7774359b88c1813a69d64a4@o4504876739657728.ingest.sentry.io/4504876742606848',
  enabled: true,
  debug: true,
  env: 'testing',
  release: '2',
  tracesSampleRate: 1,
  denyUrlsConfig: {
    useDefaultUrls: false,
    additionalUrls: [/^example1:\/\//i, /^example2:\/\//i, /^example3:\/\//i],
  },
  integrationsConfig: {
    browserTracing: {
      tracePropagationTargets: ['localhost'],
    },
  },
};

describe('SentryReportErrorHttpInterceptor', () => {
  const createService = createServiceFactory({
    service: SentryReportErrorHttpInterceptor,
    mocks: [SentryErrorReporterService],
  });

  it('should be created', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    expect(spectator.service).toBeTruthy();
  });

  it('should not report non-http requests that throw a http error', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    const errorReporterSpy = spectator.inject(SentryErrorReporterService);

    const req = new HttpRequest('GET', '/assets/file.png');
    const error = new HttpErrorResponse({ error: { test: 'This is a test' } });
    interceptHttpReqWithErrorResponse(spectator.service, req, error);

    expect(errorReporterSpy.sendServerError).not.toHaveBeenCalled();
  });

  it('should not report non-http errors', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    const errorReporterSpy = spectator.inject(SentryErrorReporterService);

    const req = new HttpRequest('GET', '/assets');
    const error = new Error('test');
    interceptHttpReqWithErrorResponse(spectator.service, req, error);

    expect(errorReporterSpy.sendServerError).not.toHaveBeenCalled();
  });

  it('should report http error', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    const errorReporterSpy = spectator.inject(SentryErrorReporterService);

    const req = new HttpRequest('GET', 'https://sentry-library.api');
    const error = new HttpErrorResponse({ error: { test: 'This is a test' } });
    interceptHttpReqWithErrorResponse(spectator.service, req, error);

    expect(errorReporterSpy.sendServerError).toHaveBeenCalled();
  });
});
