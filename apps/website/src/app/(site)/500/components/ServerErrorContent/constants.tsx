import type { ServerErrorCopy } from './types';

export const SERVER_ERROR_COPY: ServerErrorCopy = {
  eyebrow: 'Server error',
  headline: 'Something went wrong at our end',
  description:
    'We hit an unexpected error. Please try again in a moment. If it keeps happening, our team is one message away.',
  secondaryCta: { label: 'Contact support', href: '/contact-us' },
  primaryCta: { label: 'Try again' },
};
