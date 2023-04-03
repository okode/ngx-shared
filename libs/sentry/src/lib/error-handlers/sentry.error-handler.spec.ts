import { createServiceFactory } from '@ngneat/spectator/jest';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';
import { SentryErrorReporterService } from '../services/sentry-error-reporter.service';
import { SentryErrorHandler } from './sentry.error-handler';
import { GlobalMocks } from '@okode/ngx-testing-kit';
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

describe('ErrorHandlerService', () => {
  const createService = createServiceFactory({
    service: SentryErrorHandler,
    mocks: [SentryErrorReporterService],
  });

  it('should be created', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    expect(spectator.service).toBeTruthy();
  });

  describe('when load chunk JS error', () => {
    it('should call "window.reload"', () => {
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
      });

      GlobalMocks.mockLocation({ reload: jest.fn() });

      const chunkJsError = new Error('Loading chunk 1 failed');
      spectator.service.handleError(chunkJsError);

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should not report the error', () => {
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
      });
      const errorReporterSpy = spectator.inject(SentryErrorReporterService);

      const chunkJsError = new Error('Loading chunk 1 failed');
      spectator.service.handleError(chunkJsError);

      expect(errorReporterSpy.sendError).not.toHaveBeenCalled();
    });
  });

  describe('when non-load chunk JS error', () => {
    it('should report the error', () => {
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
      });
      const errorReporterSpy = spectator.inject(SentryErrorReporterService);

      const jsError = new Error('testError');
      spectator.service.handleError(jsError);

      expect(errorReporterSpy.sendError).toHaveBeenCalledWith(jsError);
    });

    it('should report "undefined" error', () => {
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
      });
      const errorReporterSpy = spectator.inject(SentryErrorReporterService);

      spectator.service.handleError(undefined);

      expect(errorReporterSpy.sendError).toHaveBeenCalledWith(undefined);
    });

    it('should log error on console if "logErrors" is undefined', () => {
      const config: SentryConfig = { ...sentryConfigMock, logErrors: undefined };
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: config }],
      });
      const consoleErrorSpy = jest.spyOn(console, 'error');

      const jsError = new Error('testError');
      spectator.service.handleError(jsError);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error on console if "logErrors" is true', () => {
      const config: SentryConfig = { ...sentryConfigMock, logErrors: true };
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: config }],
      });
      const consoleErrorSpy = jest.spyOn(console, 'error');

      const jsError = new Error('testError');
      spectator.service.handleError(jsError);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log error on console if "logErrors" is false', () => {
      const config: SentryConfig = { ...sentryConfigMock, logErrors: false };
      const spectator = createService({
        providers: [{ provide: SENTRY_CONFIG, useValue: config }],
      });
      const consoleErrorSpy = jest.spyOn(console, 'error');

      const jsError = new Error('testError');
      spectator.service.handleError(jsError);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});