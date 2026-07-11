import type { AdminUserDto, GrantableUserRole } from '@autolokate/api-client';
import { normalizeApiError } from '@autolokate/api-client';
import { useMutation } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { grantRole, lookupUserByPhone, revokeRole } from '@/services/users/admin-users-service';

/**
 * The role console's failures are the interesting part of its contract — "no account on that number"
 * (404) and the lockout guards (`last_admin` 409) are outcomes an operator must read verbatim, not
 * flattened into "Something went wrong". The server authors those messages; everything else falls back
 * to the shared mapper.
 */
export function describeUserRoleError(error: unknown): string {
  const normalized = normalizeApiError(error);
  if (normalized.status === 404 || normalized.status === 409) {
    return normalized.message;
  }
  return mapAdminApiError(error).userMessage;
}

export function useAdminUserRoles() {
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
    onSuccess: (_result: AdminUserDto, variables) => {
      showSuccessToast(`${variables.role} granted.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'users:grant-role', toast: true });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({
      userId,
      role,
      signal,
    }: {
      userId: string;
      role: GrantableUserRole;
      signal?: AbortSignal;
    }) => revokeRole(userId, role, signal),
    retry: 0,
    onSuccess: (_result: AdminUserDto, variables) => {
      showSuccessToast(`${variables.role} revoked.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'users:revoke-role', toast: true });
    },
  });

  return { lookupMutation, grantMutation, revokeMutation };
}
