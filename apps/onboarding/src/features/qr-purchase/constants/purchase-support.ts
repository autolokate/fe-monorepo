/** Customer support contact for purchase flow blockers. */
export const PURCHASE_SUPPORT_EMAIL = 'support@autolokate.com';

export function buildPurchaseSupportMailto(subject: string): string {
  const encodedSubject = encodeURIComponent(subject);
  return `mailto:${PURCHASE_SUPPORT_EMAIL}?subject=${encodedSubject}`;
}
