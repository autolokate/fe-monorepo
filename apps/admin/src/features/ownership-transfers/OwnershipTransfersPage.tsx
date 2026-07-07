import type { TransferCompletedDto, TransferInitiatedDto } from '@autolokate/api-client';
import { AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useState } from 'react';

import {
  ApproveTransferSheet,
  InitiateTransferSheet,
  TransferCompletedPanel,
  TransferInitiatedPanel,
} from '@/features/ownership-transfers/OwnershipTransferSheets.js';
import { RequirePermission } from '@/platform/rbac/RequirePermission.js';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission.js';

export function OwnershipTransfersPage() {
  const canWrite = useAdminPermission('qr-lifecycle:write');
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [initiatedResult, setInitiatedResult] = useState<TransferInitiatedDto | null>(null);
  const [approvedResult, setApprovedResult] = useState<TransferCompletedDto | null>(null);
  const [approveTransferId, setApproveTransferId] = useState('');

  return (
    <RequirePermission permission="inventory:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Ownership Transfers"
          description="Initiate and approve vehicle ownership transfers. Open a transfer from your workflow using the IDs returned below."
          actions={
            canWrite ? (
              <>
                <AlPageHeaderAction
                  label="Initiate transfer"
                  onClick={() => {
                    setInitiateOpen(true);
                  }}
                />
                <AlPageHeaderAction
                  label="Approve transfer"
                  variant="secondary"
                  onClick={() => {
                    setApproveTransferId(initiatedResult?.transferId ?? '');
                    setApproveOpen(true);
                  }}
                />
              </>
            ) : undefined
          }
        />

        <div className="admin-operations-results">
          {initiatedResult ? <TransferInitiatedPanel result={initiatedResult} /> : null}
          {approvedResult ? <TransferCompletedPanel result={approvedResult} /> : null}
        </div>

        <InitiateTransferSheet
          open={initiateOpen}
          onOpenChange={setInitiateOpen}
          onInitiated={(result) => {
            setInitiatedResult(result);
            setApproveTransferId(result.transferId);
          }}
        />

        <ApproveTransferSheet
          open={approveOpen}
          onOpenChange={setApproveOpen}
          defaultTransferId={approveTransferId}
          onApproved={setApprovedResult}
        />
      </AlStack>
    </RequirePermission>
  );
}
