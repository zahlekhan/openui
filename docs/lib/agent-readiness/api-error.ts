/* One error shape for every JSON API on this site, so an agent can branch on
   `code`, show `error`, and act on `hint` without scraping an HTML page.
   `error` stays a plain string because the waitlist form already reads it. */

export interface ApiErrorBody {
  error: string;
  code: string;
  hint?: string;
  status: number;
}

export function apiError(
  status: number,
  code: string,
  message: string,
  hint?: string,
  headers?: HeadersInit,
): Response {
  const body: ApiErrorBody = { error: message, code, status, ...(hint ? { hint } : {}) };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
