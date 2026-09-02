/** Query flag: land on mobile auth form (skip QR scan) after welcome / in-flow auth. */
export const AUTH_ENTRY_QUERY = {
  param: 'auth',
  continueValue: 'continue',
} as const;

export function isAuthMobileContinueEntry(searchParams: URLSearchParams): boolean {
  return searchParams.get(AUTH_ENTRY_QUERY.param) === AUTH_ENTRY_QUERY.continueValue;
}
