import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminUserDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlPageHeader, AlStack, AlStatusBadge, AlText } from '@autolokate/ui';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomerDrilldown } from '@/features/users/CustomerDrilldown';
import { userLookupSchema, type UserLookupFormValues } from '@/features/users/user-lookup-schema';
import { describeUserRoleError, useAdminUserRoles } from '@/hooks/users/useAdminUserRoles';
import { AdminDetailField } from '@/platform/components/AdminDetailField';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './users.css';

/**
 * Customers phone lookup — Nest `GET /admin/v1/users?phone=` only.
 * Role grant/revoke UI is omitted: POST/DELETE …/roles* are product-blocked (absent from Nest OA).
 */
export function UsersPage() {
  const abortRef = useRef<AbortController | null>(null);

  const [account, setAccount] = useState<AdminUserDto | null>(null);
  const [lookupPhone, setLookupPhone] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const { lookupMutation } = useAdminUserRoles();

  const form = useForm<UserLookupFormValues>({
    resolver: zodResolver(userLookupSchema),
    defaultValues: { phone: '' },
  });

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

  return (
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Customers"
          description="Find a customer by their verified phone number to see Nest roles, orders, and coverage. Role grant/revoke is unavailable until Nest ships that contract."
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
                data-testid="users-lookup-phone"
                {...form.register('phone')}
                errorText={form.formState.errors.phone?.message}
                helperText="The number the person signs in with. Matched against an encrypted index — it is never stored by this screen."
              />
              <div className="admin-page-actions">
                <AlButton
                  type="submit"
                  size="sm"
                  data-testid="users-lookup-submit"
                  loading={lookupMutation.isPending}
                  disabled={lookupMutation.isPending}
                >
                  Find account
                </AlButton>
              </div>
              {lookupError ? (
                <p className="admin-inline-alert" data-testid="users-lookup-error">
                  {lookupError}
                </p>
              ) : null}
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
                          status="inactive"
                        />
                      ))
                    )}
                  </div>
                </AlStack>
              </AlStack>
            </section>

            <CustomerDrilldown accountId={account.id} />
          </>
        ) : null}
      </AlStack>
    </RequirePermission>
  );
}
