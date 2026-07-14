import type { ClawbackResultDto, SettlementBatchResultDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useState } from 'react';

import { ClawbackResultPanel, CreateClawbackSheet } from '@/features/finance/CreateClawbackSheet';
import { useFinanceMutations } from '@/hooks/finance/useFinanceMutations';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';
import { useAdminAnyPermission, useAdminPermission } from '@/platform/rbac/useAdminPermission';

function SettlementResultPanel({ result }: { result: SettlementBatchResultDto }) {
  return (
    <AdminMutationResultPanel
      title="Settlement batch result"
      fields={[
        { label: 'Groups considered', value: result.groups.toLocaleString() },
        { label: 'Payouts created', value: result.payouts.toLocaleString() },
        { label: 'Skipped', value: result.skipped.toLocaleString() },
        { label: 'Errors', value: result.errors.toLocaleString() },
      ]}
    />
  );
}

export function FinanceOperationsPage() {
  const canAccess = useAdminAnyPermission(['clawbacks:write', 'settlements:write']);
  const canClawback = useAdminPermission('clawbacks:write');
  const canSettle = useAdminPermission('settlements:write');
  const { settlementMutation } = useFinanceMutations();

  const [clawbackOpen, setClawbackOpen] = useState(false);
  const [settlementConfirmOpen, setSettlementConfirmOpen] = useState(false);
  const [clawbackResult, setClawbackResult] = useState<ClawbackResultDto | null>(null);
  const [settlementResult, setSettlementResult] = useState<SettlementBatchResultDto | null>(null);

  if (!canAccess) {
    return (
      <AlErrorState
        title="Access denied"
        message="You do not have permission to run finance operations."
      />
    );
  }

  return (
    <AlStack gap="md">
      <AlPageHeader
        title="Finance Operations"
        description="Run clawbacks and settlement batches."
        actions={
          <>
            {canClawback ? (
              <AlPageHeaderAction
                label="Create clawback"
                onClick={() => {
                  setClawbackOpen(true);
                }}
              />
            ) : null}
            {canSettle ? (
              <AlPageHeaderAction
                label="Run settlement"
                variant="secondary"
                loading={settlementMutation.isPending}
                onClick={() => {
                  setSettlementConfirmOpen(true);
                }}
              />
            ) : null}
          </>
        }
      />

      <div className="admin-operations-results">
        {clawbackResult ? <ClawbackResultPanel result={clawbackResult} /> : null}
        {settlementResult ? <SettlementResultPanel result={settlementResult} /> : null}
      </div>

      {!clawbackResult && !settlementResult ? (
        <p className="admin-empty-note admin-operations-empty">
          Results from clawbacks and settlement batches appear here after you run an operation.
        </p>
      ) : null}

      <CreateClawbackSheet
        open={clawbackOpen}
        onOpenChange={setClawbackOpen}
        onCreated={setClawbackResult}
      />

      <AlConfirmationDialog
        open={settlementConfirmOpen}
        onOpenChange={setSettlementConfirmOpen}
        title="Run settlement batch"
        description="Group prior-month ACCRUED commissions into PENDING payouts. This operation is idempotent."
        confirmLabel="Run settlement"
        loading={settlementMutation.isPending}
        onConfirm={() => {
          void settlementMutation
            .mutateAsync(undefined)
            .then(setSettlementResult)
            .finally(() => {
              setSettlementConfirmOpen(false);
            });
        }}
      />
    </AlStack>
  );
}
