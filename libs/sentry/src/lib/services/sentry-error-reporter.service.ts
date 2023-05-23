import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Injector, INJECTOR, PLATFORM_ID } from '@angular/core';
import { from } from 'rxjs';
import { filter, shareReplay } from 'rxjs/operators';
import { SentryConfig } from '../models/sentry-config.model';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';
import { getHeadersAsString, serializeBodyError } from '../utils/http.utils';

const defaultDenyUrls: ReadonlyArray<RegExp> = [
  /extensions\//i,
  /^chrome:\/\//i,
  /safari-extension:/i,
  // Dynatrace
  /ruxitagentjs/i,
  // Analytics
  /googletagmanager/i,
  /pagead\/js/i,
  /\/(gtm|ga|analytics)\.js/i,
  /facebook\.com/i,
  /connect\.facebook\.net/i,
  /ubembed\.com/i,
  // Analytics / OneTrust
  /cdn\.cookielaw\.org/i,
  /onetrust\.org/i,
  // Google Maps
  /googleapis\.com/i,
  // SF Chat
  /chatasistencia\/auraFW\//i,
  /embeddedService\/liveAgentStateChat\//i,
  /force\.com/i,
  /salesforceliveagent\.com/i,
];

@Injectable({
  providedIn: 'root',
})
export class SentryErrorReporterService {

  protected static readonly IE_ERROR_CODE = 'INTERNET_EXPLORER_ERROR';
  protected static readonly CONTEXT_FIELDS = {
    rawError: 'customctx.rawError',
    httpReq: 'customctx.httpRequest',
    httpRes: 'customctx.httpResponse',
  } as const;
  protected static readonly TAGS = {
    errorType: 'customctx.errorType',
    customErrorCode: 'customctx.customErrorCode',
    httpError: {
      url: 'customctx.httpError.url',
      method: 'customctx.httpError.method',
      status: 'customctx.httpError.status',
    },
  } as const;
  protected static readonly ERROR_TYPE_TAG_VALUES = {
    server: 'SERVER_ERROR',
    customError: 'CUSTOM_ERROR',
    error: 'ERROR',
  } as const;

  readonly sentry$ = from(this.initSentry()).pipe(filter(Boolean), shareReplay(1));

  constructor(
    @Inject(INJECTOR) protected readonly injector: Injector,
    @Inject(PLATFORM_ID) protected readonly platformId: string,
    @Inject(DOCUMENT) protected readonly document: Document,
    @Inject(SENTRY_CONFIG) protected readonly sentryConfig: SentryConfig
  ) {}

  sendError(error: unknown) {
    console.log('error normal');
    if (error instanceof HttpErrorResponse) {
      this.sendServerError(error);
      return;
    }

    const extractedError = this.buildError(error);

    if (this.isIE()) {
      this.sendCustomError(SentryErrorReporterService.IE_ERROR_CODE, extractedError);
      return;
    }

    if (isPlatformServer(this.platformId)) {
      const error = extractedError.stack?.replace(/\n/g, '') ?? extractedError;
      this.logErrorForServer(error);
    } else {
      this.sentry$.subscribe(s => {
        const scope = new s.Scope();
        scope.setTag(
          SentryErrorReporterService.TAGS.errorType,
          SentryErrorReporterService.ERROR_TYPE_TAG_VALUES.error
        );
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.rawError, { detail: error });
        s.captureException(extractedError, scope);
      });
    }
  }

  sendServerError(error: HttpErrorResponse, req?: HttpRequest<unknown>) {
    if (isPlatformServer(this.platformId)) {
      this.logHttpErrorForServer(error, req);
    } else {
      this.sentry$.subscribe(s => {
        const scope = new s.Scope();
        scope.setLevel('warning');
        scope.setTag(
          SentryErrorReporterService.TAGS.errorType,
          SentryErrorReporterService.ERROR_TYPE_TAG_VALUES.server
        );
        const { url: reqUrl, method, headers: reqHeaders } = req ?? {};
        const { url: resUrl, status, message: resMessage, headers: resHeaders } = error;
        scope.setTag(SentryErrorReporterService.TAGS.httpError.url, resUrl);
        scope.setTag(SentryErrorReporterService.TAGS.httpError.method, req?.method);
        scope.setTag(SentryErrorReporterService.TAGS.httpError.status, status);
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.httpReq, {
          method,
          url: reqUrl,
          headers: reqHeaders ? getHeadersAsString(reqHeaders) : undefined,
        });
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.httpRes, {
          status,
          url: resUrl,
          body: serializeBodyError(error),
          message: resMessage,
          headers: getHeadersAsString(resHeaders),
        });
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.rawError, { detail: error });
        const extractedError = this.buildHttpError(error);
        s.captureException(extractedError, scope);
      });
    }
  }

  sendCustomError(errorCode: string, error?: unknown, level: 'debug' | 'warning' = 'debug') {
    if (isPlatformServer(this.platformId)) {
      this.logCustomErrorForServer(errorCode, error);
    } else {
      const e = this.buildError(error);
      e.name = e.name ? `Debug [${errorCode}] - ${e.name}` : e.name;
      this.sentry$.subscribe(s => {
        const scope = new s.Scope();
        scope.setLevel(level);
        scope.setTag(
          SentryErrorReporterService.TAGS.errorType,
          SentryErrorReporterService.ERROR_TYPE_TAG_VALUES.customError
        );
        scope.setTag(SentryErrorReporterService.TAGS.customErrorCode, errorCode);
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.rawError, { detail: error });
        s.captureException(e, scope);
      });
    }
  }

  setUserScope(sentryUserScope: any) {
    this.sentry$.subscribe(s => {
      const scope = new s.Scope();

    })
  }

  protected buildError(errorCandidate: unknown) {
    let error = errorCandidate;
    // Try to unwrap zone.js error.
    // https://github.com/angular/angular/blob/master/packages/core/src/util/errors.ts
    if (error && (error as { ngOriginalError: Error }).ngOriginalError) {
      error = (error as { ngOriginalError: Error }).ngOriginalError;
    }

    // We can handle messages and Error objects directly.
    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error instanceof Error) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      return this.buildHttpError(error);
    }

    // Nothing was extracted, fallback
    const fallbackError = new Error(
      error && typeof error === 'object' ? JSON.stringify(error) : `${error}`
    );

    fallbackError.name = 'Unknown error';
    return fallbackError;
  }

  protected buildHttpError(error: HttpErrorResponse) {
    // The `error` property of http exception can be either an `Error` object, which we can use directly...
    if (error.error instanceof Error) {
      return error.error;
    }

    // ... or an`ErrorEvent`, which can provide us with the message but no stack...
    if (
      isPlatformBrowser(this.platformId) &&
      error.error instanceof ErrorEvent &&
      error.error.message
    ) {
      const extractedErrorEvent = new Error(error.error.message);
      extractedErrorEvent.name = 'ErrorEvent';
      return extractedErrorEvent;
    }

    const extractedServerError = new Error(`[${error.status}] ${error.url}`);
    extractedServerError.name = 'ServerError';
    return extractedServerError;
  }

  protected logHttpErrorForServer(error: HttpErrorResponse, req?: HttpRequest<unknown>) {
    if (!req) {
      console.error(`${new Date().toISOString()} [ HTTP ERROR ] [${error.status}] ${error.url}`);
    } else {
      const urlObj = new URL(req.urlWithParams);
      console.log(
        JSON.stringify({
          time: new Date().toISOString(),
          type: 'angular',
          uuid: req?.headers.get('custom-uuid'),
          method: req.method,
          status: error.status,
          protocol: urlObj.protocol?.replace(':', ''),
          host: urlObj.hostname,
          url: urlObj.pathname + urlObj.search,
          request_body: JSON.stringify(req.body),
          user_agent: req.headers.get('user-agent'),
          http_x_forwarded_for: req.headers.get('custom-x-forwarded-for'),
          http_referer: this.document.location.href,
        })
      );
    }
  }

  protected logErrorForServer(error: unknown) {
    console.error(`${new Date().toISOString()} [ ERROR HANDLED ] ${JSON.stringify(error)}`);
  }

  protected logCustomErrorForServer(errorCode: string, error: unknown) {
    console.error(`${new Date().toISOString()} [ DEBUG - CUSTOM ERROR ] [${errorCode}] ${JSON.stringify(error)}`);
  }

  private async initSentry() {
    if (isPlatformServer(this.platformId)) {
      return null;
    }
    const sentry = await import('@sentry/angular-ivy');
    const { BrowserTracing } = await import('@sentry/tracing');
    const traceService = this.injector.get(sentry.TraceService, null);

    if (!traceService && this.sentryConfig.debug) {
      console.warn('SentryReporter: Trace service not available');
    }

    if (this.sentryConfig.debug) {
      console.log('SentryReporter: initializing sentry', this.sentryConfig);
    }

    const integrations = [];
    const browserTracingConfig = this.sentryConfig.integrationsConfig?.browserTracing;
    if (browserTracingConfig) {
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      integrations.push(
        new BrowserTracing({
          tracePropagationTargets: browserTracingConfig.tracePropagationTargets ?? [],
          routingInstrumentation: sentry.routingInstrumentation,
        })
      );
    }

    sentry.init({
      dsn: this.sentryConfig.dns,
      enabled: this.sentryConfig.enabled,
      environment: this.sentryConfig.env,
      release: this.sentryConfig.release,
      dist: this.sentryConfig.dist,
      denyUrls: this.getDenyUrls(),
      tracesSampleRate: this.sentryConfig.tracesSampleRate,
      integrations,
    });
    return sentry;
  }

  protected isIE() {
    return (
      isPlatformBrowser(this.platformId) &&
      ('ActiveXObject' in window || /MSIE|Trident/.test(window.navigator.userAgent))
    );
  }

  private getDenyUrls() {
    if (!this.sentryConfig.denyUrlsConfig) {
      return defaultDenyUrls as RegExp[];
    }

    const urls = this.sentryConfig.denyUrlsConfig.useDefaultUrls ? defaultDenyUrls : [];
    return [
      ...urls,
      ...(this.sentryConfig.denyUrlsConfig.additionalUrls ?? []),
    ];
  }
}
