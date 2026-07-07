import type { ReactNode } from 'react';

import { cn } from '../../utils/cn.js';
import { AlButton, AlHeading, AlStack, AlText } from '../primitives/index.js';
import './EmptyState.css';

export type AlEmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function AlEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false,
}: AlEmptyStateProps) {
  return (
    <div className={cn('al-empty-state', compact && 'al-empty-state--compact')} role="status">
      {icon ? <div className="al-empty-state__icon" aria-hidden>{icon}</div> : null}
      <AlStack gap="xs" align="center">
        <AlHeading variant="h4">{title}</AlHeading>
        {description ? <AlText tone="muted">{description}</AlText> : null}
      </AlStack>
      {actionLabel && onAction ? (
        <AlButton variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </AlButton>
      ) : null}
    </div>
  );
}

export type AlErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function AlErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: AlErrorStateProps) {
  return (
    <div className="al-error-state" role="alert">
      <div className="al-error-state__icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 6.5v4M10 13.5h.01M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <AlStack gap="xs" align="center">
        <AlHeading variant="h4">{title}</AlHeading>
        <AlText tone="muted">{message}</AlText>
      </AlStack>
      {onRetry ? (
        <AlButton variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </AlButton>
      ) : null}
    </div>
  );
}
