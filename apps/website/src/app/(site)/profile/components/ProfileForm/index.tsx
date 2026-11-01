'use client';

import Link from 'next/link';
import { type SubmitEvent, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Phone, Save, Shield, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUpdateProfile } from '@/hooks/auth';
import { PROFILE_NAME_MAX, validateProfileName } from '@/lib/profile';
import { getSessionPhone } from '@/lib/session';
import { cn } from '@/lib/utils';
import type { Profile } from '@/services/auth';

interface ProfileFormProps {
  profile: Profile;
  onSaved?: (profile: Profile) => void;
}

const LABEL = 'text-sm font-semibold tracking-tight text-foreground';

function formatPhone(e164: string | null): string {
  if (!e164) return '';
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

/**
 * Edits the fields `PATCH /v1/profile` actually accepts. The backend profile is
 * name / locale / photo / username — it has no phone, city, budget or preference
 * fields, so the page no longer pretends to save them.
 */
export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [name, setName] = useState(profile.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setName(profile.name ?? '');
  }, [profile.name]);

  useEffect(() => {
    setPhone(formatPhone(getSessionPhone()));
  }, []);

  const update = useUpdateProfile({
    onSuccess: (saved) => {
      onSaved?.(saved);
    },
  });

  const dirty = name.trim() !== (profile.name ?? '').trim();

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = validateProfileName(name);
    setError(message);
    if (message || !dirty) return;
    void update.mutate({ name: name.trim() });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link href="/" aria-label="Back home">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
        <div className="min-w-0 space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your profile
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The name we use on your orders, deliveries and bookings.
          </p>
        </div>
      </header>

      <Card className="border-primary/30 bg-card/80 p-5 shadow-sm backdrop-blur-md sm:rounded-[1.25rem] sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="profile-name" className={LABEL}>
              Full name
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-primary"
                aria-hidden
              >
                <User className="h-4 w-4" />
              </span>
              <Input
                id="profile-name"
                autoComplete="name"
                maxLength={PROFILE_NAME_MAX}
                placeholder="e.g. Rahul Sharma"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'profile-name-error' : undefined}
                disabled={update.isLoading}
                className={cn(
                  'h-11 pl-10',
                  error && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30',
                )}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {error ? (
              <p id="profile-name-error" className="text-xs text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {phone ? (
            <div className="space-y-2">
              <p className={LABEL}>Mobile number</p>
              <p className="flex h-11 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" aria-hidden />
                {phone}
                <span className="ml-auto text-xs">Verified · used to sign in</span>
              </p>
            </div>
          ) : null}

          {profile.userName ? (
            <div className="space-y-2">
              <p className={LABEL}>Community username</p>
              <p className="flex h-11 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                @{profile.userName}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                We never share your data.{' '}
                <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </p>
            <Button
              type="submit"
              className="h-11 w-full gap-2 sm:w-auto"
              disabled={update.isLoading || !dirty}
            >
              {update.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {update.isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
