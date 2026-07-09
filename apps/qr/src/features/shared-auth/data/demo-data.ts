import { formatMobileLocal } from '@/shared/format-mobile.js';

/** Valid demo mobile — only 9999999999 passes validation. */
export const demoMobileRaw = '9999999999';

/** Figma display format for mobile numbers. */
export { formatMobileLocal as formatMobileForDisplay } from '@/shared/format-mobile.js';

export const demoMobileDisplay = formatMobileLocal(demoMobileRaw);

/** @deprecated Use demoMobileDisplay */
export const demoMobile = demoMobileDisplay;

/** Valid demo OTP. */
export const demoOtp = '123456';
