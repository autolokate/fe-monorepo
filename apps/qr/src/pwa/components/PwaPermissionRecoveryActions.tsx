import type { PermissionKind } from '../permission-recovery.js';
import {
  getPermissionSettingsInstructions,
  openPermissionSettings,
} from '../permission-recovery.js';

import './PwaPermissionRecoveryActions.css';

type PwaPermissionRecoveryActionsProps = {
  kind: PermissionKind;
  onRetry?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  blocked?: boolean;
};

/** Shared permission recovery actions for camera and location flows. */
export function PwaPermissionRecoveryActions({
  kind,
  onRetry,
  onContinue,
  continueLabel = 'Continue without',
  blocked = false,
}: PwaPermissionRecoveryActionsProps) {
  const instructions = getPermissionSettingsInstructions(kind);

  return (
    <div className="pwa-permission-recovery" role="group" aria-label="Permission recovery">
      {blocked ? <p className="pwa-permission-recovery__hint">{instructions}</p> : null}
      <div className="pwa-permission-recovery__actions">
        {onRetry ? (
          <button type="button" className="pwa-permission-recovery__action" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        <button
          type="button"
          className="pwa-permission-recovery__action"
          onClick={() => {
            openPermissionSettings(kind);
          }}
        >
          Open Settings
        </button>
        {onContinue ? (
          <button type="button" className="pwa-permission-recovery__action" onClick={onContinue}>
            {continueLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
