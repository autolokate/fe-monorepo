import type { BatchSummaryDto, ReplacedDto, RetiredDto } from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlInput,
  AlSheet,
  AlStack,
  AlStatusBadge,
  AlText,
} from '@autolokate/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  qrCodeActionSchema,
  type QrCodeActionFormValues,
} from '@/features/qr-batches/create-batch-schema.js';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations.js';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField.js';
import {
  canRunBatchLifecycleAction,
  describeBatchLifecycleStatus,
  getBatchLifecycleActions,
  type BatchLifecycleActionId,
} from '@/services/qr-batches/batch-lifecycle.js';
import { batchStatusTone } from '@/platform/utils/batch-status.js';

import './qr-batches.css';

export type BatchManagementDetailSheetProps = {
  batch: BatchSummaryDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  onBatchUpdated?: (batch: BatchSummaryDto) => void;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-detail-stat">
      <span className="admin-detail-stat__value">{value}</span>
      <span className="admin-detail-stat__label">{label}</span>
    </div>
  );
}

type PendingLifecycleAction = {
  actionId: BatchLifecycleActionId;
  label: string;
  description: string;
};

type PendingQrAction = 'replace' | 'retire';

export function BatchManagementDetailSheet({
  batch,
  open,
  onOpenChange,
  canWrite,
  onBatchUpdated,
}: BatchManagementDetailSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const [pendingLifecycle, setPendingLifecycle] = useState<PendingLifecycleAction | null>(null);
  const [pendingQrAction, setPendingQrAction] = useState<PendingQrAction | null>(null);
  const [replaceResult, setReplaceResult] = useState<ReplacedDto | null>(null);
  const [retireResult, setRetireResult] = useState<RetiredDto | null>(null);

  const { generateMutation, provisionMutation, replaceMutation, retireMutation, mapMutationError } =
    useQrBatchMutations();

  const qrForm = useForm<QrCodeActionFormValues>({
    resolver: zodResolver(qrCodeActionSchema),
    defaultValues: { code: '' },
  });

  const wasOpenRef = useRef(false);
  const generateMutationRef = useRef(generateMutation);
  const provisionMutationRef = useRef(provisionMutation);
  const replaceMutationRef = useRef(replaceMutation);
  const retireMutationRef = useRef(retireMutation);

  generateMutationRef.current = generateMutation;
  provisionMutationRef.current = provisionMutation;
  replaceMutationRef.current = replaceMutation;
  retireMutationRef.current = retireMutation;

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      abortRef.current?.abort();
      abortRef.current = null;
      setPendingLifecycle(null);
      setPendingQrAction(null);
      setReplaceResult(null);
      setRetireResult(null);
      qrForm.reset({ code: '' });
      generateMutationRef.current.reset();
      provisionMutationRef.current.reset();
      replaceMutationRef.current.reset();
      retireMutationRef.current.reset();
    }
    wasOpenRef.current = open;
  }, [open, qrForm]);

  const lifecycleActions = useMemo(
    () => (batch ? getBatchLifecycleActions(batch) : []),
    [batch],
  );

  if (!batch) {
    return null;
  }

  const lifecyclePending = generateMutation.isPending || provisionMutation.isPending;
  const lifecycleError = generateMutation.isError
    ? mapMutationError(generateMutation.error).userMessage
    : provisionMutation.isError
      ? mapMutationError(provisionMutation.error).userMessage
      : null;

  const qrPending = replaceMutation.isPending || retireMutation.isPending;
  const qrError = replaceMutation.isError
    ? mapMutationError(replaceMutation.error).userMessage
    : retireMutation.isError
      ? mapMutationError(retireMutation.error).userMessage
      : null;

  const runLifecycleAction = async (actionId: BatchLifecycleActionId) => {
    if (!canWrite || !canRunBatchLifecycleAction(batch, actionId)) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const updated =
        actionId === 'generate'
          ? await generateMutation.mutateAsync({ batchId: batch.id, signal: controller.signal })
          : await provisionMutation.mutateAsync({ batchId: batch.id, signal: controller.signal });
      onBatchUpdated?.(updated);
      setPendingLifecycle(null);
    } catch {
      setPendingLifecycle(null);
    }
  };

  const runQrAction = qrForm.handleSubmit(async (values) => {
    if (!canWrite || !pendingQrAction) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (pendingQrAction === 'replace') {
        const result = await replaceMutation.mutateAsync({
          code: values.code,
          signal: controller.signal,
        });
        setReplaceResult(result);
      } else {
        const result = await retireMutation.mutateAsync({
          code: values.code,
          signal: controller.signal,
        });
        setRetireResult(result);
      }
      setPendingQrAction(null);
      qrForm.reset({ code: '' });
    } catch {
      setPendingQrAction(null);
    }
  });

  return (
    <>
      <AlSheet
        open={open}
        onOpenChange={onOpenChange}
        title={batch.batchCode}
        description={`${batch.channel} · ${describeBatchLifecycleStatus(batch.status)}`}
      >
        <AlStack gap="md">
          <AdminDetailSection title="Overview">
            <AlStatusBadge label={batch.status} status={batchStatusTone(batch.status)} />
            <AdminDetailGrid>
              <AdminDetailField label="Channel" value={batch.channel} />
              <AdminDetailField label="SKU ID" value={batch.skuId} mono />
              <AdminDetailField label="Batch ID" value={batch.id} mono />
              <AdminDetailField label="Created" value={formatDateTime(batch.createdAt)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Code counts">
            <div className="admin-detail-stat-grid">
              <StatBlock label="Total" value={batch.totalCount.toLocaleString()} />
              <StatBlock label="Generated" value={batch.generatedCount.toLocaleString()} />
              <StatBlock label="Provisioned" value={batch.provisionedCount.toLocaleString()} />
            </div>
            {batch.provisionedAt ? (
              <AdminDetailField label="Provisioned at" value={formatDateTime(batch.provisionedAt)} />
            ) : null}
          </AdminDetailSection>

          <AdminDetailSection title="Batch lifecycle" description={describeBatchLifecycleStatus(batch.status)}>
            {canWrite ? (
              lifecycleActions.length > 0 ? (
                <div className="admin-sheet-actions">
                  {lifecycleActions.map((action) => (
                    <AlButton
                      key={action.id}
                      size="sm"
                      variant={action.id === 'provision' ? 'primary' : 'secondary'}
                      loading={lifecyclePending}
                      disabled={lifecyclePending}
                      onClick={() => {
                        setPendingLifecycle({
                          actionId: action.id,
                          label: action.label,
                          description: action.description,
                        });
                      }}
                    >
                      {action.label}
                    </AlButton>
                  ))}
                </div>
              ) : (
                <AlText tone="muted">No lifecycle actions available for this status.</AlText>
              )
            ) : (
              <AlText tone="muted">Write access required to run lifecycle actions.</AlText>
            )}
            {lifecycleError ? <AlText role="alert">{lifecycleError}</AlText> : null}
          </AdminDetailSection>

          <AdminDetailSection title="QR code actions" description="Replace or retire individual codes in this batch.">
            {canWrite ? (
              <>
                <AlInput
                  label="QR code"
                  mono
                  placeholder="Enter QR code"
                  autoComplete="off"
                  errorText={qrForm.formState.errors.code?.message}
                  {...qrForm.register('code')}
                />
                <div className="admin-sheet-actions">
                  <AlButton
                    size="sm"
                    variant="secondary"
                    loading={qrPending}
                    disabled={qrPending}
                    onClick={() => {
                      void qrForm.trigger('code').then((valid) => {
                        if (valid) {
                          setPendingQrAction('replace');
                        }
                      });
                    }}
                  >
                    Replace code
                  </AlButton>
                  <AlButton
                    size="sm"
                    variant="destructive"
                    loading={qrPending}
                    disabled={qrPending}
                    onClick={() => {
                      void qrForm.trigger('code').then((valid) => {
                        if (valid) {
                          setPendingQrAction('retire');
                        }
                      });
                    }}
                  >
                    Retire code
                  </AlButton>
                </div>
              </>
            ) : (
              <AlText tone="muted">Write access required for QR code actions.</AlText>
            )}
            {qrError ? <AlText role="alert">{qrError}</AlText> : null}
            {replaceResult ? (
              <div className="qr-batch-result-card">
                <AlText variant="label">Replacement issued</AlText>
                <AdminDetailGrid>
                  <AdminDetailField label="Old code" value={replaceResult.oldCode} mono />
                  <AdminDetailField label="New code" value={replaceResult.newCode} mono />
                  <AdminDetailField label="Vehicle ID" value={replaceResult.vehicleId} mono />
                  <AdminDetailField
                    label="Subscription ID"
                    value={replaceResult.subscriptionId ?? '—'}
                    mono
                  />
                </AdminDetailGrid>
              </div>
            ) : null}
            {retireResult ? (
              <div className="qr-batch-result-card">
                <AlText variant="label">Code retired</AlText>
                <AdminDetailGrid>
                  <AdminDetailField label="Code" value={retireResult.code} mono />
                  <AdminDetailField label="QR code ID" value={retireResult.qrCodeId} mono />
                </AdminDetailGrid>
              </div>
            ) : null}
          </AdminDetailSection>
        </AlStack>
      </AlSheet>

      <AlConfirmationDialog
        open={pendingLifecycle !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingLifecycle(null);
          }
        }}
        title={pendingLifecycle?.label ?? 'Confirm action'}
        description={pendingLifecycle?.description ?? ''}
        confirmLabel={pendingLifecycle?.label ?? 'Confirm'}
        loading={lifecyclePending}
        onConfirm={() => {
          if (pendingLifecycle) {
            void runLifecycleAction(pendingLifecycle.actionId);
          }
        }}
      />

      <AlConfirmationDialog
        open={pendingQrAction !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingQrAction(null);
          }
        }}
        title={pendingQrAction === 'retire' ? 'Retire QR code' : 'Replace QR code'}
        description={
          pendingQrAction === 'retire'
            ? `Permanently retire ${qrForm.getValues('code')}? This cannot be undone.`
            : `Issue a replacement for code ${qrForm.getValues('code')}?`
        }
        confirmLabel={pendingQrAction === 'retire' ? 'Retire code' : 'Replace code'}
        destructive={pendingQrAction === 'retire'}
        loading={qrPending}
        onConfirm={() => {
          void runQrAction();
        }}
      />
    </>
  );
}
