import type { BreakGlassApprovalDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import {
  approveBreakGlass,
  denyBreakGlass,
  fetchBreakGlassApproval,
  requestBreakGlass,
} from '@/services/incidents/break-glass-service';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';

export type BreakGlassDualControlPanelProps = {
  approval: BreakGlassApprovalDto | null;
  onApprovalChange: (approval: BreakGlassApprovalDto | null) => void;
  /**
   * Requester-only: pass an APPROVED grant id so the incident list can consume it.
   * Approver must not call this — Nest requires executor === requester.
   */
  onUseListApproval: (approvalId: string) => void;
  /** Requester-only: consume an APPROVED INCIDENT_DETAIL grant for one incident. */
  onUseDetailApproval: (approvalId: string, incidentId: string) => void;
  /** Optional prefill when operator picks a row from the list. */
  preferredDetailIncidentId?: string | null;
};

/**
 * Dual-control request → second-admin approve/deny before any incident PII fetch.
 * Supports INCIDENT_LIST and INCIDENT_DETAIL scopes. Self-approval is forbidden.
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
    <AlStack gap="sm" data-testid="break-glass-dual-control">
      <AlText variant="subtitle">Dual-control break-glass</AlText>
      <AlText variant="caption" tone="muted">
        List: request INCIDENT_LIST → peer approves → requester loads list (single-use). Detail:
        request INCIDENT_DETAIL with incident id → peer approves → requester loads that incident
        only. Ops must set BREAK_GLASS_APPROVAL_TTL_SECONDS or requests fail closed.
      </AlText>

      <AlStack direction="row" gap="sm" align="start">
        <AlInput
          label="Justification (min 8 chars)"
          value={justification}
          onChange={(e) => {
            setJustification(e.target.value);
          }}
          disabled={busy}
          data-testid="break-glass-justification"
          style={{ minWidth: 280, flex: 1 }}
        />
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

      <AlStack direction="row" gap="sm" align="start">
        <AlInput
          label="Incident ID (for detail grant)"
          value={detailIncidentId}
          onChange={(e) => {
            setDetailIncidentId(e.target.value);
          }}
          disabled={busy}
          data-testid="break-glass-detail-incident-id"
          style={{ minWidth: 280, flex: 1 }}
        />
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

      <AlStack direction="row" gap="sm" align="start">
        <AlInput
          label="Approval ID (second admin)"
          value={peerApprovalId}
          onChange={(e) => {
            setPeerApprovalId(e.target.value);
          }}
          disabled={busy}
          data-testid="break-glass-peer-id"
          style={{ minWidth: 280, flex: 1 }}
        />
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

      <AlStack direction="row" gap="sm" align="start">
        <AlInput
          label="Approved grant ID (requester)"
          value={consumeId || approval?.id || ''}
          onChange={(e) => {
            setConsumeId(e.target.value);
          }}
          disabled={busy}
          data-testid="break-glass-consume-id"
          style={{ minWidth: 280, flex: 1 }}
        />
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
        <AlText variant="caption" data-testid="break-glass-latest">
          Latest: {approval.id} · {approval.status} · scope {approval.scopeKey} · expires{' '}
          {approval.expiresAt}
        </AlText>
      ) : null}
      {localError ? (
        <p className="admin-form-error" data-testid="break-glass-error" role="alert">
          {localError}
        </p>
      ) : null}
    </AlStack>
  );
}
