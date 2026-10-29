import { AlPageHeader, AlStack } from '@autolokate/ui';

import { AdminUnavailableState } from '@/platform/components/AdminUnavailableState';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/**
 * Support tickets are unavailable on Dev Admin today.
 * Fail closed in the UI — no filter chrome, no triage CTAs, no fabricated rows.
 */
export function SupportTicketsPage() {
  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        <AlPageHeader title="Tickets" description="Customer support tickets." />
        <AdminUnavailableState
          title="Support tickets unavailable"
          description="Support tickets are not available yet. Status changes are disabled."
        />
      </AlStack>
    </RequirePermission>
  );
}
