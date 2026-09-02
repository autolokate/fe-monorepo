import type { ReactNode } from 'react';

import './inline-status-banner.css';

export type InlineStatusBannerVariant = 'loading' | 'success' | 'warning' | 'error';

export type InlineStatusBannerProps = {
  variant: InlineStatusBannerVariant;
  children: ReactNode;
};

export function InlineStatusBanner({ variant, children }: InlineStatusBannerProps) {
  return (
    <div
      className={`ob-inline-status-banner ob-inline-status-banner--${variant}`}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
