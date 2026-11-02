import type { AdminUserRoleFamily, AdminUserSummaryDto } from '@autolokate/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextCursorOf } from '@/platform/query/cursor-pages';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { listUsers } from '@/services/users/admin-users-service';

export type AdminUsersStatusFilter = 'ALL' | 'ACTIVE' | 'CLOSED';
export type AdminUsersTypeFilter = 'ALL' | AdminUserRoleFamily;

export function normalizePhoneSearch(raw: string): string | undefined {
  const trimmed = raw.trim().replace(/[\s-]/g, '');
  if (!trimmed) {
    return undefined;
  }
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^[6-9]\d{9}$/.test(trimmed)) {
    return `+91${trimmed}`;
  }
  if (/^91[6-9]\d{9}$/.test(trimmed)) {
    return `+${trimmed}`;
  }
  return trimmed;
}

export function useAdminUsers() {
  const canRead = useAdminPermission('users:read');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneApplied, setPhoneApplied] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<AdminUsersStatusFilter>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<AdminUsersTypeFilter>('ALL');

  const queryKey = useMemo(
    () => ['admin', 'users', 'list', phoneApplied ?? '', statusFilter, typeFilter] as const,
    [phoneApplied, statusFilter, typeFilter],
  );

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      listUsers(
        {
          phone: phoneApplied,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          type: typeFilter === 'ALL' ? undefined : typeFilter,
          limit: ADMIN_LIST_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    enabled: canRead,
    retry: 0,
  });

  const users: AdminUserSummaryDto[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const userErrorMessage = query.error ? mapAdminApiError(query.error).userMessage : null;

  const applyPhoneSearch = () => {
    setPhoneApplied(normalizePhoneSearch(phoneInput));
  };

  const clearPhoneSearch = () => {
    setPhoneInput('');
    setPhoneApplied(undefined);
  };

  return {
    users,
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage,
    phoneInput,
    setPhoneInput,
    phoneApplied,
    applyPhoneSearch,
    clearPhoneSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh: () => {
      void query.refetch();
    },
  };
}
