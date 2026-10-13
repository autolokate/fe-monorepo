import type { AuditAction } from '@autolokate/api-client';

import { AUDIT_LINK_PARAMS } from '@/app/routes/admin-paths';
import { AUDIT_ACTION_LABELS } from '@/platform/utils/audit-labels';

/** OpenAPI `GET /admin/v1/audit-events` `action` query enum. */
export const AUDIT_ACTION_OPTIONS: { value: AuditAction; label: string }[] = Object.entries(
  AUDIT_ACTION_LABELS,
).map(([value, label]) => ({ value, label }));

export const AUDIT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type AuditPageSize = (typeof AUDIT_PAGE_SIZE_OPTIONS)[number];

export type AuditExplorerFilters = {
  action: string;
  targetType: string;
  targetId: string;
  from: string;
  to: string;
  limit: AuditPageSize;
};

export const DEFAULT_AUDIT_EXPLORER_FILTERS: AuditExplorerFilters = {
  action: '',
  targetType: '',
  targetId: '',
  from: '',
  to: '',
  limit: 50,
};

export function resolveActionFilter(value: string): AuditAction | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const byValue = AUDIT_ACTION_OPTIONS.find((option) => option.value === trimmed);
  if (byValue) {
    return byValue.value;
  }
  const normalized = trimmed.toLowerCase();
  const byLabel = AUDIT_ACTION_OPTIONS.find((option) => option.label.toLowerCase() === normalized);
  return byLabel?.value;
}

export function toAuditQueryParams(filters: AuditExplorerFilters): {
  action?: AuditAction;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  limit: number;
} {
  const action = resolveActionFilter(filters.action);
  return {
    ...(action ? { action } : {}),
    ...(filters.targetType.trim() ? { targetType: filters.targetType.trim() } : {}),
    ...(filters.targetId.trim() ? { targetId: filters.targetId.trim() } : {}),
    ...(filters.from ? { from: new Date(filters.from).toISOString() } : {}),
    ...(filters.to ? { to: new Date(filters.to).toISOString() } : {}),
    limit: filters.limit,
  };
}

export function auditFiltersFromSearch(params: URLSearchParams): AuditExplorerFilters | null {
  const action = params.get(AUDIT_LINK_PARAMS.action) ?? '';
  const targetType = params.get(AUDIT_LINK_PARAMS.targetType) ?? '';
  const targetId = params.get(AUDIT_LINK_PARAMS.targetId) ?? '';
  if (!action && !targetType && !targetId) {
    return null;
  }
  return { ...DEFAULT_AUDIT_EXPLORER_FILTERS, action, targetType, targetId };
}

export function hasActiveAuditFilters(filters: AuditExplorerFilters): boolean {
  return Boolean(
    resolveActionFilter(filters.action) ||
    filters.action.trim() ||
    filters.targetType.trim() ||
    filters.targetId.trim() ||
    filters.from ||
    filters.to ||
    filters.limit !== DEFAULT_AUDIT_EXPLORER_FILTERS.limit,
  );
}
