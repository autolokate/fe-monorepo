import { useQueries } from '@tanstack/react-query';

import { adminPaths } from '@/app/routes/admin-paths';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  ATTENTION_PAGE_LIMIT,
  attentionCount,
  countListPage,
  REVENUE_PAGE_LIMIT,
  summarizeTaxiRevenue,
  type AttentionCount,
  type TaxiRevenueSummary,
} from '@/services/dashboard/dashboard-attention';
import { fetchOwnershipClaims } from '@/services/ownership-claims/ownership-claims-service';
import { fetchAdminPartnersKycPage } from '@/services/partners/admin-partners-service';
import { fetchSupportTicketsPage } from '@/services/support/support-service';
import {
  fetchTaxiBookingsPage,
  fetchTaxiRevenuePage,
} from '@/services/taxi/taxi-operations-service';
import { fetchWebsiteBookingsPage } from '@/services/website-bookings/website-bookings-service';

export type AttentionItemId =
  | 'rc-reviews'
  | 'taxi-disputes'
  | 'taxi-never-started'
  | 'taxi-awaiting-deposit'
  | 'gst-reviews'
  | 'open-tickets'
  | 'session-bookings';

export type AttentionItem = {
  id: AttentionItemId;
  label: string;
  hint: string;
  /** Pre-filtered destination (filters live in the URL). */
  to: string;
  urgent: boolean;
  allowed: boolean;
  isLoading: boolean;
  error: string | null;
  value: AttentionCount | null;
};

const STALE_MS = 30_000;

/**
 * The operator's queue — every count is a real first-page read from an existing admin list route
 * (never an aggregate the server doesn't provide). Reads that write audit rows (audit log, incidents)
 * are deliberately excluded.
 */
export function useDashboardAttention() {
  const canClaims = useAdminPermission('inventory:view');
  const canTaxi = useAdminPermission('taxi:read');
  const canPartners = useAdminPermission('partners:read');
  const canSupport = useAdminPermission('support:view');
  const canSessions = useAdminPermission('website-bookings:view');

  const results = useQueries({
    queries: [
      {
        queryKey: ['admin', 'dashboard', 'attention', 'rc-reviews'],
        enabled: canClaims,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const [submitted, underReview] = await Promise.all([
            fetchOwnershipClaims({ status: 'SUBMITTED' }, signal),
            fetchOwnershipClaims({ status: 'UNDER_REVIEW' }, signal),
          ]);
          const first = countListPage(submitted, false);
          const second = countListPage(underReview, false);
          return attentionCount(first.count + second.count, false);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'taxi-disputes'],
        enabled: canTaxi,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchTaxiBookingsPage(
            { status: 'DISPUTED', limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.nextCursor !== null);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'taxi-never-started'],
        enabled: canTaxi,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchTaxiBookingsPage(
            { flagged: true, limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.nextCursor !== null);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'taxi-awaiting-deposit'],
        enabled: canTaxi,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchTaxiBookingsPage(
            { status: 'PENDING_PARTNER_DEPOSIT', limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.nextCursor !== null);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'gst-reviews'],
        enabled: canPartners,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchAdminPartnersKycPage(
            { status: 'PENDING_REVIEW', limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.pagination?.hasMore === true);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'open-tickets'],
        enabled: canSupport,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchSupportTicketsPage(
            { status: 'OPEN', limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.pagination?.hasMore === true);
        },
      },
      {
        queryKey: ['admin', 'dashboard', 'attention', 'session-bookings'],
        enabled: canSessions,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const page = await fetchWebsiteBookingsPage(
            { status: 'PENDING', limit: ATTENTION_PAGE_LIMIT },
            signal,
          );
          return countListPage(page.items, page.pagination?.hasMore === true);
        },
      },
    ],
  });

  const meta: Omit<AttentionItem, 'isLoading' | 'error' | 'value'>[] = [
    {
      id: 'rc-reviews',
      label: 'RC & ownership reviews',
      hint: 'Claims waiting for approve / reject',
      to: `${adminPaths.ownershipClaims}?status=SUBMITTED`,
      urgent: false,
      allowed: canClaims,
    },
    {
      id: 'taxi-disputes',
      label: 'Taxi disputes',
      hint: 'Deposit release frozen until you rule',
      to: `${adminPaths.taxiBookings}?status=DISPUTED`,
      urgent: true,
      allowed: canTaxi,
    },
    {
      id: 'taxi-never-started',
      label: 'Trips never started',
      hint: 'Confirmed, nobody reported — no money moved',
      to: `${adminPaths.taxiBookings}?flagged=1`,
      urgent: true,
      allowed: canTaxi,
    },
    {
      id: 'taxi-awaiting-deposit',
      label: 'Awaiting partner deposit',
      hint: 'Customer paid the fee; partner must pay to confirm',
      to: `${adminPaths.taxiBookings}?status=PENDING_PARTNER_DEPOSIT`,
      urgent: false,
      allowed: canTaxi,
    },
    {
      id: 'gst-reviews',
      label: 'GST reviews',
      hint: 'Garage KYC submitted for verification',
      to: `${adminPaths.partnersKyc}?status=PENDING_REVIEW`,
      urgent: false,
      allowed: canPartners,
    },
    {
      id: 'open-tickets',
      label: 'Open support tickets',
      hint: 'Not yet picked up',
      to: `${adminPaths.support}?status=OPEN`,
      urgent: false,
      allowed: canSupport,
    },
    {
      id: 'session-bookings',
      label: 'Session bookings to confirm',
      hint: 'Website sessions awaiting confirmation',
      to: `${adminPaths.websiteBookings}?status=PENDING`,
      urgent: false,
      allowed: canSessions,
    },
  ];

  const items: AttentionItem[] = meta.map((entry, index) => {
    const query = results[index];
    return {
      ...entry,
      isLoading: entry.allowed && (query?.isLoading ?? false),
      error: query?.isError ? mapAdminApiError(query.error).userMessage : null,
      value: query?.data ?? null,
    };
  });

  return {
    items,
    isFetching: results.some((query) => query.isFetching),
    refetch: () => {
      for (const query of results) void query.refetch();
    },
  };
}

export function useDashboardTaxiRevenue() {
  const canTaxi = useAdminPermission('taxi:read');
  const [query] = useQueries({
    queries: [
      {
        queryKey: ['admin', 'dashboard', 'taxi-revenue'],
        enabled: canTaxi,
        staleTime: STALE_MS,
        retry: false,
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<TaxiRevenueSummary> => {
          const page = await fetchTaxiRevenuePage({ limit: REVENUE_PAGE_LIMIT }, signal);
          countListPage(page.items, false);
          return summarizeTaxiRevenue(page.items, page.nextCursor !== null);
        },
      },
    ],
  });
  return {
    allowed: canTaxi,
    summary: query.data ?? null,
    isLoading: canTaxi && query.isLoading,
    error: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refetch: () => void query.refetch(),
  };
}
