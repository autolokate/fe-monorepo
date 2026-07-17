import type { Metadata } from 'next';

export const notFoundMetadata: Metadata = {
  title: '404 — Page Not Found | Autolokate',
  description:
    "The page you are looking for was moved, removed, or never existed. Let's get you back on the road.",
  robots: { index: false, follow: false },
};
