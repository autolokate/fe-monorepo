import type { AuditAction, AuditEventDto } from '@autolokate/api-client';
import { AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';

import { AdminPanel, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { formatAuditField } from '@/platform/utils/audit-field';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';
import { fetchAuditEventsPage } from '@/services/audit/audit-events-service';

const FINANCE_ACTIONS: AuditAction[] = ['REFUND_OR_CLAWBACK', 'PAYOUT_ISSUED'];

/**
 * ADM-12 — the server has no clawback/settlement list endpoints, so history comes from the audit
 * trail (each clawback and payout writes an audit event). Read-only; newest first.
 */
export function FinanceHistoryPanel() {
  const query = useQuery({
    queryKey: ['admin', 'finance', 'history'],
    queryFn: async ({ signal }) => {
      const pages = await Promise.all(
        FINANCE_ACTIONS.map((action) => fetchAuditEventsPage({ action, limit: 20 }, signal)),
      );
      return pages
        .flatMap((page) => page.events)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 30);
    },
    retry: false,
  });

  return (
    <AdminPanel
      title="Recent finance activity"
      subtitle="Clawbacks and payouts from the audit log (latest 30). Full detail lives in the Activity log."
    >
      {query.isLoading ? (
        <AlText tone="muted">Loading finance history…</AlText>
      ) : query.isError ? (
        <AlText tone="muted" role="alert">
          Finance history unavailable: {mapAdminApiError(query.error).userMessage}
        </AlText>
      ) : (query.data ?? []).length === 0 ? (
        <AlText tone="muted" data-testid="finance-history-empty">
          No clawbacks or payouts recorded yet.
        </AlText>
      ) : (
        <div className="taxi-ops__table-wrap">
          <table className="admin-simple-table" data-testid="finance-history">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Action</th>
                <th scope="col">Target</th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((event: AuditEventDto) => (
                <tr key={event.id}>
                  <td>{formatAdminDateTime(event.at)}</td>
                  <td>{humanizeAdminLabel(event.action)}</td>
                  <td>
                    {formatAuditField(event.targetType)} {formatAuditField(event.targetId)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
