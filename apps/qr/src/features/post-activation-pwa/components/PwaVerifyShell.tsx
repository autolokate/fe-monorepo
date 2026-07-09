import type { ReactNode } from 'react';
import { AlHeading, AlText } from '@autolokate/ui';

import { PwaScanShell } from './PwaScanShell.js';

import './pwa-verify-shell.css';

export type PwaVerifyShellProps = {
  title: string;
  description?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
};

/** PWA-native verify frame — replaces onboarding AuthStepShell chrome for 03–05. */
export function PwaVerifyShell({
  title,
  description,
  showBack = true,
  onBack,
  footer,
  children,
}: PwaVerifyShellProps) {
  return (
    <PwaScanShell showBack={showBack} onBack={onBack} footer={footer}>
      <div className="pwa-verify-shell">
        <div className="pwa-verify-shell__intro">
          <AlHeading variant="h2">{title}</AlHeading>
          {description ? (
            typeof description === 'string' ? (
              <AlText tone="muted">{description}</AlText>
            ) : (
              description
            )
          ) : null}
        </div>
        <div className="pwa-verify-shell__content">{children}</div>
      </div>
    </PwaScanShell>
  );
}
