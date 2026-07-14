import type { BatchSummaryDto, ReplacedDto, RetiredDto } from '@autolokate/api-client';
import {
  AlBreadcrumb,
  AlButton,
  AlConfirmationDialog,
  AlErrorState,
  AlInput,
  AlPageHeader,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { BatchCodesSection } from '@/features/qr-batches/BatchCodesSection';
import {
  qrCodeActionSchema,
  type QrCodeActionFormValues,
} from '@/features/qr-batches/create-batch-schema';
import { useQrBatchById } from '@/hooks/qr-batches/useQrBatchById';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import {
  AdminDetailField,
  AdminDetailGrid,
} from '@/platform/components/AdminDetailField';
import {
  useCanRunQrLifecycleMutations,
} from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import {
  canRunBatchLifecycleAction,
  describeBatchLifecycleStatus,
  getBatchLifecycleActions,
  type BatchLifecycleActionId,
} from '@/services/qr-batches/batch-lifecycle';
import { BatchStatusBadge } from '@/platform/components/EntityStatusBadge';
import { adminPaths } from '@/app/routes/admin-paths';

import './qr-batches.css';

type BatchDetailLocationState = {
  batch?: BatchSummaryDto;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="qr-batch-stat-inline">
      <span className="qr-batch-stat-inline__value">{value}</span>
      <span className="qr-batch-stat-inline__label">{label}</span>
    </div>
  );
}

type PendingLifecycleAction = {
  actionId: BatchLifecycleActionId;
  label: string;
  description: string;
};

type PendingQrAction = 'replace' | 'retire';

function resolveListContext(pathname: string): { listPath: string; listLabel: string } {
  if (pathname.startsWith(adminPaths.inventory)) {
    return { listPath: adminPaths.inventory, listLabel: 'QR Inventory' };
  }
  return { listPath: adminPaths.qrBatches, listLabel: 'QR Batch Management' };
}

export function BatchManagementDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as BatchDetailLocationState | null;
  const { listPath, listLabel } = resolveListContext(location.pathname);

  const canWrite = useCanRunQrLifecycleMutations();
  const abortRef = useRef<AbortController | null>(null);
  const [batchOverride, setBatchOverride] = useState<BatchSummaryDto | null>(null);
  const [pendingLifecycle, setPendingLifecycle] = useState<PendingLifecycleAction | null>(null);
  const [pendingQrAction, setPendingQrAction] = useState<PendingQrAction | null>(null);
  const [replaceResult, setReplaceResult] = useState<ReplacedDto | null>(null);
  const [retireResult, setRetireResult] = useState<RetiredDto | null>(null);

  const { batch: fetchedBatch, isLoading, userErrorMessage, refresh } = useQrBatchById(
    batchId,
    locationState?.batch ?? null,
  );
  const batch = batchOverride ?? fetchedBatch;

  const {
    generateMutation,
    provisionMutation,
    distributeMutation,
    replaceMutation,
    retireMutation,
    mapMutationError,
  } = useQrBatchMutations();

  const qrForm = useForm<QrCodeActionFormValues>({
    resolver: zodResolver(qrCodeActionSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generateMutationRef = useRef(generateMutation);
  const provisionMutationRef = useRef(provisionMutation);
  const distributeMutationRef = useRef(distributeMutation);
  const replaceMutationRef = useRef(replaceMutation);
  const retireMutationRef = useRef(retireMutation);

  generateMutationRef.current = generateMutation;
  provisionMutationRef.current = provisionMutation;
  distributeMutationRef.current = distributeMutation;
  replaceMutationRef.current = replaceMutation;
  retireMutationRef.current = retireMutation;

  useEffect(() => {
    setBatchOverride(null);
    setPendingLifecycle(null);
    setPendingQrAction(null);
    setReplaceResult(null);
    setRetireResult(null);
    qrForm.reset({ code: '' });
    generateMutationRef.current.reset();
    provisionMutationRef.current.reset();
    distributeMutationRef.current.reset();
    replaceMutationRef.current.reset();
    retireMutationRef.current.reset();
  }, [batchId, qrForm]);

  useEffect(() => {
    // Drop the local override only once the fetched cache/network batch is at
    // least as fresh as the mutation response (same lifecycle status + counts).
    if (
      fetchedBatch &&
      batchOverride &&
      batchOverride.id === fetchedBatch.id &&
      batchOverride.status === fetchedBatch.status &&
      batchOverride.generatedCount === fetchedBatch.generatedCount &&
      batchOverride.provisionedCount === fetchedBatch.provisionedCount
    ) {
      setBatchOverride(null);
    }
  }, [batchOverride, fetchedBatch]);

  const lifecycleActions = useMemo(
    () => (batch ? getBatchLifecycleActions(batch) : []),
    [batch],
  );

  if (isLoading && !batch) {
    return (
      <RequirePermission permission="inventory:view">
        <AdminPageLoader label="Loading batch…" />
      </RequirePermission>
    );
  }

  if (!batch) {
    return (
      <RequirePermission permission="inventory:view">
        <AlErrorState
          title={userErrorMessage ? 'Something went wrong' : 'Batch not found'}
          message={userErrorMessage ?? 'This batch may have been removed or the link is invalid.'}
          onRetry={
            userErrorMessage
              ? refresh
              : () => {
                  void navigate(listPath);
                }
          }
          retryLabel={userErrorMessage ? 'Try again' : 'Back to list'}
        />
      </RequirePermission>
    );
  }

  const lifecyclePending =
    generateMutation.isPending || provisionMutation.isPending || distributeMutation.isPending;
  const lifecycleError = generateMutation.isError
    ? mapMutationError(generateMutation.error).userMessage
    : provisionMutation.isError
      ? mapMutationError(provisionMutation.error).userMessage
      : distributeMutation.isError
        ? mapMutationError(distributeMutation.error).userMessage
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
          : actionId === 'provision'
            ? await provisionMutation.mutateAsync({ batchId: batch.id, signal: controller.signal })
            : await distributeMutation.mutateAsync({ batchId: batch.id, signal: controller.signal });
      setBatchOverride(updated);
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
    <RequirePermission permission="inventory:view">
      <AlStack gap="md">
        <AlPageHeader
          title={batch.batchCode}
          description={`${batch.channel} · ${describeBatchLifecycleStatus(batch.status)}`}
          breadcrumbs={
            <AlBreadcrumb
              items={[
                {
                  label: listLabel,
                  onClick: () => {
                    void navigate(listPath);
                  },
                },
                { label: batch.batchCode, current: true },
              ]}
            />
          }
        />

        <section className="qr-batch-detail-hero" aria-label="Batch summary">
          <div className="qr-batch-detail-hero__top">
            <div className="qr-batch-detail-hero__status">
              <BatchStatusBadge status={batch.status} />
              <span className="qr-batch-detail-hero__channel">{batch.channel}</span>
            </div>
            <span className="qr-batch-detail-hero__created">{formatDateTime(batch.createdAt)}</span>
          </div>

          <div className="qr-batch-detail-hero__stats">
            <StatInline label="Total" value={batch.totalCount.toLocaleString()} />
            <StatInline label="Generated" value={batch.generatedCount.toLocaleString()} />
            <StatInline label="Provisioned" value={batch.provisionedCount.toLocaleString()} />
            {batch.provisionedAt ? (
              <StatInline label="Provisioned at" value={formatDateTime(batch.provisionedAt)} />
            ) : null}
          </div>
        </section>

        <section className="qr-batch-detail-toolbar" aria-label="Batch actions">
          <div className="qr-batch-detail-toolbar__row">
            <div className="qr-batch-detail-toolbar__copy">
              <h3 className="qr-batch-detail-toolbar__title">Batch lifecycle</h3>
              <p className="qr-batch-detail-toolbar__hint">{describeBatchLifecycleStatus(batch.status)}</p>
            </div>
            <div className="qr-batch-detail-toolbar__controls">
              {canWrite ? (
                lifecycleActions.length > 0 ? (
                  <div className="admin-page-actions">
                    {lifecycleActions.map((action) => (
                      <AlButton
                        key={action.id}
                        size="sm"
                        variant={action.id === 'generate' ? 'secondary' : 'primary'}
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
                  <span className="qr-batch-detail-toolbar__empty">No actions for this status</span>
                )
              ) : (
                <span className="qr-batch-detail-toolbar__empty">Write access required</span>
              )}
            </div>
          </div>
          {lifecycleError ? <p className="admin-inline-alert">{lifecycleError}</p> : null}

          <div className="qr-batch-detail-toolbar__divider" role="presentation" />

          <div className="qr-batch-detail-toolbar__row qr-batch-detail-toolbar__row--qr">
            <div className="qr-batch-detail-toolbar__copy">
              <h3 className="qr-batch-detail-toolbar__title">QR code actions</h3>
              <p className="qr-batch-detail-toolbar__hint">Replace or retire a code in this batch</p>
            </div>
            {canWrite ? (
              <div className="qr-batch-detail-toolbar__qr-form">
                <AlInput
                  label="QR code"
                  mono
                  placeholder="Enter QR code"
                  autoComplete="off"
                  errorText={qrForm.formState.errors.code?.message}
                  {...qrForm.register('code')}
                />
                <div className="admin-page-actions">
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
                    Replace
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
                    Retire
                  </AlButton>
                </div>
              </div>
            ) : (
              <span className="qr-batch-detail-toolbar__empty">Write access required</span>
            )}
          </div>
          {qrError ? <p className="admin-inline-alert">{qrError}</p> : null}
          {replaceResult ? (
            <div className="admin-result-panel admin-result-panel--compact">
              <AlText variant="label">Replacement issued</AlText>
              <AdminDetailGrid>
                <AdminDetailField label="Old code" value={replaceResult.oldCode} mono />
                <AdminDetailField label="New code" value={replaceResult.newCode} mono />
              </AdminDetailGrid>
            </div>
          ) : null}
          {retireResult ? (
            <div className="admin-result-panel admin-result-panel--compact">
              <AlText variant="label">Code retired</AlText>
              <AdminDetailGrid>
                <AdminDetailField label="Code" value={retireResult.code} mono />
              </AdminDetailGrid>
            </div>
          ) : null}
        </section>

        <BatchCodesSection
          batchId={batch.id}
          enabled={batch.generatedCount > 0 || batch.status !== 'DRAFT'}
          layout="page"
        />
      </AlStack>

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
    </RequirePermission>
  );
}
