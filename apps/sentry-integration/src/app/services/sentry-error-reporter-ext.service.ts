import { DOCUMENT, isPlatformServer } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { INJECTOR, Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { SENTRY_CONFIG, SentryConfig, SentryErrorReporterService } from '@okode/ngx-sentry';

@Injectable({
  providedIn: 'root',
})
export class SentryErrorReporterServiceExt extends SentryErrorReporterService {

  constructor(
    @Inject(INJECTOR) injector: Injector,
    @Inject(PLATFORM_ID) platformId: string,
    @Inject(DOCUMENT) document: Document,
    @Inject(SENTRY_CONFIG) sentryConfig: SentryConfig
  ) {
    super(injector, platformId, document, sentryConfig);
  }

  override sendError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      this.sendServerError(error);
      return;
    }

    const extractedError = this.buildError(error);

    if (this.isIE()) {
      this.sendCustomError(SentryErrorReporterService.IE_ERROR_CODE, extractedError);
      return;
    }

    if (isPlatformServer(super.platformId)) {
      const error = extractedError.stack?.replace(/\n/g, '') ?? extractedError;
      this.logErrorForServer(error);
    } else {
      this.sentry$.subscribe(s => {
        const scope = new s.Scope();
        scope.setTag('customError.errorType','ERROR.CUSTOM'
        );
        scope.setContext(SentryErrorReporterService.CONTEXT_FIELDS.rawError, { detail: error });
        s.captureException(extractedError, scope);
      });
    }
  }
}
