import { AlButton, AlHeading, AlStack, AlText } from '../primitives/index';
import type { ReactNode } from 'react';
import './PageHeader.css';

export type AlPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};

/** Top-of-page title block with optional breadcrumbs and actions. */
export function AlPageHeader({ title, description, breadcrumbs, actions }: AlPageHeaderProps) {
  return (
    <header className="al-page-header">
      <AlStack gap="sm" className="al-page-header__main">
        {breadcrumbs ? <div className="al-page-header__breadcrumbs">{breadcrumbs}</div> : null}
        <AlStack gap="xs">
          <AlHeading variant="h2">{title}</AlHeading>
          {description ? <AlText tone="muted">{description}</AlText> : null}
        </AlStack>
      </AlStack>
      {actions ? <div className="al-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export type AlSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AlSectionHeader({ title, description, actions }: AlSectionHeaderProps) {
  return (
    <div className="al-section-header">
      <AlStack gap="xs">
        <AlHeading variant="h4">{title}</AlHeading>
        {description ? (
          <AlText tone="muted" variant="caption">
            {description}
          </AlText>
        ) : null}
      </AlStack>
      {actions ? <div className="al-section-header__actions">{actions}</div> : null}
    </div>
  );
}

export type AlPageHeaderActionProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AlPageHeaderAction({
  label,
  onClick,
  loading,
  variant = 'primary',
}: AlPageHeaderActionProps) {
  return (
    <AlButton variant={variant} size="sm" {...(loading ? { loading: true } : {})} onClick={onClick}>
      {label}
    </AlButton>
  );
}
