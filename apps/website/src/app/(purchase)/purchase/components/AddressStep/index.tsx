'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Loader2, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { AlButton } from '@autolokate/ui/button';
import { AlTextField } from '@autolokate/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useAddressAutocomplete,
  useCreateAddress,
  useDeleteAddress,
  usePurchaseAddresses,
  useUpdateAddress,
  useUpdatePurchaseProfile,
} from '@/hooks/purchase';
import type {
  AddressSuggestion,
  CreateAddressPayload,
  SavedAddress,
  UpdateAddressPayload,
} from '@/services/purchase';
import { MOBILE_LENGTH, PIN_LENGTH } from '../../constants';
import type { StepProps } from '../../types';
import { StepShell } from '../StepShell';
import styles from './index.module.css';

/** Which screen the step is showing. `loading` gates the first paint. */
type View = 'loading' | 'list' | 'form';
type FormMode = 'create' | 'edit';

export function AddressStep({ state, update, goTo, isAuthenticated }: StepProps) {
  const {
    data: addresses = [],
    isSuccess: addressesLoaded,
    isError: addressesError,
    refetch,
  } = usePurchaseAddresses(isAuthenticated);
  const { mutateAsync: updateProfile, isLoading: savingProfile } = useUpdatePurchaseProfile();
  const { mutateAsync: createAddress, isLoading: creating } = useCreateAddress({
    errorToast: true,
  });
  const { mutateAsync: updateAddress, isLoading: updating } = useUpdateAddress({
    errorToast: true,
  });
  const { mutateAsync: deleteAddress, isLoading: deleting } = useDeleteAddress({
    errorToast: true,
  });
  const { suggestions, isSuggesting, isResolving, search, resolve, reset } =
    useAddressAutocomplete();

  // ─── View orchestration ────────────────────────────────────────────
  const [view, setView] = useState<View>('loading');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  // The saved address being edited — kept to source masked contact hints.
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null);
  const decidedRef = useRef(false);

  // ─── Address-picker local state (never persisted) ───────────────────
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pinTouched, setPinTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [addrTouched, setAddrTouched] = useState(false);
  const [line2Touched, setLine2Touched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [regionTouched, setRegionTouched] = useState(false);
  const [addressResolved, setAddressResolved] = useState(false);
  const [pinFromLookup, setPinFromLookup] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  const isEditing = formMode === 'edit';

  const resetTouched = () => {
    setNameTouched(false);
    setMobileTouched(false);
    setEmailTouched(false);
    setAddrTouched(false);
    setLine2Touched(false);
    setPinTouched(false);
    setCityTouched(false);
    setRegionTouched(false);
  };

  // Open a blank form to add a new address. Keeps the buyer's name / contact
  // as a sensible default, but clears every address-specific field.
  const startCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setEditingAddress(null);
    setQuery('');
    reset();
    setOpen(false);
    setActiveIndex(-1);
    setAddressResolved(false);
    setPinFromLookup(false);
    update({ addr: '', line2: '', pin: '', city: '', region: '' });
    resetTouched();
    setView('form');
  };

  // Open the form prefilled from a saved address. Contact fields come back
  // masked, so they start empty (optional on edit) with the mask as a hint.
  const startEdit = (a: SavedAddress) => {
    setFormMode('edit');
    setEditingId(a.id);
    setEditingAddress(a);
    setQuery('');
    reset();
    setOpen(false);
    setActiveIndex(-1);
    update({
      name: a.name,
      orderMobile: '',
      email: '',
      addr: a.line1,
      line2: a.line2 ?? '',
      city: a.city,
      region: a.state,
      pin: a.pincode,
    });
    setAddressResolved(true);
    setPinFromLookup(false);
    resetTouched();
    setView('form');
  };

  // Copy a chosen saved address into the shared state the summary / order flow
  // already reads from (line1…pincode). Contact stays as-is (masked upstream).
  const applyAddressToState = (a: SavedAddress) => {
    update({
      name: a.name,
      addr: a.line1,
      line2: a.line2 ?? '',
      city: a.city,
      region: a.state,
      pin: a.pincode,
    });
  };

  // Decide the first screen once the saved-addresses fetch settles. `isSuccess`
  // (not `isLoading`) is the signal here: the query seeds `initialData: []`, so
  // `isLoading` is false from the first render — deciding on it would latch the
  // empty seed before the real list arrives.
  useEffect(() => {
    if (decidedRef.current) return;
    // Not signed in → nothing to fetch, go straight to a blank form.
    if (!isAuthenticated) {
      decidedRef.current = true;
      startCreate();
      return;
    }
    // Wait for the first fetch to resolve (or fail) before choosing a screen.
    if (!addressesLoaded && !addressesError) return;
    decidedRef.current = true;
    if (addresses.length > 0) {
      const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedId(preferred.id);
      setView('list');
    } else {
      startCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, addressesLoaded, addressesError, addresses]);

  // ─── Validation ────────────────────────────────────────────────────
  const pinValid = state.pin.length === PIN_LENGTH;
  // Only lock the auto-filled fields when a Google prediction filled them on a
  // fresh create — an edit keeps everything hand-editable.
  const lockResolved = addressResolved && !isEditing;
  const pinLocked = lockResolved && pinFromLookup;
  const mobileRe = /^[6-9]\d{9}$/;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // On edit, contact fields are optional (the saved ones are kept unless typed).
  const mobileValid = isEditing
    ? state.orderMobile === '' || mobileRe.test(state.orderMobile)
    : mobileRe.test(state.orderMobile);
  const emailValid = isEditing
    ? state.email.trim() === '' || emailRe.test(state.email.trim())
    : emailRe.test(state.email.trim());
  const nameValid = state.name.trim().length > 0;
  const addrValid = state.addr.trim().length > 0;
  const line2Valid = state.line2.trim().length > 0;
  const cityValid = state.city.trim().length > 0;
  const regionValid = state.region.trim().length > 0;
  const addressOk =
    nameValid &&
    mobileValid &&
    emailValid &&
    addrValid &&
    line2Valid &&
    pinValid &&
    cityValid &&
    regionValid;

  // ─── Autocomplete handlers ─────────────────────────────────────────
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setOpen(true);
    search(value);
  };

  const handlePick = async (s: AddressSuggestion) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(false);
    setActiveIndex(-1);
    setQuery(s.secondary ? `${s.primary}, ${s.secondary}` : s.primary);

    const resolved = await resolve(s.placeId);
    if (!resolved) {
      toast.error("Couldn't load that address. Please try again.");
      return;
    }

    const hasPin = Boolean(resolved.pincode);
    update({
      addr: resolved.line1,
      line2: resolved.line2 ?? state.line2,
      city: resolved.city ?? state.city,
      region: resolved.state ?? state.region,
      pin: resolved.pincode ?? state.pin,
    });
    setAddressResolved(true);
    setPinFromLookup(hasPin);
    setQuery(s.secondary ? `${s.primary}, ${s.secondary}` : s.primary);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      void handlePick(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const handleClearSearch = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    reset();
    update({ addr: '', line2: '', pin: '', city: '', region: '' });
    // On edit we keep the fields visible so the buyer can re-enter by hand.
    if (!isEditing) {
      setAddressResolved(false);
      setPinFromLookup(false);
    }
    setAddrTouched(false);
    setLine2Touched(false);
    setPinTouched(false);
    setCityTouched(false);
    setRegionTouched(false);
  };

  // ─── Submit / continue ─────────────────────────────────────────────
  const savingForm = savingProfile || creating || updating;

  const handleFormContinue = async () => {
    try {
      // Keep the buyer's profile name in sync, matching the existing flow.
      await updateProfile({ name: state.name });

      const base = {
        name: state.name,
        line1: state.addr,
        line2: state.line2,
        city: state.city,
        state: state.region,
        pincode: state.pin,
      };

      let saved: SavedAddress;
      if (isEditing && editingId) {
        const payload: UpdateAddressPayload = { ...base };
        if (state.orderMobile.trim()) payload.phone = state.orderMobile.trim();
        if (state.email.trim()) payload.email = state.email.trim();
        saved = await updateAddress({ id: editingId, payload });
      } else {
        const payload: CreateAddressPayload = {
          ...base,
          phone: state.orderMobile,
          email: state.email,
        };
        saved = await createAddress(payload);
      }

      // Carry the saved address id — the order is created from it, not the lines.
      update({ addressId: saved.id });
      goTo('summary');
    } catch {
      // Error toast is surfaced by the mutation hooks.
    }
  };

  const handleListContinue = () => {
    const chosen = addresses.find((a) => a.id === selectedId);
    if (!chosen) return;
    applyAddressToState(chosen);
    update({ addressId: chosen.id });
    goTo('summary');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.id;
    try {
      await deleteAddress(deletedId);
      setDeleteTarget(null);
      const next = (await refetch()) ?? [];
      if (next.length > 0) {
        if (selectedId === deletedId || !next.some((a) => a.id === selectedId)) {
          const preferred = next.find((a) => a.isDefault) ?? next[0];
          setSelectedId(preferred.id);
        }
        setView('list');
      } else {
        // Nothing left — drop straight into a blank form.
        startCreate();
      }
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  const hasSaved = addresses.length > 0;
  const handleBack = () => {
    if (view === 'form' && hasSaved) {
      setView('list');
      return;
    }
    goTo(isAuthenticated ? 'configure' : 'login');
  };

  const showList = open && query.trim().length > 0;

  // ─── Loading ───────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <StepShell
        title="Where should we ship?"
        subtitle="Your QR sticker kit arrives in 3–5 days. Shipping is free."
      >
        <div className={styles.loading}>
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      </StepShell>
    );
  }

  // ─── Saved-address list ────────────────────────────────────────────
  if (view === 'list') {
    return (
      <StepShell
        title="Where should we ship?"
        subtitle="Choose a saved address or add a new one."
        backLabel="Back"
        onBack={handleBack}
      >
        <div className={styles.addrList}>
          {addresses.map((a) => {
            const active = selectedId === a.id;
            return (
              <div
                key={a.id}
                className={cn(styles.addrCard, active && styles.addrCardActive)}
                onClick={() => {
                  setSelectedId(a.id);
                }}
                role="radio"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(a.id);
                  }
                }}
              >
                <span className={cn(styles.radio, active && styles.radioOn)} aria-hidden>
                  {active ? <span className={styles.radioDot} /> : null}
                </span>
                <div className={styles.addrBody}>
                  <div className={styles.addrTop}>
                    <span className={styles.addrName}>{a.name}</span>
                    {a.label ? <span className={styles.addrTag}>{a.label}</span> : null}
                    {a.isDefault ? <span className={styles.addrDefault}>Default</span> : null}
                  </div>
                  <p className={styles.addrLines}>
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    <br />
                    {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className={styles.addrContact}>
                    {a.phoneMasked}
                    {a.emailMasked ? ` · ${a.emailMasked}` : ''}
                  </p>
                </div>
                <div className={styles.addrActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(a);
                    }}
                    aria-label={`Edit address for ${a.name}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={cn(styles.iconBtn, styles.iconBtnDanger)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(a);
                    }}
                    aria-label={`Delete address for ${a.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}

          <button type="button" className={styles.addNew} onClick={startCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Add new address
          </button>
        </div>

        <AlButton
          size="lg"
          radius="lg"
          variant="primary"
          className={styles.action}
          icon={<ArrowRight className="h-4 w-4" aria-hidden />}
          iconPosition="end"
          disabled={!selectedId}
          onClick={handleListContinue}
        >
          Review order
        </AlButton>

        <DeleteDialog
          target={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            setDeleteTarget(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      </StepShell>
    );
  }

  // ─── Address form (create / edit) ──────────────────────────────────
  return (
    <StepShell
      title={isEditing ? 'Edit delivery address' : 'Where should we ship?'}
      subtitle="Your QR sticker kit arrives in 3–5 days. Shipping is free."
      backLabel="Back"
      onBack={handleBack}
    >
      <div className={styles.card}>
        <AlTextField
          id="ship-name"
          label="Full name"
          prefix=""
          placeholder="Aarav Mehta"
          value={state.name}
          state={nameTouched && !nameValid ? 'error' : 'default'}
          errorText={nameTouched && !nameValid ? 'Full name is required' : undefined}
          onChange={(e) => {
            update({ name: e.target.value });
          }}
          onBlur={() => {
            setNameTouched(true);
          }}
          autoComplete="name"
        />
        <AlTextField
          id="ship-mobile"
          label="Mobile number"
          prefix=""
          placeholder={editingAddress ? `Keep ${editingAddress.phoneMasked}` : '9876543210'}
          inputMode="numeric"
          value={state.orderMobile}
          state={mobileTouched && !mobileValid ? 'error' : 'default'}
          errorText={
            mobileTouched && !mobileValid
              ? 'Enter a valid 10-digit Indian mobile number'
              : undefined
          }
          onChange={(e) => {
            update({
              orderMobile: e.target.value.replace(/\D/g, '').slice(0, MOBILE_LENGTH),
            });
          }}
          onBlur={() => {
            setMobileTouched(true);
          }}
          autoComplete="tel"
        />
        <AlTextField
          id="ship-email"
          label="Email"
          prefix=""
          type="email"
          placeholder={
            editingAddress?.emailMasked ? `Keep ${editingAddress.emailMasked}` : 'aarav@example.com'
          }
          value={state.email}
          state={emailTouched && !emailValid ? 'error' : 'default'}
          errorText={emailTouched && !emailValid ? 'Enter a valid email address' : undefined}
          onChange={(e) => {
            update({ email: e.target.value });
          }}
          onBlur={() => {
            setEmailTouched(true);
          }}
          autoComplete="email"
        />

        <div className={styles.search}>
          <AlTextField
            id="ship-search"
            label="Search your address"
            prefix=""
            className={cn(query.trim().length > 0 && styles.clearable)}
            placeholder="Start typing — e.g. Rajiv Chowk"
            value={query}
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            onBlur={handleBlur}
            autoComplete="off"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-autocomplete="list"
          />

          {isResolving ? (
            <span className={styles.searchSpinner} aria-hidden />
          ) : query.trim().length > 0 ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {showList ? (
            <ul className={styles.suggestions} id={listboxId} role="listbox">
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <li key={s.placeId} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      className={cn(
                        styles.suggestion,
                        i === activeIndex && styles.suggestionActive,
                      )}
                      onMouseEnter={() => {
                        setActiveIndex(i);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => {
                        void handlePick(s);
                      }}
                    >
                      <MapPin className={styles.pin} aria-hidden />
                      <span className={styles.suggestionText}>
                        <span className={styles.primary}>{s.primary}</span>
                        {s.secondary ? (
                          <span className={styles.secondary}>{s.secondary}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.empty} role="presentation">
                  {isSuggesting ? 'Searching…' : 'No matches — enter your address below'}
                </li>
              )}
            </ul>
          ) : null}
        </div>

        {addressResolved ? (
          <>
            <AlTextField
              id="ship-addr"
              label="Flat / house no., street, area"
              prefix=""
              placeholder="Flat, street, area"
              value={state.addr}
              state={addrTouched && !addrValid ? 'error' : 'default'}
              errorText={addrTouched && !addrValid ? 'This field is required' : undefined}
              onChange={(e) => {
                update({ addr: e.target.value });
              }}
              onBlur={() => {
                setAddrTouched(true);
              }}
              autoComplete="street-address"
            />
            <AlTextField
              id="ship-line2"
              label="Landmark / area"
              prefix=""
              placeholder="Near City Mall"
              value={state.line2}
              state={line2Touched && !line2Valid ? 'error' : 'default'}
              errorText={line2Touched && !line2Valid ? 'This field is required' : undefined}
              onChange={(e) => {
                update({ line2: e.target.value });
              }}
              onBlur={() => {
                setLine2Touched(true);
              }}
              autoComplete="address-line2"
            />
            <div className={styles.row}>
              <AlTextField
                id="ship-pin"
                label="PIN code"
                prefix=""
                placeholder="122001"
                inputMode="numeric"
                value={state.pin}
                readOnly={pinLocked}
                className={cn(pinLocked && styles.locked)}
                state={pinTouched && !pinValid ? 'error' : 'default'}
                errorText={
                  pinTouched && !pinValid
                    ? `Enter a ${String(PIN_LENGTH)}-digit PIN code`
                    : undefined
                }
                onChange={(e) => {
                  update({ pin: e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH) });
                }}
                onBlur={() => {
                  setPinTouched(true);
                }}
                autoComplete="postal-code"
              />
              <AlTextField
                id="ship-city"
                label="City"
                prefix=""
                placeholder="Gurugram"
                value={state.city}
                readOnly={lockResolved}
                className={cn(lockResolved && styles.locked)}
                state={cityTouched && !cityValid ? 'error' : 'default'}
                errorText={cityTouched && !cityValid ? 'City is required' : undefined}
                onChange={(e) => {
                  update({ city: e.target.value });
                }}
                onBlur={() => {
                  setCityTouched(true);
                }}
                autoComplete="address-level2"
              />
            </div>
            <AlTextField
              id="ship-state"
              label="State"
              prefix=""
              placeholder="Haryana"
              value={state.region}
              readOnly={lockResolved}
              className={cn(lockResolved && styles.locked)}
              state={regionTouched && !regionValid ? 'error' : 'default'}
              errorText={regionTouched && !regionValid ? 'State is required' : undefined}
              onChange={(e) => {
                update({ region: e.target.value });
              }}
              onBlur={() => {
                setRegionTouched(true);
              }}
              autoComplete="address-level1"
            />
          </>
        ) : null}
      </div>

      <AlButton
        size="lg"
        radius="lg"
        variant="primary"
        className={styles.action}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        disabled={!addressOk || savingForm}
        onClick={() => {
          void handleFormContinue();
        }}
      >
        {savingForm ? 'Saving…' : 'Review order'}
      </AlButton>
    </StepShell>
  );
}

interface DeleteDialogProps {
  target: SavedAddress | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ target, deleting, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(next) => {
        if (!next && !deleting) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete this address?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this address? This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        {target ? (
          <div className={styles.deletePreview}>
            <span className={styles.addrName}>{target.name}</span>
            <span>
              {target.line1}
              {target.line2 ? `, ${target.line2}` : ''}, {target.city}, {target.state}{' '}
              {target.pincode}
            </span>
          </div>
        ) : null}

        <DialogFooter>
          <AlButton variant="secondary" radius="lg" onClick={onCancel} disabled={deleting}>
            No
          </AlButton>
          <AlButton variant="destructive" radius="lg" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </AlButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
