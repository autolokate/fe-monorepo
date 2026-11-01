import type { AdminUserSummaryDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { normalizePhoneSearch } from '@/hooks/users/useAdminUsers';
import { taxiOpsQueryKeys } from '@/hooks/taxi/useTaxiOperations';
import { lookupUserByPhone } from '@/services/users/admin-users-service';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { submitTaxiProvision } from '@/services/taxi/taxi-policy-service';

import './taxi-policy.css';

export type TaxiProvisionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY = {
  accountId: '',
  orgName: '',
  ownerName: '',
  city: '',
  area: '',
};

export function TaxiProvisionSheet({ open, onOpenChange }: TaxiProvisionSheetProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [phone, setPhone] = useState('');
  const [match, setMatch] = useState<AdminUserSummaryDto | null>(null);

  const lookup = useMutation({
    mutationFn: (raw: string) => lookupUserByPhone(normalizePhoneSearch(raw) ?? raw),
    retry: 0,
    onSuccess: (account) => {
      setMatch(account);
      setForm((current) => ({ ...current, accountId: account.id }));
    },
    onError: () => {
      setMatch(null);
      setForm((current) => ({ ...current, accountId: '' }));
    },
  });
  const lookupError = lookup.isError
    ? (lookup.error as { status?: number }).status === 404
      ? 'No account uses that phone number.'
      : mapAdminApiError(lookup.error).userMessage
    : null;

  const mutation = useMutation({
    mutationFn: () =>
      submitTaxiProvision({
        accountId: form.accountId.trim(),
        orgName: form.orgName.trim(),
        ownerName: form.ownerName.trim(),
        ...(form.city.trim() ? { city: form.city.trim() } : {}),
        ...(form.area.trim() ? { area: form.area.trim() } : {}),
      }),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Taxi partner provisioned (${result.enrollmentStatus}).`);
      void queryClient.invalidateQueries({ queryKey: taxiOpsQueryKeys.all });
      setForm(EMPTY);
      setPhone('');
      setMatch(null);
      onOpenChange(false);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-provision', toast: true });
    },
  });

  const errorMessage = mutation.isError ? mapAdminApiError(mutation.error).userMessage : null;
  const canSubmit =
    form.accountId.trim().length > 0 &&
    form.orgName.trim().length > 0 &&
    form.ownerName.trim().length > 0 &&
    !mutation.isPending;

  return (
    <AlModal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setForm(EMPTY);
          setPhone('');
          setMatch(null);
          lookup.reset();
          mutation.reset();
        }
        onOpenChange(next);
      }}
      size="md"
      title="Provision Taxi partner"
      description="Create (or re-use) a Taxi partner organization with an ACTIVE enrollment for an existing account."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            variant="secondary"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
          <AlButton
            data-testid="taxi-provision-submit"
            disabled={!canSubmit}
            loading={mutation.isPending}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Provision
          </AlButton>
        </div>
      }
    >
      <AlStack gap="md">
        <div className="admin-form-grid">
          <div className="admin-field taxi-policy__field admin-form-span">
            Owner account (search by phone)
            <div className="taxi-ops__lookup">
              <input
                data-testid="taxi-provision-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                placeholder="10-digit mobile or +91…"
                aria-label="Owner phone"
                onChange={(event) => {
                  setPhone(event.target.value);
                  setMatch(null);
                  setForm((current) => ({ ...current, accountId: '' }));
                }}
              />
              <AlButton
                variant="secondary"
                size="sm"
                data-testid="taxi-provision-lookup"
                loading={lookup.isPending}
                disabled={phone.trim().length < 10}
                onClick={() => {
                  lookup.mutate(phone);
                }}
              >
                Find account
              </AlButton>
            </div>
            {match ? (
              <span className="admin-field__hint" data-testid="taxi-provision-match">
                Account {match.id} · {match.accountType} · {match.status}
                {match.roles.length
                  ? ` · roles ${match.roles.map((role) => role.role).join(', ')}`
                  : ''}
              </span>
            ) : lookupError ? (
              <span className="taxi-policy__field-error" role="alert">
                {lookupError}
              </span>
            ) : (
              <span className="admin-field__hint">
                The account that will own the Taxi org. Phone is matched server-side.
              </span>
            )}
          </div>
          <label className="admin-field taxi-policy__field">
            Organization name
            <input
              data-testid="taxi-provision-org-name"
              value={form.orgName}
              onChange={(event) => {
                setForm({ ...form, orgName: event.target.value });
              }}
            />
          </label>
          <label className="admin-field taxi-policy__field">
            Owner name
            <input
              data-testid="taxi-provision-owner-name"
              value={form.ownerName}
              onChange={(event) => {
                setForm({ ...form, ownerName: event.target.value });
              }}
            />
          </label>
          <label className="admin-field taxi-policy__field">
            City
            <input
              value={form.city}
              placeholder="Optional"
              onChange={(event) => {
                setForm({ ...form, city: event.target.value });
              }}
            />
          </label>
          <label className="admin-field taxi-policy__field">
            Area
            <input
              value={form.area}
              placeholder="Optional"
              onChange={(event) => {
                setForm({ ...form, area: event.target.value });
              }}
            />
          </label>
        </div>
        {errorMessage ? (
          <AlText tone="muted" role="alert">
            {errorMessage}
          </AlText>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
