'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { usePurchaseAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/purchase';
import {
  getPurchaseSession,
  isPurchaseAuthenticated,
  type CreateAddressPayload,
  type SavedAddress,
  type UpdateAddressPayload,
} from '@/services/purchase';
import { JourneyHeader } from '../../../shared/components/JourneyHeader';
import { JOURNEY_ROUTES } from '../../../shared/routes';
import { SkeletonBar } from '../../../shared/components/Skeleton';
import { emitAddressesChanged } from '../../events';
import { AddressFields, type AddressFormValues } from '../AddressFields';
import styles from './index.module.css';

interface AddressFormContainerProps {
  mode: 'create' | 'edit';
  /** Required in edit mode — the saved address id from the URL. */
  addressId?: string;
  /** `modal` overlays the list (intercepted); `page` is the hard-load fallback. */
  variant: 'modal' | 'page';
}

function sessionMobile(): string {
  const phone = getPurchaseSession()?.phone;
  return phone?.startsWith('+91') ? phone.slice(3) : '';
}

export function AddressFormContainer({ mode, addressId, variant }: AddressFormContainerProps) {
  const router = useRouter();
  const isModal = variant === 'modal';

  const close = () => {
    if (isModal) router.back();
    else router.push(JOURNEY_ROUTES.addresses);
  };

  // Managing addresses needs a live purchase session.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (isPurchaseAuthenticated()) setAuthed(true);
    else router.replace(JOURNEY_ROUTES.buy);
  }, [router]);

  // Scroll-lock + Escape for the modal variant only.
  useEffect(() => {
    if (!isModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isModal, router]);

  // Edit mode needs the current values; there's no GET-by-id, so read the list.
  const { data: addresses = [], isSuccess } = usePurchaseAddresses(authed && mode === 'edit');
  const editing: SavedAddress | null =
    mode === 'edit' ? (addresses.find((a) => a.id === addressId) ?? null) : null;
  const loadingEdit = mode === 'edit' && !isSuccess;

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const saving = createAddress.isLoading || updateAddress.isLoading;

  const handleSubmit = async (values: AddressFormValues) => {
    const base = {
      name: values.name,
      line1: values.line1,
      line2: values.line2,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      isDefault: values.isDefault,
    };
    try {
      if (mode === 'edit' && editing) {
        const payload: UpdateAddressPayload = { ...base };
        if (values.mobile) payload.phone = values.mobile;
        await updateAddress.mutateAsync({ id: editing.id, payload });
      } else {
        const payload: CreateAddressPayload = { ...base, phone: values.mobile };
        await createAddress.mutateAsync(payload);
      }
      emitAddressesChanged();
      close();
    } catch {
      // Error toast is surfaced by the mutation hooks.
    }
  };

  const title = mode === 'edit' ? 'Edit address' : 'Add a new address';
  const subtitle = 'Search to autofill, or type it in below';

  const inner = (
    <>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {isModal ? (
          <button type="button" className={styles.close} onClick={close} aria-label="Close">
            <X className={styles.closeIcon} aria-hidden />
          </button>
        ) : null}
      </div>

      {loadingEdit ? (
        <div className={styles.formSkeleton}>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className={styles.skelField}>
              <SkeletonBar w={120} h={14} />
              <SkeletonBar h={56} radius={14} />
            </div>
          ))}
        </div>
      ) : (
        <AddressFields
          mode={mode}
          initial={editing}
          defaultMobile={mode === 'edit' ? '' : sessionMobile()}
          submitting={saving}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={close}
        />
      )}
    </>
  );

  if (isModal) {
    return (
      <div
        className={styles.overlay}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={title}>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <div className={styles.pageBody}>
        <div className={styles.card}>{inner}</div>
      </div>
    </div>
  );
}
