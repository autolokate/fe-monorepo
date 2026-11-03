import type { AdminUserRoleDto, GrantableUserRole } from '@autolokate/api-client';
import { AlButton, AlModal, AlText } from '@autolokate/ui';
import { useState } from 'react';

import { describeUserRoleError, useAdminUserRoles } from '@/hooks/users/useAdminUserRoles';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';

/** The only roles the admin plane may toggle; partner roles come from partner onboarding. */
const GRANTABLE_ROLES: readonly { role: GrantableUserRole; summary: string }[] = [
  { role: 'CONSUMER', summary: 'Customer app access.' },
  { role: 'OPERATOR', summary: 'Full Admin console access (with step-up verification).' },
];

type PendingRoleChange = { action: 'grant' | 'revoke'; role: GrantableUserRole };

export type UserRolesPanelProps = {
  userId: string;
  roles: AdminUserRoleDto[];
  /** Called after a successful change so the caller can refetch the account. */
  onChanged: () => void;
};

/**
 * Grant / revoke the unscoped platform roles (CONSUMER, OPERATOR). Every change is confirmed first and
 * audited server-side; revoking also ends that role's sessions. Lockout guards (`last_admin`,
 * `last_role`) are explained inline rather than flattened into a generic failure.
 */
export function UserRolesPanel({ userId, roles, onChanged }: UserRolesPanelProps) {
  const { grantMutation, revokeMutation } = useAdminUserRoles();
  const [pending, setPending] = useState<PendingRoleChange | null>(null);

  const activeMutation = pending?.action === 'revoke' ? revokeMutation : grantMutation;
  const submitError = activeMutation.isError ? describeUserRoleError(activeMutation.error) : null;
  const held = new Set(roles.filter((r) => r.scopeRef === null).map((r) => r.role));
  const partnerRoles = roles.filter(
    (r) => !GRANTABLE_ROLES.some((g) => g.role === r.role) || r.scopeRef !== null,
  );

  const close = () => {
    setPending(null);
    grantMutation.reset();
    revokeMutation.reset();
  };

  const confirm = async (reason?: string) => {
    if (!pending) {
      return;
    }
    try {
      if (pending.action === 'revoke') {
        await revokeMutation.mutateAsync({
          userId,
          role: pending.role,
          ...(reason ? { reason } : {}),
        });
      } else {
        await grantMutation.mutateAsync({ userId, role: pending.role });
      }
      onChanged();
      close();
    } catch {
      // Error stays inline in the dialog (and toasts when unexpected).
    }
  };

  return (
    <AdminPanel
      title="Platform roles"
      subtitle="Grant or revoke CONSUMER and OPERATOR. Changes are audited."
    >
      <div className="admin-user-account__actions" data-testid="users-roles-panel">
        {GRANTABLE_ROLES.map(({ role, summary }) => {
          const has = held.has(role);
          return (
            <div key={role} className="admin-user-account__roles">
              <AdminStatusChip label={humanizeAdminLabel(role)} tone={has ? 'active' : 'none'} />
              <AlText variant="caption" tone="muted">
                {summary}
              </AlText>
              <AlButton
                type="button"
                size="sm"
                variant={has ? 'secondary' : 'primary'}
                data-testid={`users-role-${has ? 'revoke' : 'grant'}-${role}`}
                onClick={() => {
                  setPending({ action: has ? 'revoke' : 'grant', role });
                }}
              >
                {has ? `Revoke ${humanizeAdminLabel(role)}` : `Grant ${humanizeAdminLabel(role)}`}
              </AlButton>
            </div>
          );
        })}
      </div>
      {partnerRoles.length > 0 ? (
        <AlText variant="caption" tone="muted">
          Partner roles ({partnerRoles.map((r) => humanizeAdminLabel(r.role)).join(', ')}) are
          managed through partner onboarding, not here.
        </AlText>
      ) : null}

      <AdminReasonDialog
        open={pending?.action === 'revoke'}
        onOpenChange={(open) => {
          if (!open && !revokeMutation.isPending) {
            close();
          }
        }}
        title={pending ? `Revoke ${humanizeAdminLabel(pending.role)}?` : 'Revoke role'}
        description="The account loses this role immediately and its sessions for this role are signed out."
        confirmLabel="Revoke role"
        required={false}
        destructive
        loading={revokeMutation.isPending}
        error={pending?.action === 'revoke' ? submitError : null}
        testIdPrefix="users-role"
        onConfirm={(reason) => {
          void confirm(reason);
        }}
      />

      <AlModal
        open={pending?.action === 'grant'}
        onOpenChange={(open) => {
          if (!open && !activeMutation.isPending) {
            close();
          }
        }}
        size="sm"
        title={pending ? `Grant ${humanizeAdminLabel(pending.role)}?` : 'Grant role'}
        description={
          pending?.role === 'OPERATOR'
            ? 'This gives the account full Admin console access.'
            : 'The account gains customer app access.'
        }
        footer={
          <div className="admin-modal-actions">
            <AlButton
              type="button"
              size="sm"
              variant="primary"
              data-testid="users-role-confirm"
              loading={activeMutation.isPending}
              disabled={activeMutation.isPending}
              onClick={() => {
                void confirm();
              }}
            >
              Grant role
            </AlButton>
            <AlButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={activeMutation.isPending}
              onClick={close}
            >
              Cancel
            </AlButton>
          </div>
        }
      >
        {submitError ? (
          <p className="admin-form-error" role="alert" data-testid="users-role-error">
            {submitError}
          </p>
        ) : null}
      </AlModal>
    </AdminPanel>
  );
}
