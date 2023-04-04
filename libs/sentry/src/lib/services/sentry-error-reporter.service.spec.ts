import { createServiceFactory } from '@ngneat/spectator/jest';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';
import * as Sentry from '@sentry/angular-ivy';
import { SentryErrorReporterService } from './sentry-error-reporter.service';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { fakeTimer, mockPlatform } from '@okode/ngx-testing-kit';
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

const mockSentryInit = () => {
  return jest.spyOn(Sentry, 'init').mockReturnValue(undefined);
};

describe('SentryErrorReporterService', () => {
  const createService = createServiceFactory({
    service: SentryErrorReporterService,
  });

  it('should be created', () => {
    const spectator = createService({
      providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
    });
    expect(spectator.service).toBeTruthy();
  });

  describe('init', () => {
    describe('when app is running in browser', () => {
      it('should sentry be auto-initialized', fakeAsync(() => {
        mockPlatform('browser');
        createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });

        const initSpy$ = mockSentryInit();
        flushMicrotasks();
        expect(initSpy$).toHaveBeenCalled();
      }));
    });
  });

  describe('sendError', () => {
    describe('when server', () => {
      it('should log JS error', () => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('server');
        const fakeDate = '2022-03-31T22:00:00.000Z';
        fakeTimer(fakeDate);

        const consoleErrorSpy = jest.spyOn(console, 'error');
        const error = new Error('this is a test');
        error.stack = 'this is a test example';
        spectator.service.sendError(error);

        expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
          `${fakeDate} [ ERROR HANDLED ] ${JSON.stringify(error.stack.replace(/\n/g, ''))}`
        );
      });
    });
  });
});
