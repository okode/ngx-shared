import { createServiceFactory } from '@ngneat/spectator/jest';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';
import * as Sentry from '@sentry/angular-ivy';
import { SentryErrorReporterService } from './sentry-error-reporter.service';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { GlobalMocks, fakeTimer, mockPlatform } from '@okode/ngx-testing-kit';
import { SentryConfig } from '../models/sentry-config.model';
import { HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';

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

const getMockHttpError404 = () =>
  new HttpErrorResponse({
    status: 404,
    error: 'this is a test',
    url: 'http://test-api.com/prueba',
  });

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
    describe('when app is running in server', () => {
      it('should sentry not be initialized', fakeAsync(() => {
        mockPlatform('server');
        createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        const initSpy$ = jest.spyOn(Sentry, 'init');
        flushMicrotasks();

        expect(initSpy$).not.toHaveBeenCalled();
      }));
    });

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

    describe('when browser', () => {
      describe('when IE', () => {
        it('should report custom error when a JS error', fakeAsync(() => {
          const spectator = createService({
            providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
          });
          GlobalMocks.mockUserAgent('MSIE');
          mockPlatform('browser');
          mockSentryInit();
          const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

          const jsError = new Error('testError');
          spectator.service.sendError(jsError);
          flushMicrotasks();

          const capturedError = new Error('testError');
          capturedError.name = 'Debug [INTERNET_EXPLORER_ERROR] - Error';
          expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
          expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
          expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
        }));
      });

      it('should capture a simple JS error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();
        const error = new Error('this is a test');
        spectator.service.sendError(error);
        flushMicrotasks();

        expect(captureExceptionSpy.mock.calls[0][0]).toBe(error);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(error.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(error.message);
      }));

      it('should capture wrapped zonejs error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

        const error = new Error('this is a test');
        spectator.service.sendError({ ngOriginalError: error });
        flushMicrotasks();

        expect(captureExceptionSpy.mock.calls[0][0]).toBe(error);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(error.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(error.message);
      }));

      it('should capture HTTP error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();
        const httpError = getMockHttpError404();
        spectator.service.sendError(httpError);
        flushMicrotasks();

        const capturedError = new Error(
          `[${httpError.status}] ${httpError.url}`
        );
        capturedError.name = 'ServerError';
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));

      it('should capture string error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();
        spectator.service.sendError('this is a test');
        flushMicrotasks();

        const capturedError = new Error('this is a test');
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));

      it('should capture null error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

        spectator.service.sendError(null);
        flushMicrotasks();

        const capturedError = new Error('null');
        capturedError.name = 'Unknown error';
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));

      it('should capture object error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

        const error = { test: 'example' };
        spectator.service.sendError(error);
        flushMicrotasks();

        const capturedError = new Error(JSON.stringify(error));
        capturedError.name = 'Unknown error';
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));
    });
  });
  describe('sendServerError', () => {
    describe('when server', () => {
      it('should log simple error', () => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('server');
        const fakeDate = '2022-03-31T22:00:00.000Z';
        fakeTimer(fakeDate);
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const httpError = getMockHttpError404();

        spectator.service.sendServerError(httpError);

        expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
          `${fakeDate} [ HTTP ERROR ] [${httpError.status}] ${httpError.url}`
        );
      });

      it('should log error with request', () => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('server');
        const fakeDate = '2022-03-31T22:00:00.000Z';
        fakeTimer(fakeDate);
        const consoleLogSpy = jest.spyOn(console, 'log');
        const req = new HttpRequest('GET', 'https://gypung.api', {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        });

        const httpError = getMockHttpError404();
        spectator.service.sendServerError(httpError, req);

        const urlObj = new URL(req.urlWithParams);
        const expectedLog = JSON.stringify({
          time: fakeDate,
          type: 'angular',
          uuid: req.headers.get('custom-uuid'),
          method: req.method,
          status: httpError.status,
          protocol: urlObj.protocol.replace(':', ''),
          host: urlObj.hostname,
          url: urlObj.pathname + urlObj.search,
          request_body: JSON.stringify(req.body),
          user_agent: req.headers.get('user-agent'),
          http_x_forwarded_for: req.headers.get('custom-x-forwarded-for'),
          http_referer: document.location.href,
        });
        expect(consoleLogSpy.mock.calls[0][0]).toMatch(expectedLog);
      });

      describe('when browser', () => {
        it('should capture http error with body by Sentry SDK', fakeAsync(() => {
          const spectator = createService({
            providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
          });
          mockPlatform('browser');
          mockSentryInit();
          const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

          const httpError = getMockHttpError404();
          spectator.service.sendServerError(httpError);
          flushMicrotasks();

          const capturedError = new Error(`[${httpError.status}] ${httpError.url}`);
          capturedError.name = 'ServerError';
          expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
          expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
          expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
        }));

        it('should capture http error with body and request by Sentry SDK', fakeAsync(() => {
          const spectator = createService({
            providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
          });
          mockPlatform('browser');
          mockSentryInit();
          const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

          const req = new HttpRequest('GET', 'https://gypung.api', {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          });
          const httpError = getMockHttpError404();
          spectator.service.sendServerError(httpError, req);
          flushMicrotasks();

          const capturedError = new Error(`[${httpError.status}] ${httpError.url}`);
          capturedError.name = 'ServerError';
          expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
          expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
          expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
        }));

        it('should capture http error with js error by Sentry SDK', fakeAsync(() => {
          const spectator = createService({
            providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
          });
          mockPlatform('browser');
          mockSentryInit();
          const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

          const error = new Error('this is a test');
          const httpError = new HttpErrorResponse({ error: error });
          spectator.service.sendServerError(httpError);
          flushMicrotasks();

          expect(captureExceptionSpy.mock.calls[0][0]).toBe(error);
          expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(error.name);
          expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(error.message);
        }));

        it('should capture http error with error event by Sentry on browser', fakeAsync(() => {
          const spectator = createService({
            providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
          });
          mockPlatform('browser');
          mockSentryInit();
          const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

          const errorEventMsg = 'test';
          const httpErrorData = { error: new ErrorEvent('testType', { message: errorEventMsg }) };
          const httpError = new HttpErrorResponse(httpErrorData);
          spectator.service.sendServerError(httpError);
          flushMicrotasks();

          const capturedError = new Error(errorEventMsg);
          capturedError.name = 'ErrorEvent';
          expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
          expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
          expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
        }));
      });
    });
  });

  describe('sendCustomError', () => {
    describe('when server', () => {
      it('should log error', () => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('server');
        const fakeDate = '2022-03-31T22:00:00.000Z';
        fakeTimer(fakeDate);

        const consoleErrorSpy = jest.spyOn(console, 'error');
        const errorCode = 'TEST';
        const error = 'This is a test';
        spectator.service.sendCustomError('TEST', 'This is a test');

        expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
          `${fakeDate} [ DEBUG - CUSTOM ERROR ] [${errorCode}] ${JSON.stringify(error)}`
        );
      });
    });

    describe('when browser', () => {
      it('should capture custom error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

        spectator.service.sendCustomError('TEST', 'This is a test');
        flushMicrotasks();

        const capturedError = new Error('This is a test');
        capturedError.name = 'Debug [TEST] - Error';
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));

      it('should capture custom error with http error by Sentry SDK', fakeAsync(() => {
        const spectator = createService({
          providers: [{ provide: SENTRY_CONFIG, useValue: sentryConfigMock }],
        });
        mockPlatform('browser');
        mockSentryInit();
        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException').mockImplementation();

        const httpError = getMockHttpError404();
        spectator.service.sendCustomError('TEST', httpError);
        flushMicrotasks();

        const capturedError = new Error(`[${httpError.status}] ${httpError.url}`);
        capturedError.name = 'Debug [TEST] - ServerError';
        expect(captureExceptionSpy.mock.calls[0][0]).toEqual(capturedError);
        expect(captureExceptionSpy.mock.calls[0][0].name).toEqual(capturedError.name);
        expect(captureExceptionSpy.mock.calls[0][0].message).toEqual(capturedError.message);
      }));
    });
  });
});
