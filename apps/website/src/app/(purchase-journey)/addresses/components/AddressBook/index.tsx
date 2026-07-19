'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { usePurchaseAddresses, useUpdateAddress, useDeleteAddress } from '@/hooks/purchase';
import { isPurchaseAuthenticated, type SavedAddress } from '@/services/purchase';
import { JourneyHeader } from '../../../shared/components/JourneyHeader';
import { JourneyError } from '../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../shared/routes';
import { ADDRESSES_CHANGED, emitAddressesChanged } from '../../events';
import { AddressRow } from '../AddressRow';
import { AddressBookSkeleton } from '../AddressBookSkeleton';
import { DeleteAddressDialog } from '../DeleteAddressDialog';
import styles from './index.module.css';

export function AddressBook() {
  const router = useRouter();

  // Managing addresses needs a live purchase session; bounce guests to plans.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (isPurchaseAuthenticated()) setAuthed(true);
    else router.replace(JOURNEY_ROUTES.buy);
  }, [router]);

  const { data: addresses = [], isError, isSuccess, refetch } = usePurchaseAddresses(authed);
  const showLoading = !isSuccess && !isError;
  const isEmpty = isSuccess && addresses.length === 0;

  // The add/edit forms live in the `@modal` slot / a separate page, so they
  // broadcast after a mutation; refetch the (still-mounted) list when they do.
  useEffect(() => {
    const onChange = () => void refetch();
    window.addEventListener(ADDRESSES_CHANGED, onChange);
    return () => {
      window.removeEventListener(ADDRESSES_CHANGED, onChange);
    };
  }, [refetch]);

  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null);

  const handleSetDefault = async (address: SavedAddress) => {
    if (address.isDefault || updateAddress.isLoading) return;
    try {
      await updateAddress.mutateAsync({ id: address.id, payload: { isDefault: true } });
      emitAddressesChanged();
      await refetch();
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  return (
    <div className={styles.page}>
      <JourneyHeader />

      <div className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>My addresses</h1>
          <p className={styles.sub}>Manage where your orders are delivered</p>
        </div>

        {showLoading ? (
          <div className={styles.list}>
            <AddressBookSkeleton />
          </div>
        ) : isError ? (
          <div className={styles.stateWrap}>
            <JourneyError title="Couldn’t load your addresses" onRetry={() => void refetch()} />
          </div>
        ) : (
          <div className={styles.list}>
            {isEmpty ? (
              <p className={styles.empty}>You have no saved addresses yet</p>
            ) : (
              addresses.map((address) => (
                <AddressRow
                  key={address.id}
                  address={address}
                  onSetDefault={(a) => void handleSetDefault(a)}
                  onEdit={(a) => {
                    router.push(JOURNEY_ROUTES.addressEdit(a.id));
                  }}
                  onDelete={(a) => {
                    setDeleteTarget(a);
                  }}
                />
              ))
            )}

            <button
              type="button"
              className={styles.addNew}
              onClick={() => {
                router.push(JOURNEY_ROUTES.addressNew);
              }}
            >
              <Plus className={styles.addNewIcon} aria-hidden />
              Add a new address
            </button>
          </div>
        )}
      </div>

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
