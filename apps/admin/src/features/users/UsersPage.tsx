import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminUserDto, GrantableUserRole } from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlInput,
  AlPageHeader,
  AlStack,
  AlStatusBadge,
  AlText,
} from '@autolokate/ui';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomerDrilldown } from '@/features/users/CustomerDrilldown';
import { userLookupSchema, type UserLookupFormValues } from '@/features/users/user-lookup-schema';
import { describeUserRoleError, useAdminUserRoles } from '@/hooks/users/useAdminUserRoles';
import { AdminDetailField } from '@/platform/components/AdminDetailField';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './users.css';

/** The role the console hands out. CONSUMER is granted by signup, so ADMIN is the only useful lever here. */
const MANAGED_ROLE: GrantableUserRole = 'ADMIN';

type PendingAction = 'grant' | 'revoke' | null;

export function UsersPage() {
  const canWrite = useAdminPermission('users:write');
  const abortRef = useRef<AbortController | null>(null);

  const [account, setAccount] = useState<AdminUserDto | null>(null);
  const [lookupPhone, setLookupPhone] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);

  const { lookupMutation, grantMutation, revokeMutation } = useAdminUserRoles();

  const form = useForm<UserLookupFormValues>({
    resolver: zodResolver(userLookupSchema),
    defaultValues: { phone: '' },
  });

  const isAdmin = account?.roles.some((role) => role.role === MANAGED_ROLE) ?? false;
  const mutating = grantMutation.isPending || revokeMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAccount(null);
    setLookupPhone(null);
    setLookupError(null);
    try {
      setLookupPhone(values.phone);
      setAccount(
        await lookupMutation.mutateAsync({ phone: values.phone, signal: controller.signal }),
      );
    } catch (error) {
      setLookupError(describeUserRoleError(error));
    }
  });

  const runRoleChange = async (action: Exclude<PendingAction, null>) => {
    if (!account) {
      return;
    }
    const mutation = action === 'grant' ? grantMutation : revokeMutation;
    try {
      setAccount(await mutation.mutateAsync({ userId: account.id, role: MANAGED_ROLE }));
    } catch {
      // Surfaced by the mutation's toast; the account panel keeps its last good state.
    } finally {
      setPending(null);
    }
  };

  return (
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Users & Roles"
          description="Find an account by its verified phone number and grant or revoke the ADMIN role. Every change is written to the audit log."
        />

        <section className="admin-user-lookup" aria-label="Find an account">
          <form
            onSubmit={(event) => {
              void onSubmit(event);
            }}
          >
            <AlStack gap="md">
              <AlInput
                label="Phone number"
                mono
                autoComplete="off"
                placeholder="+919876543210"
                {...form.register('phone')}
                errorText={form.formState.errors.phone?.message}
                helperText="The number the person signs in with. Matched against an encrypted index — it is never stored by this screen."
              />
              <div className="admin-page-actions">
                <AlButton
                  type="submit"
                  size="sm"
                  loading={lookupMutation.isPending}
                  disabled={lookupMutation.isPending}
                >
                  Find account
                </AlButton>
              </div>
              {lookupError ? <p className="admin-inline-alert">{lookupError}</p> : null}
            </AlStack>
          </form>
        </section>

        {account ? (
          <>
            <section className="admin-user-account" aria-label="Account roles">
              <AlStack gap="md">
                <AdminDetailField label="Phone number" value={lookupPhone ?? '—'} mono />

                <AlStack gap="xs">
                  <AlText variant="caption" tone="muted">
                    Active roles
                  </AlText>
                  <div className="admin-user-account__roles">
                    {account.roles.length === 0 ? (
                      <AlText tone="muted">No active roles.</AlText>
                    ) : (
                      account.roles.map((role) => (
                        <AlStatusBadge
                          key={`${role.role}:${role.scopeRef ?? 'platform'}`}
                          label={role.role}
                          status={role.role === MANAGED_ROLE ? 'success' : 'inactive'}
                        />
                      ))
                    )}
                  </div>
                </AlStack>

                {canWrite ? (
                  <div className="admin-page-actions">
                    {isAdmin ? (
                      <AlButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={mutating}
                        loading={revokeMutation.isPending}
                        onClick={() => {
                          setPending('revoke');
                        }}
                      >
                        Revoke ADMIN
                      </AlButton>
                    ) : (
                      <AlButton
                        type="button"
                        size="sm"
                        disabled={mutating}
                        loading={grantMutation.isPending}
                        onClick={() => {
                          setPending('grant');
                        }}
                      >
                        Grant ADMIN
                      </AlButton>
                    )}
                  </div>
                ) : null}
              </AlStack>
            </section>

            <CustomerDrilldown accountId={account.id} />
          </>
        ) : null}

        <AlConfirmationDialog
          open={pending === 'grant'}
          onOpenChange={(open) => {
            if (!open) {
              setPending(null);
            }
          }}
          title="Grant ADMIN"
          description="This account will get full access to the admin console, including the ability to grant this role to others."
          confirmLabel="Grant ADMIN"
          loading={grantMutation.isPending}
          onConfirm={() => {
            void runRoleChange('grant');
          }}
        />

        <AlConfirmationDialog
          open={pending === 'revoke'}
          onOpenChange={(open) => {
            if (!open) {
              setPending(null);
            }
          }}
          title="Revoke ADMIN"
          description="This account loses admin access at its next sign-in refresh. You cannot revoke your own role, or the last remaining admin."
          confirmLabel="Revoke ADMIN"
          destructive
          loading={revokeMutation.isPending}
          onConfirm={() => {
            void runRoleChange('revoke');
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
