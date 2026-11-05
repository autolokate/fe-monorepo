import { AlPageHeader, AlStack, AlText } from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { AdminPanel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/**
 * The lost-QR ownership transfer is retired (D-8 / BE-OWN-06): it moved ownership and the previous
 * owner's plan without an RC review. Every write on `/admin/v1/ownership-transfers*` now answers 410
 * `feature_retired`, so this page offers no initiate / approve action. The route stays so old links
 * land on an explanation; past transfers remain in the Activity Log (`TRANSFER_APPROVED`) and in
 * each vehicle's ownership history on the claim review.
 */
export function OwnershipTransfersPage() {
  return (
    <RequirePermission permission="inventory:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Ownership transfers"
          description="Retired. Vehicle ownership now moves only through an approved ownership claim."
        />
        <AdminPanel
          title="This tool is retired"
          subtitle="Lost-QR transfers moved ownership without an RC review."
        >
          <AlStack gap="sm" data-testid="ownership-transfers-retired">
            <AlText>
              To give a vehicle to its real owner, the owner buys a plan and submits an ownership
              claim with the RC from the app. An authorized reviewer then approves it from{' '}
              <Link to={adminPaths.ownershipClaims}>Ownership claims</Link>.
            </AlText>
            <AlText variant="caption" tone="muted">
              Past transfers stay visible: filter the{' '}
              <Link to={adminPaths.auditEvents}>Activity Log</Link> by “Transfer approved” or
              “Vehicle ownership transferred”, or open a claim to see the vehicle’s ownership
              history.
            </AlText>
          </AlStack>
        </AdminPanel>
      </AlStack>
    </RequirePermission>
  );
}
