import type { AdminUserDto, GrantableUserRole } from '@autolokate/api-client';
import { ApiError, normalizeApiError } from '@autolokate/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { grantRole, lookupUserByPhone, revokeRole } from '@/services/users/admin-users-service';

/**
 * The role console's failures are the interesting part of its contract — "no account on that number"
 * (404) and the lockout guards (`last_admin` / `last_role` 409) are outcomes an operator must act on,
 * not "Something went wrong". Known codes get a fixed, actionable message; other 404/409s show the
 * server's text; everything else falls back to the shared mapper.
 */
export function describeUserRoleError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'last_admin') {
      return 'Blocked: this would remove your own OPERATOR role or the platform’s last OPERATOR. Grant OPERATOR to another account first.';
    }
    if (error.code === 'last_role') {
      return 'Blocked: this is the account’s only active role, and an account with no role cannot sign in. Use “Flag for review” instead.';
    }
    if (error.status === 400) {
      return 'Only CONSUMER and OPERATOR can be changed here. Partner roles are managed through partner onboarding.';
    }
  }
  const normalized = normalizeApiError(error);
  if (normalized.status === 404 || normalized.status === 409) {
    return normalized.message;
  }
  return mapAdminApiError(error).userMessage;
}

export function useAdminUserRoles() {
  const queryClient = useQueryClient();

  const lookupMutation = useMutation({
    mutationFn: ({ phone, signal }: { phone: string; signal?: AbortSignal }) =>
      lookupUserByPhone(phone, signal),
    retry: 0,
    onError: (error) => {
      // A 404 is an expected answer to "who is this number?", not an incident — the form shows it inline.
      if (normalizeApiError(error).status !== 404) {
        reportAdminApiError(error, { context: 'users:lookup', toast: true });
      }
    },
  });

  const grantMutation = useMutation({
    mutationFn: ({
      userId,
      role,
      signal,
    }: {
      userId: string;
      role: GrantableUserRole;
      signal?: AbortSignal;
    }) => grantRole(userId, role, signal),
    retry: 0,
    onSuccess: async (_result: AdminUserDto, variables) => {
      showSuccessToast(`${variables.role} granted.`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      // 400/409 are explained inline by `describeUserRoleError`; only unexpected failures toast.
      const status = normalizeApiError(error).status;
      if (status !== 400 && status !== 409) {
        reportAdminApiError(error, { context: 'users:grant-role', toast: true });
      }
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({
      userId,
      role,
      signal,
      reason,
    }: {
      userId: string;
      role: GrantableUserRole;
      signal?: AbortSignal;
      /** Optional 3..500 — stored on the `USER_ROLE_REVOKED` audit row. */
      reason?: string;
    }) => revokeRole(userId, role, signal, reason),
    retry: 0,
    onSuccess: async (_result: AdminUserDto, variables) => {
      showSuccessToast(`${variables.role} revoked.`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      const status = normalizeApiError(error).status;
      if (status !== 400 && status !== 409) {
        reportAdminApiError(error, { context: 'users:revoke-role', toast: true });
      }
    },
  });

  return { lookupMutation, grantMutation, revokeMutation };
}
