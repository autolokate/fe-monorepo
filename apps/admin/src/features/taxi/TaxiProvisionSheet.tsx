import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

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
  const [form, setForm] = useState(EMPTY);

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
      showSuccessToast(`Taxi partner created (${result.orgId}).`);
      setForm(EMPTY);
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
          mutation.reset();
        }
        onOpenChange(next);
      }}
      size="md"
      title="Provision Taxi partner"
      description="Create a Taxi partner organization enrolled for deposit and advance flows."
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
          <label className="admin-field taxi-policy__field admin-form-span">
            Owner account ID
            <input
              data-testid="taxi-provision-account-id"
              value={form.accountId}
              placeholder="Account UUID"
              onChange={(event) => {
                setForm({ ...form, accountId: event.target.value });
              }}
            />
          </label>
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
