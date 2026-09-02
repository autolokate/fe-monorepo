'use client';

import { Toaster } from 'sonner';

/** sonner Toaster — the website is light-only. */
export function ThemedToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-border/70 bg-card text-card-foreground shadow-lg',
        },
      }}
    />
  );
}
