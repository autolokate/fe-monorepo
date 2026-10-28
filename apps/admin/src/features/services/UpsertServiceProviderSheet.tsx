import type {
  ServiceCategory,
  ServiceProviderDto,
  ServiceProviderStatus,
  UpsertServiceProviderBody,
} from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal, AlSelect, AlStack } from '@autolokate/ui';
import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import { resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';

export type UpsertServiceProviderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  initial: ServiceProviderDto | null;
  defaultCategory: ServiceCategory;
  busy: boolean;
  error: unknown;
  onSubmit: (body: UpsertServiceProviderBody) => Promise<void>;
};

type FormState = {
  name: string;
  category: string;
  city: string;
  latitude: string;
  longitude: string;
  verifiedPartner: boolean;
  status: ServiceProviderStatus;
  subtitle: string;
  phone: string;
  address: string;
};

function toForm(initial: ServiceProviderDto | null, defaultCategory: string): FormState {
  if (!initial) {
    return {
      name: '',
      category: defaultCategory,
      city: '',
      latitude: '',
      longitude: '',
      verifiedPartner: false,
      status: 'ACTIVE',
      subtitle: '',
      phone: '',
      address: '',
    };
  }
  return {
    name: initial.name,
    category: initial.category,
    city: initial.city,
    latitude: initial.latitude == null ? '' : String(initial.latitude),
    longitude: initial.longitude == null ? '' : String(initial.longitude),
    verifiedPartner: initial.verifiedPartner,
    status: 'ACTIVE',
    subtitle: initial.subtitle,
    phone: initial.phone ?? '',
    address: initial.address ?? '',
  };
}

function parseOptionalNumber(raw: string): number | null | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

export function UpsertServiceProviderSheet({
  open,
  onOpenChange,
  categories,
  initial,
  defaultCategory,
  busy,
  error,
  onSubmit,
}: UpsertServiceProviderSheetProps) {
  const [form, setForm] = useState<FormState>(() => toForm(initial, defaultCategory));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toForm(initial, defaultCategory));
      setLocalError(null);
    }
  }, [defaultCategory, initial, open]);

  const categoryOptions = categories.map((value) => ({
    value,
    label: value,
  }));

  const submitError = error ? resolveSubmitErrorMessage(error) : null;

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const name = form.name.trim();
    const city = form.city.trim();
    if (name.length < 2) {
      setLocalError('Name must be at least 2 characters.');
      return;
    }
    if (!city) {
      setLocalError('City is required.');
      return;
    }

    const latitude = parseOptionalNumber(form.latitude);
    const longitude = parseOptionalNumber(form.longitude);
    if (latitude === undefined) {
      setLocalError('Latitude must be a number.');
      return;
    }
    if (longitude === undefined) {
      setLocalError('Longitude must be a number.');
      return;
    }

    const body: UpsertServiceProviderBody = {
      ...(initial ? { id: initial.id } : {}),
      name,
      category: form.category as ServiceCategory,
      city,
      subtitle: form.subtitle.trim() || undefined,
      phone: form.phone.trim() ? form.phone.trim() : null,
      address: form.address.trim() ? form.address.trim() : null,
      verifiedPartner: form.verifiedPartner,
      latitude,
      longitude,
      status: form.status,
    };

    try {
      await onSubmit(body);
      onOpenChange(false);
    } catch {
      // Surfaced via error prop + toast.
    }
  };

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={initial ? 'Edit service provider' : 'Add service provider'}
      description="Add or update a provider for the consumer Services hub."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="upsert-service-provider-form"
            size="sm"
            loading={busy}
            disabled={busy}
            data-testid="services-upsert-submit"
          >
            {initial ? 'Save provider' : 'Create provider'}
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      <form
        id="upsert-service-provider-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <AlStack gap="md">
          <AlInput
            label="Name"
            data-testid="services-upsert-name"
            value={form.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, name: event.target.value }));
            }}
            autoComplete="off"
          />
          <AlSelect
            label="Category"
            data-testid="services-upsert-category"
            options={categoryOptions}
            value={form.category}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              setForm((prev) => ({ ...prev, category: event.target.value }));
            }}
          />
          <AlInput
            label="City"
            data-testid="services-upsert-city"
            value={form.city}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, city: event.target.value }));
            }}
            autoComplete="off"
          />
          <div className="services-form-grid">
            <AlInput
              label="Latitude"
              data-testid="services-upsert-lat"
              value={form.latitude}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, latitude: event.target.value }));
              }}
              helperText="Optional (−90…90)."
              autoComplete="off"
            />
            <AlInput
              label="Longitude"
              data-testid="services-upsert-lng"
              value={form.longitude}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, longitude: event.target.value }));
              }}
              helperText="Optional (−180…180)."
              autoComplete="off"
            />
          </div>
          <AlSelect
            label="Status"
            data-testid="services-upsert-status"
            options={[
              { value: 'ACTIVE', label: 'ACTIVE' },
              { value: 'INACTIVE', label: 'INACTIVE' },
            ]}
            value={form.status}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              setForm((prev) => ({
                ...prev,
                status: event.target.value as ServiceProviderStatus,
              }));
            }}
            helperText="Consumer list only returns ACTIVE. Category order/visibility is not BE-configurable yet."
          />
          <AlCheckbox
            label="Verified partner"
            data-testid="services-upsert-verified"
            checked={form.verifiedPartner}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, verifiedPartner: event.target.checked }));
            }}
          />
          <AlInput
            label="Subtitle"
            data-testid="services-upsert-subtitle"
            value={form.subtitle}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, subtitle: event.target.value }));
            }}
            autoComplete="off"
          />
          <AlInput
            label="Phone"
            data-testid="services-upsert-phone"
            value={form.phone}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, phone: event.target.value }));
            }}
            autoComplete="off"
          />
          <AlInput
            label="Address"
            data-testid="services-upsert-address"
            value={form.address}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setForm((prev) => ({ ...prev, address: event.target.value }));
            }}
            autoComplete="off"
          />
          {localError || submitError ? (
            <p className="admin-form-error" data-testid="services-upsert-error">
              {localError ?? submitError}
            </p>
          ) : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
