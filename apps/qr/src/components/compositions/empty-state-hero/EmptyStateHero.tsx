import type { ReactNode } from 'react';
import { AlHeading, AlStack, AlText } from '@autolokate/ui';

export type EmptyStateHeroVariant = 'empty' | 'loading' | 'success' | 'processing';

export type EmptyStateHeroProps = {
  variant?: EmptyStateHeroVariant;
  icon?: ReactNode;
  heading?: string;
  headingVariant?: 'h2' | 'h3';
  message?: ReactNode;
  children?: ReactNode;
};

export function EmptyStateHero({
  icon,
  heading,
  headingVariant = 'h3',
  message,
  children,
}: EmptyStateHeroProps) {
  const hasHeadingBlock = Boolean(heading || message);

  return (
    <div className="ob-state-panel">
      {icon}
      {hasHeadingBlock ? (
        <AlStack gap="sm" align="center">
          {heading ? <AlHeading variant={headingVariant}>{heading}</AlHeading> : null}
          {message ? (
            typeof message === 'string' ? (
              <AlText tone="muted" align="center">
                {message}
              </AlText>
            ) : (
              message
            )
          ) : null}
        </AlStack>
      ) : null}
      {children}
    </div>
  );
}
