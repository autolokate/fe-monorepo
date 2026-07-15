'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequestOtp } from '@/hooks/auth';
import { AuthShell } from '../AuthShell';
import { BrandWordmark } from '../BrandWordmark';
import { PhoneField } from '../PhoneField';
import { PHONE_DIGITS, normalizePhoneDigits, toE164 } from '../constants';

const FIELD =
  'h-12 w-full rounded-xl border border-border/80 bg-background px-4 text-base text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');

  const requestOtp = useRequestOtp({
    onSuccess: (response, vars) => {
      if (!response.sent) {
        toast.error('Unable to send OTP. Please try again.');
        return;
      }
      toast.success(response.message || 'OTP sent successfully.');
      const q = new URLSearchParams();
      q.set('step', 'otp');
      q.set('phone', vars.phone);
      router.replace(`/auth/login?${q.toString()}`);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    const clean = normalizePhoneDigits(digits);

    if (trimmedName.length < 2) {
      toast.error('Please enter your full name.');
      return;
    }
    if (clean.length !== PHONE_DIGITS) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    void requestOtp.mutate({ phone: toE164(clean) });
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-8 inline-flex outline-none ring-offset-2 ring-offset-transparent transition hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <BrandWordmark className="h-8 w-auto sm:h-9" />
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          Create your account
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Sign up with your mobile number — we&apos;ll send a one-time code to verify it&apos;s you.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="signup-name" className="text-sm font-medium text-foreground">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={requestOtp.isLoading}
            className={FIELD}
          />
        </div>

        <PhoneField
          id="signup-phone"
          label="Mobile number"
          hint="We'll send a 6-digit OTP to verify your number."
          value={digits}
          onChange={setDigits}
          disabled={requestOtp.isLoading}
        />

        <Button
          type="submit"
          className="h-12 w-full gap-2 text-base font-semibold shadow-md [&_svg]:size-4"
          disabled={requestOtp.isLoading}
          size="lg"
        >
          {requestOtp.isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              <span>Sending code…</span>
            </>
          ) : (
            <>
              <Send aria-hidden />
              <span>Send OTP</span>
            </>
          )}
        </Button>
      </form>

      <div className="relative -mx-8 mt-9 sm:-mx-10">
        <div className="w-full border-t border-border/55" />
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card px-1.5 py-0.5 shadow-sm">
          <ShieldCheck className="size-3 text-primary" aria-hidden />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
