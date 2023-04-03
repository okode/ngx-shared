import {
  HttpErrorResponse,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';

export const interceptHttpReqWithErrorResponse = (
  httpInterceptor: HttpInterceptor,
  req: HttpRequest<unknown>,
  error: HttpErrorResponse | Error
) => {
  const handleSpy = jest.fn(() => throwError(() => error));
  httpInterceptor
    .intercept(req, {
      handle: handleSpy,
    })
    .subscribe({
      next: () => {
        throw new Error('Should fail');
      },
      error: e => {
        expect(e).toBe(error);
      },
    });
  return { handleSpy };
};

export const interceptHttpReqWithHttpSuccessResponse = (
  httpInterceptor: HttpInterceptor,
  req: HttpRequest<unknown>,
  successRes: HttpResponse<unknown>
) => {
  const handleSpy = jest.fn(() => of(successRes));
  httpInterceptor
    .intercept(req, {
      handle: handleSpy,
    })
    .subscribe({
      next: res => {
        expect(res).toBe(successRes);
      },
      error: () => {
        throw new Error('Should fail');
      },
    });
  return { handleSpy };
};
