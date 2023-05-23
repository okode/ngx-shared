import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { SentryConfig } from '../models/sentry-config.model';
import { SentryErrorReporterService } from '../services/sentry-error-reporter.service';
import { SENTRY_CONFIG } from '../tokens/sentry-config.token';

@Injectable({
  providedIn: 'root',
})
export class SentryErrorHandler implements ErrorHandler {
  constructor(
    private readonly sentryErrorReporterService: SentryErrorReporterService,
    @Inject(SENTRY_CONFIG) private readonly sentryConfig: SentryConfig
  ) {}

  handleError(error: unknown): void {
    if (this.isLoadingChunkError(error as Error)) {
      // Loading chunk error (force reload)
      window.location.reload();
      return;
    }

    this.sentryErrorReporterService.sendError(error);
    if (this.sentryConfig.logErrors === undefined || this.sentryConfig.logErrors) {
      console.error('ErrorHandler:', error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isLoadingChunkError(errorCandidate?: Error) {
    return errorCandidate && /Loading chunk \d+ failed/.test(errorCandidate.message);
  }
}
