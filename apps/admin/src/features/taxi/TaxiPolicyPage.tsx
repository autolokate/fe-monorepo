import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useMemo, useState } from 'react';

import { useTaxiPolicy } from '@/hooks/taxi/useTaxiPolicy';
import { AdminDataBlock } from '@/platform/components/AdminDataBlock';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './taxi-policy.css';

type FormState = {
  customerAdvanceBps: number;
  partnerDepositBps: number;
};

function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}% (${String(bps)} bps)`;
}

export function TaxiPolicyPage() {
  const canWrite = useAdminPermission('settings:write');
  const {
    policy,
    history,
    isLoading,
    isFetching,
    isUnavailable,
    userErrorMessage,
    saveErrorMessage,
    publishErrorMessage,
    isSaving,
    isPublishing,
    save,
    publish,
    refresh,
  } = useTaxiPolicy();

  const [form, setForm] = useState<FormState | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [publishedNote, setPublishedNote] = useState<string | null>(null);

  useEffect(() => {
    if (!policy) {
      if (isUnavailable) {
        setForm({ customerAdvanceBps: 0, partnerDepositBps: 0 });
      }
      return;
    }
    setForm({
      customerAdvanceBps:
        typeof policy.customerAdvanceBps === 'number' ? policy.customerAdvanceBps : 0,
      partnerDepositBps:
        typeof policy.partnerDepositBps === 'number' ? policy.partnerDepositBps : 0,
    });
  }, [isUnavailable, policy]);

  const pageDescription = useMemo(() => {
    if (isLoading && !policy && !isUnavailable) {
      return 'Taxi advance / deposit policy (bps). Live Nest /admin/v1/taxi/policy*.';
    }
    if (isUnavailable && !policy) {
      return 'No Taxi policy on the API yet — save a DRAFT (requires Taxi migrate on target).';
    }
    if (!policy) {
      return 'Taxi advance / deposit policy (bps).';
    }
    return buildPageSummary([
      policy.status ?? 'UNKNOWN',
      `advance ${formatBps(policy.customerAdvanceBps ?? 0)}`,
      `deposit ${formatBps(policy.partnerDepositBps ?? 0)}`,
    ]);
  }, [isLoading, isUnavailable, policy]);

  const onSave = async () => {
    if (!form || !canWrite) return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await save({
        customerAdvanceBps: form.customerAdvanceBps,
        partnerDepositBps: form.partnerDepositBps,
      });
      setSavedNote('Taxi policy draft saved.');
    } catch {
      // Error surfaced via saveErrorMessage + toast.
    }
  };

  const onPublish = async () => {
    if (!canWrite || !policy || policy.status !== 'DRAFT') return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await publish();
      setPublishedNote('Taxi policy published.');
    } catch {
      // Error surfaced via publishErrorMessage + toast.
    }
  };

  if (userErrorMessage && !policy && !isLoading && !isUnavailable) {
    return (
      <RequirePermission permission="settings:read">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi policy"
          description={pageDescription}
          actions={
            <>
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
              {canWrite ? (
                <>
                  {form && !isLoading ? (
                    <AlPageHeaderAction
                      label={isSaving ? 'Saving…' : 'Save draft'}
                      loading={isSaving}
                      onClick={() => {
                        void onSave();
                      }}
                    />
                  ) : null}
                  {policy?.status === 'DRAFT' ? (
                    <AlPageHeaderAction
                      label={isPublishing ? 'Publishing…' : 'Publish draft'}
                      loading={isPublishing}
                      onClick={() => {
                        void onPublish();
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </>
          }
        />

        <AdminDataBlock>
          {isLoading && !form ? (
            <p className="taxi-policy__muted">Loading Taxi policy…</p>
          ) : form ? (
            <form
              className="taxi-policy__form"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <label>
                Customer advance (bps)
                <input
                  data-testid="taxi-customer-advance-bps"
                  type="number"
                  min={0}
                  max={10_000}
                  step={1}
                  value={form.customerAdvanceBps}
                  disabled={!canWrite || isSaving || isPublishing}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      customerAdvanceBps: Number.parseInt(event.target.value || '0', 10) || 0,
                    });
                  }}
                />
              </label>
              <label>
                Partner deposit (bps)
                <input
                  data-testid="taxi-partner-deposit-bps"
                  type="number"
                  min={0}
                  max={10_000}
                  step={1}
                  value={form.partnerDepositBps}
                  disabled={!canWrite || isSaving || isPublishing}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      partnerDepositBps: Number.parseInt(event.target.value || '0', 10) || 0,
                    });
                  }}
                />
              </label>
              {policy?.status ? (
                <p className="taxi-policy__note" data-testid="taxi-policy-status">
                  Status: <strong>{policy.status}</strong>
                  {policy.id ? ` · id ${policy.id}` : null}
                </p>
              ) : (
                <p className="taxi-policy__note" data-testid="taxi-policy-status">
                  Status: <strong>none</strong> — save creates DRAFT (Admin-supplied bps; no
                  invented money defaults).
                </p>
              )}
              {saveErrorMessage ? (
                <p className="taxi-policy__error" role="alert">
                  {saveErrorMessage}
                </p>
              ) : null}
              {publishErrorMessage ? (
                <p className="taxi-policy__error" role="alert">
                  {publishErrorMessage}
                </p>
              ) : null}
              {savedNote ? (
                <p className="taxi-policy__ok" role="status">
                  {savedNote}
                </p>
              ) : null}
              {publishedNote ? (
                <p className="taxi-policy__ok" role="status">
                  {publishedNote}
                </p>
              ) : null}
            </form>
          ) : null}
        </AdminDataBlock>

        <h2 className="taxi-policy__section-title">Published history</h2>
        <AdminDataBlock>
          {history.length === 0 ? (
            <p className="taxi-policy__muted" data-testid="taxi-policy-history-empty">
              No published Taxi policy versions yet.
            </p>
          ) : (
            <ul className="taxi-policy__history" data-testid="taxi-policy-history">
              {history.map((row) => (
                <li key={row.id}>
                  <strong>{row.status ?? 'PUBLISHED'}</strong>
                  {typeof row.customerAdvanceBps === 'number'
                    ? ` · advance ${String(row.customerAdvanceBps)} bps`
                    : null}
                  {typeof row.partnerDepositBps === 'number'
                    ? ` · deposit ${String(row.partnerDepositBps)} bps`
                    : null}
                  {row.publishedAt ? ` · ${row.publishedAt}` : null}
                </li>
              ))}
            </ul>
          )}
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
