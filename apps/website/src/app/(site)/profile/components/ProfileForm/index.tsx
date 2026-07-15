'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Car,
  Check,
  CheckCircle2,
  Fuel,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Shield,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useUpdateProfile } from '@/hooks/auth';
import {
  MAX_CITY_ID,
  MAX_NAME,
  type ProfileFieldKey,
  type ProfileFormFields,
  type ProfileValidationErrors,
  validateProfileForm,
} from '@/lib/profile/validation';
import type { AuthUser, UpdateProfilePayload } from '@/services/auth/types';
import { CommaTagInput } from './CommaTagInput';
import { FIELD_ERROR_BORDER, LABEL } from './constants';

interface ProfileFormProps {
  user: AuthUser;
  onSaved?: (user: AuthUser) => void;
}

const SECTION_IDS = [
  'section-account',
  'section-driving',
  'section-budget',
  'section-vehicle',
  'section-review',
] as const;

/** Catalogue is cars-only for now — keep category locked in UI and payloads. */
const LOCKED_VEHICLE_CATEGORY = 'car' as const;

const NAV_ITEMS = [
  {
    id: 'section-account',
    step: '01',
    label: 'Account',
    Icon: User,
  },
  {
    id: 'section-driving',
    step: '02',
    label: 'Driving Preferences',
    Icon: Car,
  },
  {
    id: 'section-budget',
    step: '03',
    label: 'Budget',
    Icon: IndianRupee,
  },
  {
    id: 'section-vehicle',
    step: '04',
    label: 'Vehicle preferences',
    Icon: Fuel,
  },
  {
    id: 'section-review',
    step: '05',
    label: 'Save Profile',
    Icon: CheckCircle2,
  },
] as const;

export function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const router = useRouter();
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0]);

  const initial = useMemo<ProfileFormFields>(
    () => ({
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
      city_id: user.city_id ?? '',
      budget_min: user.budget_min != null ? String(user.budget_min) : '',
      budget_max: user.budget_max != null ? String(user.budget_max) : '',
      preferred_fuel_types: Array.isArray(user.preferred_fuel_types)
        ? user.preferred_fuel_types.join(', ')
        : '',
      preferred_body_types: Array.isArray(user.preferred_body_types)
        ? user.preferred_body_types.join(', ')
        : '',
      preferred_vehicle_category: LOCKED_VEHICLE_CATEGORY,
    }),
    [user],
  );

  const [form, setForm] = useState<ProfileFormFields>(initial);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});

  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial]);

  const update = useUpdateProfile({
    successToast: 'Profile updated successfully.',
    onSuccess: (next) => onSaved?.(next),
  });

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    const panel = mainScrollRef.current;
    setActiveSection(id);
    if (!el) return;
    if (panel?.contains(el)) {
      const top =
        el.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
      panel.scrollTo({ top: Math.max(0, top - 16), behavior: 'smooth' });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  function clearError(key: ProfileFieldKey) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const cp = { ...prev };
      delete cp[key];
      return cp;
    });
  }

  function patch<K extends ProfileFieldKey>(key: K, value: ProfileFormFields[K]) {
    clearError(key);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checked = validateProfileForm(form);
    if (!checked.ok) {
      setErrors(checked.errors);
      const first = Object.values(checked.errors)[0];
      toast.error(first ?? 'Check the highlighted fields.');
      return;
    }
    setErrors({});

    const phoneCompact = form.phone.trim().replace(/\s/g, '');
    const minRaw = form.budget_min.trim();
    const maxRaw = form.budget_max.trim();

    const payload: UpdateProfilePayload = {
      full_name: form.full_name.trim() || undefined,
      phone: phoneCompact || undefined,
      city_id: form.city_id.trim() || null,
      budget_min: minRaw ? Number(minRaw) : null,
      budget_max: maxRaw ? Number(maxRaw) : null,
      preferred_fuel_types: checked.fuelPayload,
      preferred_body_types: checked.bodyPayload,
      preferred_vehicle_category: LOCKED_VEHICLE_CATEGORY,
    };

    void update.mutate(payload);
  }

  const saving = update.isLoading;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <Button
            asChild
            size="icon"
            variant="outline"
            className="h-11 w-11 shrink-0 border-primary/35 bg-card/70 backdrop-blur-sm hover:bg-card/90"
            aria-label="Back to home"
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
          <div className="min-w-0 space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Edit Profile
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Update your details and preferences to get the most relevant car recommendations.
            </p>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none hidden shrink-0 select-none lg:flex lg:h-28 lg:w-40 lg:items-center lg:justify-center"
        >
          <div className="relative flex h-full w-full items-center justify-center opacity-90">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
            <Car
              className="relative z-10 h-16 w-16 text-primary drop-shadow-[0_0_18px_rgba(15,23,42,0.35)]"
              strokeWidth={1.25}
            />
          </div>
        </div>
      </header>

      <Card className="flex flex-col overflow-hidden border-primary/30 bg-card/80 text-card-foreground shadow-[0_0_48px_-16px_rgba(15,23,42,0.18)] backdrop-blur-md sm:rounded-[1.25rem] lg:h-[min(56rem,calc(100dvh-13rem))] lg:min-h-0 lg:flex-row lg:items-stretch lg:overflow-hidden">
        <aside className="flex shrink-0 flex-col border-b border-border/60 bg-muted/15 p-5 lg:h-full lg:w-[280px] lg:min-w-[220px] lg:flex-shrink-0 lg:justify-between lg:overflow-hidden lg:border-r lg:border-b-0 lg:p-6">
          <nav className="space-y-1" aria-label="Profile sections">
            {NAV_ITEMS.map(({ id, step, label, Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition',
                    active
                      ? 'bg-primary/15 text-primary shadow-[inset_3px_0_0_0_var(--color-primary)]'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                      active
                        ? 'border-primary/40 bg-primary/20'
                        : 'border-primary/30 bg-primary/10',
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
                      {step}
                    </span>
                    <span className="font-medium">{label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-4 text-center text-xs leading-relaxed text-muted-foreground lg:mt-0">
            <Shield className="mx-auto mb-2 block h-5 w-5 text-primary" aria-hidden />
            <p>
              Your information is safe. We never share your data with anyone.{' '}
              <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </aside>

        <div
          ref={mainScrollRef}
          id="profile-form-scroll"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-8 lg:h-full lg:max-h-full lg:p-10"
          role="region"
          aria-label="Profile form fields"
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            <section id="section-account" className="scroll-mt-28 space-y-6">
              <BlockHeading
                title="Account details"
                description="Basic information to personalize your experience."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-primary"
                      aria-hidden
                    >
                      <User className="h-4 w-4 shrink-0" />
                    </span>
                    <Input
                      id="full_name"
                      autoComplete="name"
                      maxLength={MAX_NAME}
                      placeholder="e.g. Rahul Sharma"
                      aria-invalid={Boolean(errors.full_name)}
                      disabled={saving}
                      className={cn(
                        'h-11 pl-10 text-[0.9375rem]',
                        errors.full_name && FIELD_ERROR_BORDER,
                      )}
                      value={form.full_name}
                      onChange={(e) => patch('full_name', e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Phone number" htmlFor="phone" error={errors.phone}>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-primary"
                      aria-hidden
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={22}
                      placeholder="e.g. +91 88765 43210"
                      aria-invalid={Boolean(errors.phone)}
                      disabled={saving}
                      className={cn(
                        'h-11 pl-10 text-[0.9375rem]',
                        errors.phone && FIELD_ERROR_BORDER,
                      )}
                      value={form.phone}
                      onChange={(e) => patch('phone', e.target.value)}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section id="section-driving" className="scroll-mt-28 space-y-6">
              <BlockHeading
                title="Driving preferences"
                description="Help us find the right cars available in your city."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="City"
                  htmlFor="city_id"
                  hint="Matches your marketplace city identifier when set."
                  error={errors.city_id}
                >
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-primary"
                      aria-hidden
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                    </span>
                    <Input
                      id="city_id"
                      maxLength={MAX_CITY_ID}
                      placeholder="Catalogue ref"
                      aria-invalid={Boolean(errors.city_id)}
                      disabled={saving}
                      className={cn(
                        'h-11 pl-10 text-[0.9375rem]',
                        errors.city_id && FIELD_ERROR_BORDER,
                      )}
                      value={form.city_id}
                      onChange={(e) => patch('city_id', e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Vehicle category" htmlFor="preferred_vehicle_category">
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-primary"
                      aria-hidden
                    >
                      <Car className="h-4 w-4 shrink-0" />
                    </span>
                    <Select value={LOCKED_VEHICLE_CATEGORY} disabled>
                      <SelectTrigger
                        id="preferred_vehicle_category"
                        aria-label="Vehicle category (cars only)"
                        className="h-11 cursor-not-allowed items-center pl-10 pr-9 text-[0.9375rem] opacity-90"
                        disabled
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>
            </section>

            <section id="section-budget" className="scroll-mt-28 space-y-6">
              <BlockHeading
                title="Budget range (₹)"
                description="Set your budget range to see the best options."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Minimum budget" htmlFor="budget_min" error={errors.budget_min}>
                  <InrAmountInput
                    id="budget_min"
                    value={form.budget_min}
                    onChange={(v) => patch('budget_min', v)}
                    disabled={saving}
                    hasError={Boolean(errors.budget_min)}
                  />
                </Field>
                <Field label="Maximum budget" htmlFor="budget_max" error={errors.budget_max}>
                  <InrAmountInput
                    id="budget_max"
                    value={form.budget_max}
                    onChange={(v) => patch('budget_max', v)}
                    disabled={saving}
                    hasError={Boolean(errors.budget_max)}
                  />
                </Field>
              </div>
            </section>

            <section id="section-vehicle" className="scroll-mt-28 space-y-6">
              <BlockHeading
                title="Fuel & body preferences"
                description="Select your preferred fuel type and body style."
              />
              <div className="space-y-6">
                <Field
                  label="Preferred fuels"
                  htmlFor="preferred_fuel_types"
                  error={errors.preferred_fuel_types}
                >
                  <CommaTagInput
                    id="preferred_fuel_types"
                    placeholder="Add fuel (e.g. cng, diesel) — press Enter"
                    value={form.preferred_fuel_types}
                    onChange={(v) => patch('preferred_fuel_types', v)}
                    disabled={saving}
                    hasError={Boolean(errors.preferred_fuel_types)}
                    aria-invalid={Boolean(errors.preferred_fuel_types)}
                    icon={<Fuel className="h-4 w-4" aria-hidden />}
                  />
                </Field>

                <Field
                  label="Preferred body styles"
                  htmlFor="preferred_body_types"
                  error={errors.preferred_body_types}
                >
                  <CommaTagInput
                    id="preferred_body_types"
                    placeholder="Add style (e.g. suv, hatchback) — press Enter"
                    value={form.preferred_body_types}
                    onChange={(v) => patch('preferred_body_types', v)}
                    disabled={saving}
                    hasError={Boolean(errors.preferred_body_types)}
                    aria-invalid={Boolean(errors.preferred_body_types)}
                    icon={<Car className="h-4 w-4" aria-hidden />}
                  />
                </Field>
              </div>
            </section>

            <div
              id="section-review"
              className="scroll-mt-28 flex flex-col-reverse gap-3 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-end sm:gap-3"
            >
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-muted-foreground hover:text-foreground"
                disabled={saving}
                onClick={() => router.push('/')}
              >
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 text-base font-semibold shadow-md"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    Save profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

function BlockHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={LABEL}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function InrAmountInput({
  id,
  value,
  onChange,
  disabled,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const display =
    focused || !value.trim() ? value : Number(value.replace(/\D/g, '')).toLocaleString('en-IN');

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-primary"
        aria-hidden
      >
        <IndianRupee className="h-4 w-4 shrink-0" />
      </span>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-invalid={hasError}
        placeholder="e.g. 5,00,000"
        className={cn('h-11 pl-10 text-[0.9375rem]', hasError && FIELD_ERROR_BORDER)}
        value={display}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      />
    </div>
  );
}
