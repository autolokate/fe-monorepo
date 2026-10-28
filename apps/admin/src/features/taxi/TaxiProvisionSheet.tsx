import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { submitTaxiProvision } from '@/services/taxi/taxi-policy-service';

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
      showSuccessToast(`Taxi partner provisioned (${result.orgId}).`);
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
      description="POST /admin/v1/taxi/provision — creates GARAGE-kind org + taxi enrollment (never QR)."
      footer={
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
      }
    >
      <AlStack gap="md">
        <label className="taxi-policy__field">
          Account ID (UUID)
          <input
            data-testid="taxi-provision-account-id"
            value={form.accountId}
            onChange={(event) => {
              setForm({ ...form, accountId: event.target.value });
            }}
          />
        </label>
        <label className="taxi-policy__field">
          Org name
          <input
            data-testid="taxi-provision-org-name"
            value={form.orgName}
            onChange={(event) => {
              setForm({ ...form, orgName: event.target.value });
            }}
          />
        </label>
        <label className="taxi-policy__field">
          Owner name
          <input
            data-testid="taxi-provision-owner-name"
            value={form.ownerName}
            onChange={(event) => {
              setForm({ ...form, ownerName: event.target.value });
            }}
          />
        </label>
        <label className="taxi-policy__field">
          City (optional)
          <input
            value={form.city}
            onChange={(event) => {
              setForm({ ...form, city: event.target.value });
            }}
          />
        </label>
        <label className="taxi-policy__field">
          Area (optional)
          <input
            value={form.area}
            onChange={(event) => {
              setForm({ ...form, area: event.target.value });
            }}
          />
        </label>
        {errorMessage ? (
          <AlText tone="muted" role="alert">
            {errorMessage}
          </AlText>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
