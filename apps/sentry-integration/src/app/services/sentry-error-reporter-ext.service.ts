import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SentryErrorReporterService } from '@okode/ngx-sentry';

@Injectable({
  providedIn: 'root',
})
export class SentryErrorReporterServiceExt extends SentryErrorReporterService {

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
}
