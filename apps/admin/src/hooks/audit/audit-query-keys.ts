import type { QueryAuditEventsParams } from '@autolokate/api-client';

export const auditQueryKeys = {
  all: ['admin', 'audit-events'] as const,
  list: (params: QueryAuditEventsParams) => [...auditQueryKeys.all, params] as const,
  explorer: (params: QueryAuditEventsParams) =>
    [...auditQueryKeys.all, 'explorer', params] as const,
};

export const RECENT_AUDIT_LIMIT = 10;

export const RECENT_AUDIT_PARAMS = { limit: RECENT_AUDIT_LIMIT } as const;
