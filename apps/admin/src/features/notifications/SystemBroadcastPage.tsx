import {
  ADMIN_DEEP_LINK_SCREENS,
  ADMIN_SYSTEM_NOTIFICATION_LIMITS as LIMITS,
  type AdminNotificationAudience,
  type AdminSystemNotificationBody,
} from '@autolokate/api-client';
import { AlButton, AlModal, AlPageHeader, AlStack } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import {
  parseAccountIds,
  validateBroadcast,
  type BroadcastDraft,
} from '@/features/notifications/broadcast-form';
import {
  describeBroadcastError,
  useSystemBroadcast,
} from '@/hooks/notifications/useSystemBroadcast';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';
import { AdminPanel, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import '@/features/users/users-v4.css';

const AUDIENCES: { value: AdminNotificationAudience; label: string }[] = [
  { value: 'CONSUMER', label: 'Consumer app' },
  { value: 'PARTNER', label: 'Partner app' },
];

const EMPTY: BroadcastDraft = {
  audience: 'CONSUMER',
  accountIdsRaw: '',
  title: '',
  body: '',
  deepLinkScreen: '',
  deepLinkParams: '',
  reason: '',
};

function Hint({ error, children }: { error?: string | undefined; children: string }) {
  return (
    <span
      className={`admin-field__hint${error ? ' admin-field__hint--error' : ''}`}
      role={error ? 'alert' : undefined}
    >
      {error ?? children}
    </span>
  );
}

/**
 * SYSTEM notification to an explicit list of accounts (≤ 500) in one app's inbox + push. Rate-limited
 * to 10 per operator per hour (429 `rate_limited`) and audited as `NOTIFICATION_BROADCAST`.
 */
export function SystemBroadcastPage() {
  const [draft, setDraft] = useState<BroadcastDraft>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmBody, setConfirmBody] = useState<AdminSystemNotificationBody | null>(null);
  const mutation = useSystemBroadcast();

  const parsed = useMemo(() => parseAccountIds(draft.accountIdsRaw), [draft.accountIdsRaw]);
  const { errors, body } = useMemo(() => validateBroadcast(draft), [draft]);
  const visibleErrors = showErrors ? errors : {};
  const submitError = mutation.isError ? describeBroadcastError(mutation.error) : null;

  const update = <K extends keyof BroadcastDraft>(key: K, value: BroadcastDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const idsSummary = [
    `${String(parsed.ids.length)} account${parsed.ids.length === 1 ? '' : 's'}`,
    parsed.duplicates > 0 ? `${String(parsed.duplicates)} duplicate(s) removed` : null,
    `max ${String(LIMITS.accountIdsMax)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <RequirePermission permission="users:write">
      <AlStack gap="md">
        <AlPageHeader
          title="System broadcast"
          description="Send a SYSTEM notification (inbox + push) to specific accounts in the consumer or partner app."
        />

        <p className="admin-audit-note">
          <span>
            <strong>Audited and rate-limited.</strong> Every send is recorded as
            NOTIFICATION_BROADCAST with your reason. Each operator can send 10 broadcasts per hour;
            accounts without a matching app inbox are skipped.
          </span>
        </p>

        {mutation.isSuccess ? (
          <AdminPanel title="Broadcast queued" subtitle="Delivery runs in the background.">
            <div data-testid="broadcast-result">
              <AdminMutationResultPanel
                title="Result"
                fields={[
                  { label: 'Broadcast id', value: mutation.data.broadcastId },
                  { label: 'Queued', value: String(mutation.data.queued) },
                  { label: 'Skipped', value: String(mutation.data.skipped) },
                ]}
              />
            </div>
            <div className="admin-v4-gate">
              <AlButton
                size="sm"
                variant="secondary"
                data-testid="broadcast-new"
                onClick={() => {
                  mutation.reset();
                  setDraft(EMPTY);
                  setShowErrors(false);
                }}
              >
                Compose another
              </AlButton>
            </div>
          </AdminPanel>
        ) : null}

        <div className="admin-broadcast-grid">
          <AdminPanel title="Compose" subtitle="Category is always SYSTEM.">
            <form
              className="admin-broadcast-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                setShowErrors(true);
                if (body) {
                  mutation.reset();
                  setConfirmBody(body);
                }
              }}
            >
              <div className="admin-field">
                Audience
                <AdminFilterChips
                  options={AUDIENCES}
                  value={draft.audience}
                  onChange={(value) => {
                    update('audience', value);
                  }}
                  aria-label="Audience app"
                />
              </div>

              <label className="admin-field">
                Account IDs
                <textarea
                  rows={5}
                  className="admin-mono"
                  data-testid="broadcast-account-ids"
                  placeholder="One account UUID per line (commas or spaces also work)"
                  value={draft.accountIdsRaw}
                  aria-invalid={visibleErrors.accountIds ? true : undefined}
                  onChange={(event) => {
                    update('accountIdsRaw', event.target.value);
                  }}
                />
                <Hint error={visibleErrors.accountIds}>{idsSummary}</Hint>
              </label>

              <label className="admin-field">
                Title
                <input
                  data-testid="broadcast-title"
                  maxLength={LIMITS.titleMax}
                  value={draft.title}
                  aria-invalid={visibleErrors.title ? true : undefined}
                  onChange={(event) => {
                    update('title', event.target.value);
                  }}
                />
                <Hint error={visibleErrors.title}>
                  {`${String(draft.title.trim().length)}/${String(LIMITS.titleMax)}`}
                </Hint>
              </label>

              <label className="admin-field">
                Message
                <textarea
                  rows={4}
                  data-testid="broadcast-body"
                  maxLength={LIMITS.bodyMax}
                  value={draft.body}
                  aria-invalid={visibleErrors.body ? true : undefined}
                  onChange={(event) => {
                    update('body', event.target.value);
                  }}
                />
                <Hint error={visibleErrors.body}>
                  {`${String(draft.body.trim().length)}/${String(LIMITS.bodyMax)}`}
                </Hint>
              </label>

              <label className="admin-field">
                Deep link (optional)
                <select
                  data-testid="broadcast-deep-link"
                  value={draft.deepLinkScreen}
                  onChange={(event) => {
                    update(
                      'deepLinkScreen',
                      event.target.value as BroadcastDraft['deepLinkScreen'],
                    );
                  }}
                >
                  <option value="">No deep link — opens the inbox</option>
                  {ADMIN_DEEP_LINK_SCREENS.map((screen) => (
                    <option key={screen} value={screen}>
                      {screen}
                    </option>
                  ))}
                </select>
                <Hint>Pick a screen from the matching app (Partner… screens for partner).</Hint>
              </label>

              {draft.deepLinkScreen ? (
                <label className="admin-field">
                  Deep link params (JSON object, optional)
                  <input
                    className="admin-mono"
                    data-testid="broadcast-deep-link-params"
                    placeholder='{"requestId": "…"}'
                    value={draft.deepLinkParams}
                    aria-invalid={visibleErrors.deepLinkParams ? true : undefined}
                    onChange={(event) => {
                      update('deepLinkParams', event.target.value);
                    }}
                  />
                  <Hint error={visibleErrors.deepLinkParams}>
                    Leave empty when the screen needs none.
                  </Hint>
                </label>
              ) : null}

              <label className="admin-field">
                Reason (recorded in the audit log)
                <textarea
                  rows={2}
                  data-testid="broadcast-reason"
                  maxLength={LIMITS.reasonMax}
                  value={draft.reason}
                  aria-invalid={visibleErrors.reason ? true : undefined}
                  onChange={(event) => {
                    update('reason', event.target.value);
                  }}
                />
                <Hint error={visibleErrors.reason}>Why these accounts need this notice.</Hint>
              </label>

              {submitError && !confirmBody ? (
                <p className="admin-form-error" role="alert" data-testid="broadcast-error">
                  {submitError}
                </p>
              ) : null}

              <div className="admin-modal-actions">
                <AlButton type="submit" data-testid="broadcast-review">
                  Review & send
                </AlButton>
              </div>
            </form>
          </AdminPanel>

          <AdminPanel title="Preview" subtitle="Roughly how the inbox item reads.">
            <div className="admin-broadcast-preview" data-testid="broadcast-preview">
              <span className="admin-broadcast-preview__app">
                {draft.audience === 'CONSUMER' ? 'Autolokate' : 'Autolokate Partner'} · System
              </span>
              <p className="admin-broadcast-preview__title">{draft.title.trim() || 'Title'}</p>
              <p className="admin-broadcast-preview__body">
                {draft.body.trim() || 'Your message appears here.'}
              </p>
              <span className="admin-broadcast-preview__link">
                {draft.deepLinkScreen ? `Opens ${draft.deepLinkScreen}` : 'Opens the inbox'}
              </span>
            </div>
          </AdminPanel>
        </div>

        <AlModal
          open={confirmBody !== null}
          onOpenChange={(open) => {
            if (!open && !mutation.isPending) setConfirmBody(null);
          }}
          title="Send this broadcast?"
          description="It cannot be recalled once queued."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={mutation.isPending}
                onClick={() => {
                  setConfirmBody(null);
                }}
              >
                Cancel
              </AlButton>
              <AlButton
                data-testid="broadcast-confirm"
                loading={mutation.isPending}
                onClick={() => {
                  if (!confirmBody) return;
                  mutation.mutate(confirmBody, {
                    onSettled: () => {
                      setConfirmBody(null);
                    },
                  });
                }}
              >
                Send to {String(confirmBody?.accountIds.length ?? 0)} account(s)
              </AlButton>
            </div>
          }
        >
          {confirmBody ? (
            <dl className="admin-broadcast-summary" data-testid="broadcast-summary">
              <dt>Audience</dt>
              <dd>{humanizeAdminLabel(confirmBody.audience)} app</dd>
              <dt>Accounts</dt>
              <dd>{String(confirmBody.accountIds.length)}</dd>
              <dt>Title</dt>
              <dd>{confirmBody.title}</dd>
              <dt>Deep link</dt>
              <dd>{confirmBody.deepLink?.screen ?? 'None (inbox)'}</dd>
              <dt>Reason</dt>
              <dd>{confirmBody.reason}</dd>
            </dl>
          ) : null}
        </AlModal>
      </AlStack>
    </RequirePermission>
  );
}
