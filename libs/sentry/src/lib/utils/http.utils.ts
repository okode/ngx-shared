import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";

export function serializeBodyError(res: HttpErrorResponse) {
  const { error } = res;
  const isSerializable =
    error &&
    typeof error === 'object' &&
    !(error instanceof Event) &&
    !(error instanceof Error);
  return isSerializable ? JSON.stringify(error) : error;
}

export function getHeadersAsString(headers: HttpHeaders) {
  return JSON.stringify(
    headers.keys().map((hName) => ({ hName, hValue: headers.get(hName) }))
  );
}
