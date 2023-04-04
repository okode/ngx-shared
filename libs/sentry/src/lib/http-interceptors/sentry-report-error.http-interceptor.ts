import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { SentryErrorReporterService } from '../services/sentry-error-reporter.service';

@Injectable()
export class SentryReportErrorHttpInterceptor implements HttpInterceptor {
  constructor(private readonly sentryErrorReporter: SentryErrorReporterService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith('http')) {
      return next.handle(request);
    }
    return next.handle(request).pipe(
      catchError(e => {
        this.handleHttpError(request, e);
        return throwError(() => e);
      })
    );
  }

  private handleHttpError(req: HttpRequest<unknown>, e: unknown) {
    if (!(e instanceof HttpErrorResponse)) {
      return;
    }
    this.sentryErrorReporter.sendServerError(e, req);
  }
}
