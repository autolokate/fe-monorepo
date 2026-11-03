import type { AdminQueueStatsDto, AdminTaxiRevenueDto } from '@autolokate/api-client';

/** Page size for every dashboard queue read — counts above it read "50+" (never a fake total). */
export const ATTENTION_PAGE_LIMIT = 50;
/** Newest taxi revenue ledger rows summed on the dashboard. */
export const REVENUE_PAGE_LIMIT = 100;

export type AttentionCount = {
  count: number;
  /** True when the server had more rows than the page we read. */
  capped: boolean;
};

export function attentionCount(itemCount: number, hasMore: boolean): AttentionCount {
  return { count: itemCount, capped: hasMore };
}

/**
 * Counts one list page. A response that isn't a list (an older / different server) throws, so the
 * tile shows "couldn't load" instead of a wrong number or a crash.
 */
export function countListPage(items: unknown, hasMore: boolean): AttentionCount {
  if (!Array.isArray(items)) {
    throw new Error('Unexpected response from the server for this queue.');
  }
  return attentionCount(items.length, hasMore);
}

/**
 * An exact counter from `GET /admin/v1/stats/queues`. A missing / non-integer field (older or
 * different server) throws, so the tile says "couldn't load" rather than showing a wrong number.
 */
export function attentionFromQueueStats(
  stats: Partial<AdminQueueStatsDto> | null | undefined,
  key: keyof AdminQueueStatsDto,
): AttentionCount {
  const value = stats?.[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error('Unexpected response from the server for this queue.');
  }
  return attentionCount(value, false);
}

/** "0", "7", "50+" — a capped page is never shown as an exact total. */
export function formatAttentionCount(value: AttentionCount): string {
  if (!Number.isFinite(value.count)) return '—';
  const text = value.count.toLocaleString('en-IN');
  return value.capped ? `${text}+` : text;
}

export type AttentionTone = 'calm' | 'attention' | 'urgent';

/** Zero is calm; disputes / flagged money states escalate to urgent, everything else to attention. */
export function attentionTone(value: AttentionCount, urgent: boolean): AttentionTone {
  if (value.count === 0) return 'calm';
  return urgent ? 'urgent' : 'attention';
}

export type TaxiRevenueSummary = {
  advanceEarnedPaise: number;
  advanceForfeitedPaise: number;
  depositForfeitedPaise: number;
  totalPaise: number;
  entries: number;
  /** True when older ledger rows exist beyond the page that was summed. */
  partial: boolean;
};

/** Sums the ledger rows we actually read, by kind. Amounts are server paise — no client maths on rates. */
export function summarizeTaxiRevenue(
  rows: readonly Pick<AdminTaxiRevenueDto, 'kind' | 'amountPaise'>[],
  hasMore: boolean,
): TaxiRevenueSummary {
  const summary: TaxiRevenueSummary = {
    advanceEarnedPaise: 0,
    advanceForfeitedPaise: 0,
    depositForfeitedPaise: 0,
    totalPaise: 0,
    entries: rows.length,
    partial: hasMore,
  };
  for (const row of rows) {
    const amount = Number.isFinite(row.amountPaise) ? row.amountPaise : 0;
    // `kind` is typed as the known union, but a newer server may add kinds — compare as a string.
    const kind: string = row.kind;
    if (kind === 'ADVANCE_EARNED') summary.advanceEarnedPaise += amount;
    else if (kind === 'ADVANCE_FORFEITED') summary.advanceForfeitedPaise += amount;
    else if (kind === 'DEPOSIT_FORFEITED') summary.depositForfeitedPaise += amount;
    else continue;
    summary.totalPaise += amount;
  }
  return summary;
}

export function formatPaiseAsRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
