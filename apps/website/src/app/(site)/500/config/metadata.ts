import type { Metadata } from 'next';

export const serverErrorMetadata: Metadata = {
  title: '500 — Server Error | Autolokate',
  description:
    'We hit an unexpected error. Please try again in a moment. If it keeps happening, our team is one message away.',
  robots: { index: false, follow: false },
};
