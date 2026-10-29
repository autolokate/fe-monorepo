import type { BreakGlassApprovalDto } from '@autolokate/api-client';
import { AlButton, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import {
  approveBreakGlass,
  denyBreakGlass,
  fetchBreakGlassApproval,
  requestBreakGlass,
} from '@/services/incidents/break-glass-service';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

export type BreakGlassDualControlPanelProps = {
  approval: BreakGlassApprovalDto | null;
  onApprovalChange: (approval: BreakGlassApprovalDto | null) => void;
  /**
   * Requester-only: pass an approved grant id so the incident list can consume it.
   * Approver must not call this — executor must be the requester.
   */
  onUseListApproval: (approvalId: string) => void;
  /** Requester-only: consume an approved detail grant for one incident. */
  onUseDetailApproval: (approvalId: string, incidentId: string) => void;
  /** Optional prefill when operator picks a row from the list. */
  preferredDetailIncidentId?: string | null;
};

function formatScopeLabel(scopeKey: string): string {
  const key = scopeKey.toUpperCase();
  if (key.startsWith('INCIDENT_DETAIL')) return 'Incident detail';
  if (key.startsWith('INCIDENT_LIST')) return 'Incident list';
  return humanizeAdminLabel(scopeKey);
}

function approvalTone(status: BreakGlassApprovalDto['status']): AdminStatusChipTone {
  if (status === 'APPROVED') return 'active';
  if (status === 'PENDING') return 'draft';
  return 'none';
}

/**
 * Dual-control request → second-admin approve/deny before any incident PII fetch.
 * Supports list and single-incident scopes. Self-approval is forbidden.
 */
export function BreakGlassDualControlPanel({
  approval,
  onApprovalChange,
  onUseListApproval,
  onUseDetailApproval,
  preferredDetailIncidentId = null,
}: BreakGlassDualControlPanelProps) {
  const [justification, setJustification] = useState('');
  const [peerApprovalId, setPeerApprovalId] = useState('');
  const [consumeId, setConsumeId] = useState('');
  const [detailIncidentId, setDetailIncidentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Row "Prefill detail grant" must override any prior typed id.
  useEffect(() => {
    const next = preferredDetailIncidentId?.trim();
    if (next) {
      setDetailIncidentId(next);
    }
  }, [preferredDetailIncidentId]);

  const effectiveDetailIncidentId = detailIncidentId.trim();

  const run = async (fn: () => Promise<BreakGlassApprovalDto>) => {
    setBusy(true);
    setLocalError(null);
    try {
      const result = await fn();
      onApprovalChange(result);
      return result;
    } catch (error) {
      const mapped = mapAdminApiError(error);
      setLocalError(mapped.userMessage);
      reportAdminApiError(error, { context: 'break-glass', toast: true });
      return null;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="break-glass-dual-control">
      <AdminPanel
        title="Dual-control access"
        subtitle="A second admin must approve before emergency incident details can be viewed. Each approval is single-use and expires if unused."
      >
        <AlStack gap="sm">
          <div className="admin-form-grid">
            <label className="admin-field admin-form-span">
              Justification (min 8 characters)
              <input
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                }}
                disabled={busy}
                data-testid="break-glass-justification"
                autoComplete="off"
              />
            </label>
          </div>

          <AlStack direction="row" gap="sm" align="start">
            <AlButton
              size="sm"
              loading={busy}
              disabled={busy || justification.trim().length < 8}
              data-testid="break-glass-request"
              onClick={() =>
                void run(() =>
                  requestBreakGlass({
                    scopeKind: 'INCIDENT_LIST',
                    justification: justification.trim(),
                  }),
                )
              }
            >
              Request list access
            </AlButton>
          </AlStack>

          <div className="admin-form-grid">
            <label className="admin-field admin-form-span">
              Incident (for detail access)
              <input
                value={detailIncidentId}
                onChange={(e) => {
                  setDetailIncidentId(e.target.value);
                }}
                disabled={busy}
                data-testid="break-glass-detail-incident-id"
                autoComplete="off"
                placeholder="Incident reference"
              />
              <span className="admin-field__hint">
                Prefill from a list row, or paste the incident reference.
              </span>
            </label>
          </div>

          <AlStack direction="row" gap="sm" align="start">
            <AlButton
              size="sm"
              variant="secondary"
              loading={busy}
              disabled={busy || justification.trim().length < 8 || !effectiveDetailIncidentId}
              data-testid="break-glass-request-detail"
              onClick={() =>
                void run(() =>
                  requestBreakGlass({
                    scopeKind: 'INCIDENT_DETAIL',
                    incidentId: effectiveDetailIncidentId,
                    justification: justification.trim(),
                  }),
                )
              }
            >
              Request detail access
            </AlButton>
          </AlStack>

          <div className="admin-form-grid">
            <label className="admin-field admin-form-span">
              Approval (second admin)
              <input
                value={peerApprovalId}
                onChange={(e) => {
                  setPeerApprovalId(e.target.value);
                }}
                disabled={busy}
                data-testid="break-glass-peer-id"
                autoComplete="off"
              />
            </label>
          </div>

          <AlStack direction="row" gap="sm" align="start">
            <AlButton
              size="sm"
              variant="secondary"
              loading={busy}
              disabled={busy || !peerApprovalId.trim()}
              data-testid="break-glass-approve"
              onClick={() =>
                void run(async () => {
                  const id = peerApprovalId.trim();
                  await fetchBreakGlassApproval(id);
                  return approveBreakGlass(id);
                })
              }
            >
              Approve
            </AlButton>
            <AlButton
              size="sm"
              variant="secondary"
              loading={busy}
              disabled={busy || !peerApprovalId.trim()}
              data-testid="break-glass-deny"
              onClick={() => void run(() => denyBreakGlass(peerApprovalId.trim()))}
            >
              Deny
            </AlButton>
          </AlStack>

          <div className="admin-form-grid">
            <label className="admin-field admin-form-span">
              Approved grant (requester)
              <input
                value={consumeId || approval?.id || ''}
                onChange={(e) => {
                  setConsumeId(e.target.value);
                }}
                disabled={busy}
                data-testid="break-glass-consume-id"
                autoComplete="off"
              />
            </label>
          </div>

          <AlStack direction="row" gap="sm" align="start">
            <AlButton
              size="sm"
              loading={busy}
              disabled={busy || !(consumeId.trim() || approval?.id)}
              data-testid="break-glass-load-incidents"
              onClick={() => {
                const id = (consumeId.trim() || approval?.id || '').trim();
                if (!id) return;
                onUseListApproval(id);
              }}
            >
              Load incidents
            </AlButton>
            <AlButton
              size="sm"
              variant="secondary"
              loading={busy}
              disabled={busy || !(consumeId.trim() || approval?.id) || !effectiveDetailIncidentId}
              data-testid="break-glass-load-detail"
              onClick={() => {
                const id = (consumeId.trim() || approval?.id || '').trim();
                if (!id || !effectiveDetailIncidentId) return;
                onUseDetailApproval(id, effectiveDetailIncidentId);
              }}
            >
              Load detail
            </AlButton>
          </AlStack>

          {approval ? (
            <div className="admin-status-row" data-testid="break-glass-latest">
              <AdminStatusChip
                label={humanizeAdminLabel(approval.status)}
                tone={approvalTone(approval.status)}
              />
              <AlText variant="caption" tone="muted" title={approval.id}>
                {shortAdminId(approval.id)} · {formatScopeLabel(approval.scopeKey)} · expires{' '}
                {new Date(approval.expiresAt).toLocaleString()}
              </AlText>
            </div>
          ) : null}
          {localError ? (
            <p className="admin-form-error" data-testid="break-glass-error" role="alert">
              {localError}
            </p>
          ) : null}
        </AlStack>
      </AdminPanel>
    </div>
  );
}
