import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ErrorHandler, Provider } from "@angular/core";
import { SentryErrorHandler } from "./error-handlers/sentry.error-handler";
import { SentryReportErrorHttpInterceptor } from "./http-interceptors/sentry-report-error.http-interceptor";
import { SentryConfig } from "./models/sentry-config.model";
import { SENTRY_CONFIG } from "./tokens/sentry-config.token";

export function provideSentry(config: SentryConfig): Provider[] {
  return [
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: SentryReportErrorHttpInterceptor, multi: true },
    { provide: SENTRY_CONFIG, useValue: config }
  ];
}
