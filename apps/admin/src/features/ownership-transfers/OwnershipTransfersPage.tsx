import type { TransferCompletedDto, TransferInitiatedDto } from '@autolokate/api-client';
import { AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useState } from 'react';

import {
  ApproveTransferSheet,
  InitiateTransferSheet,
  TransferCompletedPanel,
  TransferInitiatedPanel,
} from '@/features/ownership-transfers/OwnershipTransferSheets';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

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
          description="Initiate and approve vehicle ownership transfers."
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

        {!initiatedResult && !approvedResult ? (
          <p className="admin-empty-note admin-operations-empty">
            Transfer status appears here after you initiate or approve a transfer.
          </p>
        ) : null}

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
