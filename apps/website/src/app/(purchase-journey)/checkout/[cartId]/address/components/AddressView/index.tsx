'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePurchaseAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '@/hooks/purchase';
import { JourneyHeader } from '../../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../../shared/components/JourneyProgress';
import { JourneyError } from '../../../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../../../shared/routes';
import { patchJourneyState, readJourneyState } from '../../../../../shared/storage';
import {
  getSessionMobile,
  isPurchaseAuthenticated,
  type CreateAddressPayload,
  type SavedAddress,
  type UpdateAddressPayload,
} from '../../../../../shared/services/checkout-api';
import { AddressCard } from '../AddressCard';
import { AddressForm, type AddressFormValues } from '../AddressForm';
import { AddressSkeleton } from '../AddressSkeleton';
import { DeleteAddressDialog } from '../DeleteAddressDialog';
import styles from './index.module.css';

interface AddressViewProps {
  /** Cart minted after verify — sent as `cartId` on order create. */
  cartId: string;
}

type Mode = 'list' | 'form';

export function AddressView({ cartId }: AddressViewProps) {
  const router = useRouter();

  // Checkout is post-verify: bounce anyone without a live session back to plans.
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (isPurchaseAuthenticated()) {
      setAuthed(true);
    } else {
      setAuthed(false);
      router.replace(JOURNEY_ROUTES.buy);
    }
  }, [router]);

  const {
    data: addresses = [],
    isFetching,
    isError,
    isSuccess,
    refetch,
  } = usePurchaseAddresses(authed === true);

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null);

  // Keep a selection valid: prefer the default, else the first address.
  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && addresses.some((a) => a.id === prev)) return prev;
      return (addresses.find((a) => a.isDefault) ?? addresses[0]).id;
    });
  }, [addresses]);

  // Skeleton until the first successful load (refetches keep the list visible).
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (isSuccess) setHasLoaded(true);
  }, [isSuccess]);

  const planId = readJourneyState().planId;
  const goBack = () => {
    if (mode === 'form') {
      setMode('list');
      setEditing(null);
      return;
    }
    router.push(planId ? JOURNEY_ROUTES.verify(planId) : JOURNEY_ROUTES.buy);
  };

  const openCreate = () => {
    setEditing(null);
    setMode('form');
  };

  const openEdit = (address: SavedAddress) => {
    setEditing(address);
    setMode('form');
  };

  const handleReview = () => {
    if (!selectedId) return;
    patchJourneyState({ cartId, addressId: selectedId });
    router.push(JOURNEY_ROUTES.review(cartId));
  };

  const saving = createAddress.isLoading || updateAddress.isLoading;

  const handleSubmit = async (values: AddressFormValues) => {
    try {
      // Name is captured on the verify step (profile), so it's omitted here —
      // the backend fills it from the buyer's profile.
      const base = {
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        isDefault: values.isDefault,
      };

      let saved: SavedAddress;
      if (editing) {
        const payload: UpdateAddressPayload = { ...base };
        if (values.mobile) payload.phone = values.mobile;
        if (values.email.trim()) payload.email = values.email.trim();
        saved = await updateAddress.mutateAsync({ id: editing.id, payload });
      } else {
        const payload: CreateAddressPayload = {
          ...base,
          phone: values.mobile,
          email: values.email,
        };
        saved = await createAddress.mutateAsync(payload);
      }

      await refetch();
      setSelectedId(saved.id);
      setEditing(null);
      setMode('list');
    } catch {
      // Error toast is surfaced by the mutation hooks.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress.mutateAsync(deleteTarget.id);
      await refetch();
      setDeleteTarget(null);
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  const bootLoading = authed !== true || (!hasLoaded && !isError);
  const isForm = mode === 'form';

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={2} />

      {isError && !isForm ? (
        <div className={styles.errorBody}>
          <JourneyError title="Couldn’t load your addresses" onRetry={() => void refetch()} />
        </div>
      ) : (
        <div className={styles.body}>
          <button type="button" className={styles.backLink} onClick={goBack}>
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </button>

          <div className={styles.hd}>
            <h1 className={styles.title}>
              {isForm ? (editing ? 'Edit address' : 'New address') : 'Where should we ship?'}
            </h1>
            <p className={styles.subhead}>
              {isForm
                ? 'Search to autofill, or type it in below'
                : 'Your Smart QR kit ships here, free'}
            </p>
          </div>

          {isForm ? (
            <AddressForm
              mode={editing ? 'edit' : 'create'}
              initial={editing}
              defaultMobile={editing ? '' : getSessionMobile()}
              submitting={saving}
              onSubmit={(values) => void handleSubmit(values)}
            />
          ) : bootLoading || (isFetching && addresses.length === 0) ? (
            <AddressSkeleton />
          ) : (
            <>
              <div className={styles.list}>
                {addresses.length === 0 ? (
                  <p className={styles.empty}>You have no saved addresses yet</p>
                ) : (
                  addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selected={selectedId === address.id}
                      onSelect={() => {
                        setSelectedId(address.id);
                      }}
                      onEdit={() => {
                        openEdit(address);
                      }}
                      onDelete={() => {
                        setDeleteTarget(address);
                      }}
                    />
                  ))
                )}

                <button type="button" className={styles.addNew} onClick={openCreate}>
                  <Plus className={styles.addNewIcon} aria-hidden />
                  Add a new address
                </button>
              </div>

              <button
                type="button"
                className={cn(styles.reviewCta, !selectedId && styles.reviewDisabled)}
                onClick={handleReview}
                disabled={!selectedId}
              >
                Review order
                <ArrowRight className={styles.reviewIcon} aria-hidden />
              </button>
            </>
          )}
        </div>
      )}

      {deleteTarget ? (
        <DeleteAddressDialog
          address={deleteTarget}
          deleting={deleteAddress.isLoading}
          onCancel={() => {
            setDeleteTarget(null);
          }}
          onConfirm={() => void handleDeleteConfirm()}
        />
      ) : null}
    </div>
  );
}
