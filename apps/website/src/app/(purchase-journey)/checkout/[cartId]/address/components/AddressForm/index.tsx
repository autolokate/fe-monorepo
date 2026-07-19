'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Check, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddressAutocomplete } from '@/hooks/purchase';
import type { SavedAddress } from '../../../../../shared/services/checkout-api';
import styles from './index.module.css';

export interface AddressFormValues {
  /** 10 digits; may be '' when editing (keep the masked number on file). */
  mobile: string;
  /** May be '' when editing (keep the masked email on file). */
  email: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface AddressFormProps {
  mode: 'create' | 'edit';
  initial?: SavedAddress | null;
  /** 10-digit login number, prefilled for a new address. */
  defaultMobile?: string;
  submitting: boolean;
  onSubmit: (values: AddressFormValues) => void;
}

const MOBILE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<keyof AddressFormValues, string>>;

function buildInitial(
  mode: 'create' | 'edit',
  initial: SavedAddress | null | undefined,
  defaultMobile: string,
): AddressFormValues {
  if (mode === 'edit' && initial) {
    return {
      mobile: '',
      email: '',
      line1: initial.line1,
      line2: initial.line2 ?? '',
      pincode: initial.pincode,
      city: initial.city,
      state: initial.state,
      isDefault: initial.isDefault,
    };
  }
  return {
    mobile: defaultMobile,
    email: '',
    line1: '',
    line2: '',
    pincode: '',
    city: '',
    state: '',
    isDefault: false,
  };
}

export function AddressForm({
  mode,
  initial,
  defaultMobile = '',
  submitting,
  onSubmit,
}: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>(() =>
    buildInitial(mode, initial, defaultMobile),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [query, setQuery] = useState('');

  const { suggestions, search, resolve, reset } = useAddressAutocomplete();
  const showSuggestions = suggestions.length > 0;

  const set = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSearch = (next: string) => {
    setQuery(next);
    search(next);
  };

  const handlePick = async (placeId: string) => {
    const resolved = await resolve(placeId);
    if (!resolved) return;
    setValues((prev) => ({
      ...prev,
      line1: resolved.line1,
      line2: resolved.line2 ?? prev.line2,
      city: resolved.city ?? prev.city,
      state: resolved.state ?? prev.state,
      pincode: resolved.pincode ?? prev.pincode,
    }));
    setErrors({});
    setQuery('');
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (mode === 'create') {
      if (!MOBILE_RE.test(values.mobile)) e.mobile = 'Enter a valid 10-digit number';
      if (!EMAIL_RE.test(values.email.trim())) e.email = 'Enter a valid email address';
    } else {
      if (values.mobile && !MOBILE_RE.test(values.mobile)) {
        e.mobile = 'Enter a valid 10-digit number';
      }
      if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) {
        e.email = 'Enter a valid email address';
      }
    }
    if (!values.line1.trim()) e.line1 = 'Enter the flat, house or street';
    if (!PIN_RE.test(values.pincode)) e.pincode = 'Enter a 6-digit pincode';
    if (!values.city.trim()) e.city = 'Enter the city';
    if (!values.state.trim()) e.state = 'Enter the state';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    reset();
    onSubmit(values);
  };

  const mobilePlaceholder = useMemo(
    () => (mode === 'edit' && initial ? `Keep ${initial.phoneMasked}` : '98765 43210'),
    [mode, initial],
  );

  const emailPlaceholder = useMemo(
    () =>
      mode === 'edit' && initial?.emailMasked ? `Keep ${initial.emailMasked}` : 'aarav@example.com',
    [mode, initial],
  );

  return (
    <div className={styles.form}>
      {/* Autocomplete search + suggestions */}
      <div className={styles.searchPopup}>
        <div className={styles.searchRow}>
          <Search className={styles.searchIcon} aria-hidden />
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            placeholder="Search your address"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            aria-label="Search address"
          />
        </div>

        {showSuggestions ? (
          <>
            <div className={styles.divider} />
            <ul className={styles.suggestions}>
              {suggestions.map((s) => (
                <li key={s.placeId}>
                  <button
                    type="button"
                    className={styles.suggestion}
                    onClick={() => void handlePick(s.placeId)}
                  >
                    <MapPin className={styles.suggestionIcon} aria-hidden />
                    <span className={styles.suggestionText}>
                      <span className={styles.suggestionPrimary}>{s.primary}</span>
                      {s.secondary ? (
                        <span className={styles.suggestionSecondary}>{s.secondary}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <Field label="Mobile number" error={errors.mobile}>
        <div className={cn(styles.inputBox, errors.mobile && styles.inputError)}>
          <span className={styles.prefix}>+91</span>
          <span className={styles.prefixDivider} />
          <input
            className={styles.bareInput}
            type="tel"
            inputMode="numeric"
            value={values.mobile}
            placeholder={mobilePlaceholder}
            onChange={(e) => {
              set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10));
            }}
          />
        </div>
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          className={cn(styles.input, errors.email && styles.inputError)}
          type="email"
          autoComplete="email"
          value={values.email}
          placeholder={emailPlaceholder}
          onChange={(e) => {
            set('email', e.target.value);
          }}
        />
      </Field>

      <Field label="Flat, house, street" error={errors.line1}>
        <input
          className={cn(styles.input, errors.line1 && styles.inputError)}
          type="text"
          value={values.line1}
          placeholder="42 Palm Grove"
          onChange={(e) => {
            set('line1', e.target.value);
          }}
        />
      </Field>

      <Field label="Landmark (optional)">
        <input
          className={styles.input}
          type="text"
          value={values.line2}
          placeholder="Near the market"
          onChange={(e) => {
            set('line2', e.target.value);
          }}
        />
      </Field>

      <div className={styles.pcsRow}>
        <Field label="Pincode" error={errors.pincode}>
          <input
            className={cn(styles.input, errors.pincode && styles.inputError)}
            type="text"
            inputMode="numeric"
            value={values.pincode}
            placeholder="400050"
            onChange={(e) => {
              set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6));
            }}
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input
            className={cn(styles.input, errors.city && styles.inputError)}
            type="text"
            value={values.city}
            placeholder="Mumbai"
            onChange={(e) => {
              set('city', e.target.value);
            }}
          />
        </Field>
      </div>

      <Field label="State" error={errors.state}>
        <input
          className={cn(styles.input, errors.state && styles.inputError)}
          type="text"
          value={values.state}
          placeholder="Maharashtra"
          onChange={(e) => {
            set('state', e.target.value);
          }}
        />
      </Field>

      <button
        type="button"
        className={styles.defaultCheck}
        onClick={() => {
          set('isDefault', !values.isDefault);
        }}
        aria-pressed={values.isDefault}
      >
        <span className={cn(styles.checkbox, values.isDefault && styles.checkboxOn)} aria-hidden>
          {values.isDefault ? <Check className={styles.checkboxIcon} /> : null}
        </span>
        Make this my default address
      </button>

      <button type="button" className={styles.cta} onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Save address'}
        {!submitting ? <ArrowRight className={styles.ctaIcon} aria-hidden /> : null}
      </button>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}
