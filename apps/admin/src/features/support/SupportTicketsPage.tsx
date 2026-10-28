import { AlPageHeader, AlStack } from '@autolokate/ui';

import { AdminUnavailableState } from '@/platform/components/AdminUnavailableState';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/**
 * Nest Dev OA has no `/admin/v1/support/tickets*` (G0-4 Absent).
 * Fail closed in the UI — no filter chrome, no triage CTAs, no fabricated rows.
 */
export function SupportTicketsPage() {
  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Tickets"
          description="Support triage is not available on Live Dev Nest yet."
        />
        <AdminUnavailableState
          title="Tickets API not on Nest Dev"
          operation="GET /admin/v1/support/tickets"
          description="This console stays empty until Nest ships support tickets. Status changes are disabled."
        />
      </AlStack>
    </RequirePermission>
  );
}
