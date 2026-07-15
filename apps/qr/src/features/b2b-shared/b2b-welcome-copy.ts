/** Shared welcome chrome copy (not plan feature bullets — those come from the API). */

export const B2B_WELCOME_TITLE = 'Activate your plan';

export const B2B_WELCOME_SUCCESS_CTA = 'Activate my plan';
export const B2B_WELCOME_LOADING_BODY = 'Loading your plan\u2026';
export const B2B_WELCOME_LOADING_CTA = 'Loading\u2026';
export const B2B_WELCOME_ERROR_CTA = 'Try again';

export const B2B_ERROR_TITLE = 'Couldn\u2019t load your plan';
export const B2B_ERROR_MESSAGE =
  'Check your connection and try again. Your plan is safe. It\u2019s already paid for.';

export function formatWelcomeRiderRowLabel(riderCount: number): string | undefined {
  if (riderCount <= 0) {
    return undefined;
  }
  const noun = riderCount === 1 ? 'rider' : 'riders';
  return `Rider cover \u00b7 ${String(riderCount)} ${noun} added`;
}
