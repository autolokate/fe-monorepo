import type { BatchSummaryDto, QrBatchStatus } from '@autolokate/api-client';

import { computeInventoryMetrics, type InventoryMetrics } from '@/services/inventory/inventory-metrics';

export type BatchLifecycleActionId = 'generate' | 'provision';

export type BatchLifecycleAction = {
  id: BatchLifecycleActionId;
  label: string;
  description: string;
};

/** Pre-provision pipeline states from OpenAPI `BatchSummaryDto.status`. */
const PROVISION_ELIGIBLE_STATUSES: readonly QrBatchStatus[] = [
  'CODES_GENERATED',
  'PRINTING',
  'QA',
  'REPRINT',
];

const BATCH_LIFECYCLE_ACTIONS: Record<BatchLifecycleActionId, Omit<BatchLifecycleAction, 'id'>> = {
  generate: {
    label: 'Generate codes',
    description: 'Issue and freeze batch codes (DRAFT → CODES_GENERATED).',
  },
  provision: {
    label: 'Provision batch',
    description: 'Provision batch codes for distribution.',
  },
};

/** OpenAPI-supported batch lifecycle transitions only. */
export function getBatchLifecycleActions(batch: BatchSummaryDto): BatchLifecycleAction[] {
  const actions: BatchLifecycleAction[] = [];

  if (batch.status === 'DRAFT') {
    actions.push({ id: 'generate', ...BATCH_LIFECYCLE_ACTIONS.generate });
  }

  if (PROVISION_ELIGIBLE_STATUSES.includes(batch.status)) {
    actions.push({ id: 'provision', ...BATCH_LIFECYCLE_ACTIONS.provision });
  }

  return actions;
}

export function canRunBatchLifecycleAction(
  batch: BatchSummaryDto,
  actionId: BatchLifecycleActionId,
): boolean {
  return getBatchLifecycleActions(batch).some((action) => action.id === actionId);
}

export type BatchManagementMetrics = InventoryMetrics & {
  draftBatches: number;
  pipelineBatches: number;
};

export function computeBatchManagementMetrics(batches: BatchSummaryDto[]): BatchManagementMetrics {
  const base = computeInventoryMetrics(batches);
  return {
    ...base,
    draftBatches: batches.filter((batch) => batch.status === 'DRAFT').length,
    pipelineBatches: batches.filter((batch) => PROVISION_ELIGIBLE_STATUSES.includes(batch.status))
      .length,
  };
}

/** Human-readable lifecycle progression for the detail sheet. */
export function describeBatchLifecycleStatus(status: QrBatchStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Batch created. Generate codes to freeze the batch.';
    case 'CODES_GENERATED':
      return 'Codes issued. Continue through printing/QA, then provision.';
    case 'PRINTING':
      return 'Batch is in printing.';
    case 'QA':
      return 'Batch is in quality assurance.';
    case 'REPRINT':
      return 'Batch requires reprint before provisioning.';
    case 'PROVISIONED':
      return 'Batch provisioned and ready for allocation.';
    case 'ALLOCATED':
      return 'Batch allocated to partners or channels.';
    case 'IN_DISTRIBUTION':
      return 'Batch codes are in distribution.';
    case 'DEPLETED':
      return 'Batch depleted — no remaining usable codes.';
    case 'SCRAPPED':
      return 'Batch scrapped and no longer active.';
    default:
      return status;
  }
}
